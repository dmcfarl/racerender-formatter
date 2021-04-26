
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Session } from '../../race';
import { RaceService } from '../../race.service';
import { Loader } from "@googlemaps/js-api-loader";
import { environment } from '../../../../../environments/environment';
import { Column } from '../../reader/column';
import { Rounder } from '../../transform/rounder';

@Component({
  selector: 'app-edit-step',
  templateUrl: './edit-step.component.html',
  styleUrls: ['./edit-step.component.css']
})
export class EditStepComponent implements OnInit {
  overlays: any[];
  map: google.maps.Map;
  displayLap: Lap;
  editFields: Column[];
  editField: Column;
  lapChoices: Lap[];
  mapBounds: google.maps.LatLngBounds;
  infoWindow: google.maps.InfoWindow;

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
    if (this.raceService.csvData == null) {
      this.router.navigate(['formatter/upload-step']);
    }
    this.lapChoices = [].concat(...this.raceService.race.sessions.filter((session: Session) => session.isExport).map(session => session.laps));
    this.displayLap = this.raceService.race.best;
    this.editFields = this.raceService.csvData.columns;
  }

  nextPage() {
    this.router.navigate(['formatter/download-step']);
  }

  prevPage() {
    this.router.navigate(['formatter/laps-step']);
  }

  editFieldChange() {
    if (this.editField.exportName === "Latitude (deg)" || this.editField.exportName === "Longitude (deg)") {
      this.loadGoogleMaps();
      // Hide any charts
    } else {
      // Hide Map
      // Show chart
    }
  }

  loadGoogleMaps(): void {
    if (window.google && window.google.maps && window.google.maps.version) {
      this.displayMap();
    } else {
      const loader = new Loader({
        apiKey: environment.GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["drawing", "geometry"]
      });

      loader.load().then(() => this.displayMap());
    }
  }

  displayMap(): void {
    this.lapChoices.forEach((lap: Lap) => this.mapBounds = this.getOverlay(lap));
    let options: google.maps.MapOptions = {
      fullscreenControl: false,
      mapTypeId: "satellite",
      streetViewControl: false,
      zoom: 15,
    };
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, options);
    this.lapChoices.forEach((lap: Lap) => lap.overlay.setMap(this.map));
    this.map.fitBounds(this.mapBounds);
    this.infoWindow = new google.maps.InfoWindow();
    this.map.addListener("click", (event: google.maps.MapMouseEvent) => {
      this.infoWindow.close();
    });
  }

  showOverlays() {
    this.lapChoices.forEach((lap: Lap) => lap.overlay.setEditable(lap.id === this.displayLap.id));
  }

  getOverlay(lap: Lap): google.maps.LatLngBounds {
    let bounds: google.maps.LatLngBounds = null;
    if (lap.overlay == null) {
      bounds = new google.maps.LatLngBounds();
      if (lap.editableData.length === 0) {
        this.extractEditableData(lap);
      }
      let polylineOptions: google.maps.PolylineOptions = {
        editable: lap.id === this.displayLap.id,
        geodesic: true,
        strokeColor: lap.id === this.raceService.race.best.id ? '#00FF00' : '#FFFF00',
        strokeOpacity: 0.5,
        strokeWeight: 2
      };
      let path = new google.maps.Polyline(polylineOptions);

      lap.editableData.forEach((row: Object, index: number) => {
        let latitude = row["Latitude (deg)"];
        let longitude = row["Longitude (deg)"];
        if (index in lap.editedData) {
          // Data has been previously edited. Use the edited data.
          if ("Latitude (deg)" in lap.editedData[index]) {
            latitude = lap.editedData[index]["Latitude (deg)"];
          }
          if ("Longitude (deg)" in lap.editedData[index]) {
            longitude = lap.editedData[index]["Longitude (deg)"];
          }
        }
        let point = new google.maps.LatLng({ lat: latitude, lng: longitude });
        path.getPath().push(point);
        bounds.extend(point);
      });

      google.maps.event.addListener(path.getPath(), 'set_at', (index: any) => { this.saveEditedVertex(index) });
      path.addListener("click", (event: google.maps.PolyMouseEvent) => { this.showInfoWindow(event) });

      path.setMap(this.map);
      path.getPath().getAt(1729)
      lap.overlay = path;
    }

    if (bounds == null) {
      bounds = this.getBoundsFromLap(lap);
    }

    return bounds;
  }

  getBoundsFromLap(lap: Lap): google.maps.LatLngBounds {
    let bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();

    lap.editableData.forEach((row: Object) => {
      let point = new google.maps.LatLng({ lat: row["Latitude (deg)"], lng: row["Longitude (deg)"] });
      bounds.extend(point);
    });

    return bounds;
  }

  extractEditableData(lap: Lap) {
    lap.lapData.forEach((sectorData: Object[]) => {
      sectorData.forEach((row: Object) => {
        lap.editableData.push(row);
      })
    });
  }

  initMap() {
    console.log("Map initialized.");
  }

  saveEditedVertex(index: any) {
    if (!(index in this.displayLap.editedData)) {
      this.displayLap.editedData[index] = {};
    }
    let editedRow = this.displayLap.editedData[index];
    editedRow["Latitude (deg)"] = this.displayLap.overlay.getPath().getAt(index).lat();
    editedRow["Longitude (deg)"] = this.displayLap.overlay.getPath().getAt(index).lng();
    if (index > 0) {
      // Set the heading of the previous point
      if (!((index - 1) in this.displayLap.editedData)) {
        this.displayLap.editedData[(index - 1)] = {};
      }
      let previousRow = this.displayLap.editedData[(index - 1)];
      previousRow["Bearing (deg)"] = Rounder.round(google.maps.geometry.spherical.computeHeading(
        this.displayLap.overlay.getPath().getAt(index - 1),
        this.displayLap.overlay.getPath().getAt(index)
      ), 2);
      if (previousRow["Bearing (deg)"] < 0) {
        // Transform from -180 to 180 into 0 to 360 to match existing data
        previousRow["Bearing (deg)"] = 360 + previousRow["Bearing (deg)"];
      }
    }
    if (index < this.displayLap.editableData.length - 1) {
      // Set the heading of the current point
      editedRow["Bearing (deg)"] = Rounder.round(google.maps.geometry.spherical.computeHeading(
        this.displayLap.overlay.getPath().getAt(index),
        this.displayLap.overlay.getPath().getAt(index + 1)
      ), 2);
      if (editedRow["Bearing (deg)"] < 0) {
        // Transform from -180 to 180 into 0 to 360 to match existing data
        editedRow["Bearing (deg)"] = 360 + editedRow["Bearing (deg)"];
      }
    }
  }

  showInfoWindow(event: google.maps.PolyMouseEvent) {
    this.infoWindow.close();
    this.infoWindow = new google.maps.InfoWindow({
      content: '<div style="color: black;"><h1>Hello World!</h1></div>',
      position: this.displayLap.overlay.getPath().getAt(event.vertex)
    });
    this.infoWindow.open(this.map);
  }
}
