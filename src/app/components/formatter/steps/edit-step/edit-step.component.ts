
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Session } from '../../race';
import { RaceService } from '../../race.service';
import { Loader } from "@googlemaps/js-api-loader";
import { environment } from '../../../../../environments/environment';
import { Column } from '../../reader/column';

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

      lap.editableData.forEach((row: Object) => {
        let point = new google.maps.LatLng({ lat: row["Latitude (deg)"], lng: row["Longitude (deg)"] });
        path.getPath().push(point);
        bounds.extend(point);
      });

      google.maps.event.addListener(path.getPath(), 'set_at', (index: any) => { this.saveEditedVertex(index) });

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
    if (!this.displayLap.editedData.has(index)) {
      this.displayLap.editedData.set(index, {});
    }
    let editedRow = this.displayLap.editedData.get(index);
    editedRow["Latitude (deg)"] = this.displayLap.overlay.getPath().getAt(index).lat;
    editedRow["Longitude (deg)"] = this.displayLap.overlay.getPath().getAt(index).lng;
  }
}
