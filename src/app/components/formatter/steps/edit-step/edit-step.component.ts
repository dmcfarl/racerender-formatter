
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Session } from '../../race';
import { RaceService } from '../../race.service';
import { Loader } from "@googlemaps/js-api-loader";
import { environment } from '../../../../../environments/environment';
import { Column } from '../../reader/column';
import { Rounder } from '../../transform/rounder';
import { Bezier, Point } from "bezier-js";
import { Selection } from './selection';

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
  firstVertex: number = null;
  selections: Selection[] = [];
  editOddOverlayOptions: google.maps.PolylineOptions = {
    editable: false,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1,
    strokeWeight: 3,
    zIndex: 3
  };
  editEvenOverlayOptions: google.maps.PolylineOptions = {
    editable: false,
    geodesic: true,
    strokeColor: '#FFFFFF',
    strokeOpacity: 1,
    strokeWeight: 3,
    zIndex: 3
  };
  dragOverlayOptions: google.maps.PolylineOptions = {
    editable: false,
    geodesic: true,
    strokeColor: '#F57C00',
    strokeOpacity: 1,
    strokeWeight: 3,
    zIndex: 5
  };

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
      this.hideSegment();
    });
  }

  showOverlays() {
    this.lapChoices.forEach((lap: Lap) => lap.overlay.setOptions({zIndex: lap.id === this.displayLap.id ? 2 : 1}));
    this.hideSegment();
  }

  getOverlay(lap: Lap): google.maps.LatLngBounds {
    let bounds: google.maps.LatLngBounds = null;
    if (lap.overlay == null) {
      bounds = new google.maps.LatLngBounds();
      if (lap.editableData.length === 0) {
        this.extractEditableData(lap);
      }
      let polylineOptions: google.maps.PolylineOptions = {
        editable: false,//lap.id === this.displayLap.id,
        geodesic: true,
        strokeColor: lap.id === this.raceService.race.best.id ? '#00FF00' : '#FFFF00',
        strokeOpacity: 0.5,
        strokeWeight: 2
      };
      let path = new google.maps.Polyline(polylineOptions);

      lap.editableData.forEach((row: Object, index: number) => {
        let latitude = row["Latitude (deg)"];
        let longitude = row["Longitude (deg)"];
        let editIndex = this.getEditedDataIndex(index, lap);
        if (editIndex in lap.editedData) {
          // Data has been previously edited. Use the edited data.
          if ("Latitude (deg)" in lap.editedData[editIndex]) {
            latitude = lap.editedData[editIndex]["Latitude (deg)"];
          }
          if ("Longitude (deg)" in lap.editedData[editIndex]) {
            longitude = lap.editedData[editIndex]["Longitude (deg)"];
          }
        }
        let point = new google.maps.LatLng({ lat: latitude, lng: longitude });
        path.getPath().push(point);
        bounds.extend(point);
      });

      //google.maps.event.addListener(path.getPath(), 'set_at', (index: any) => { this.saveEditedVertex(index) });
      path.addListener("click", (event: google.maps.MapMouseEvent) => { this.showSegment(event) });

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
    let session: Session = this.raceService.race.sessions.find((session: Session) => session.laps.includes(lap));
    if (session.laps.indexOf(lap) === 0) {
      lap.editableData.push(...session.startBufferData);
    }
    lap.lapData.forEach((sectorData: Object[]) => {
      sectorData.forEach((row: Object) => {
        lap.editableData.push(row);
      })
    });
    if (session.laps.indexOf(lap) === (session.laps.length - 1)) {
      lap.editableData.push(...session.finishBufferData);
    }
  }

  initMap() {
    console.log("Map initialized.");
  }

  private getBearing(from: google.maps.LatLng, to: google.maps.LatLng): number {
    let bearing = Rounder.round(google.maps.geometry.spherical.computeHeading(from, to), 2);
    if (bearing < 0) {
      // Transform from -180 to 180 into 0 to 360 to match existing data
      bearing = 360 + bearing;
    }

    return bearing;
  }

  private getEditedDataIndex(index: any, lap: Lap = this.displayLap): any {
    if (index >= 0 && index < lap.editableData.length) {
      return lap.editableData[index]["UTC Time (s)"];
    }
    return null;
  }

  /**
   * Create a row at the index if not already created.  Only retrieve the edited values.
   * @param index 
   * @returns 
   */
  private getEditedRow(index: any): Object {
    let editIndex = this.getEditedDataIndex(index);
    // Create the object in the editedData section if not already created
    if (!(editIndex in this.displayLap.editedData)) {
      this.displayLap.editedData[editIndex] = {};
    }
    return this.displayLap.editedData[editIndex];
  }

  /**
   * Retrieve a row at the index, but don't create it if not already present.  Retrieve the underlying data and apply edits on top of it.
   * @param index 
   */
  private getEditableRow(index: any): Object {
    let editIndex = this.getEditedDataIndex(index);
    if (editIndex in this.displayLap.editedData) {
      return Object.assign({}, this.displayLap.editableData[index], this.displayLap.editedData[editIndex]);
    }
    return this.displayLap.editableData[index];
  }

  showSegment(event: google.maps.MapMouseEvent) {
    this.infoWindow.close();
    if (this.firstVertex == null) {
      this.firstVertex = this.findClosestVertex(event.latLng);
      this.showInfoWindow(this.firstVertex);
    } else if (this.selections.length === 0) {
      let secondVertex = this.findClosestVertex(event.latLng);
      let selection = new Selection(
        this.firstVertex < secondVertex ? this.firstVertex : secondVertex, 
        this.firstVertex < secondVertex ? secondVertex : this.firstVertex
      );
      this.selections.push(selection);
      this.initSelection(selection);
    } else {
      let nextVertex = this.findClosestVertex(event.latLng);
      if (nextVertex < this.selections[0].startVertex) {
        // Before first selection
        let selection = new Selection(nextVertex, this.selections[0].startVertex);
        this.selections.splice(0,0,selection);
        this.initSelection(selection);
      } else if (nextVertex > this.selections[this.selections.length - 1].endVertex) {
        // After last selection
        let selection = new Selection(this.selections[this.selections.length - 1].endVertex, nextVertex);
        this.selections.push(selection);
        this.initSelection(selection);
      } else {
        // Within an existing selection
        
        // Find the selection
        let selectionIndex = this.selections.findIndex((selection: Selection) => nextVertex > selection.startVertex && nextVertex < selection.endVertex);
        
        if (selectionIndex > 0) {
          google.maps.event.clearListeners(this.selections[selectionIndex - 1].endPoint, 'dragstart');
          google.maps.event.clearListeners(this.selections[selectionIndex - 1].endPoint, 'drag');
          google.maps.event.clearListeners(this.selections[selectionIndex - 1].endPoint, 'dragend');
          this.selections[selectionIndex - 1].endPoint.setMap(null);
          this.selections[selectionIndex - 1].endPoint = null;
        }
        let firstSelection = new Selection(this.selections[selectionIndex].startVertex, nextVertex);
        this.initSelection(firstSelection);
        let secondSelection = new Selection(nextVertex, this.selections[selectionIndex].endVertex);
        this.initSelection(secondSelection);
        let newSelections = [firstSelection, secondSelection];
        this.closeSelection(this.selections.splice(selectionIndex, 1, ...newSelections)[0]);
      }
      
      this.selections.forEach((selection: Selection, index: number) => {
        this.updateSelectionColor(selection, index);
        if (!selection.endPoint && index !== this.selections.length - 1) {
          this.initSelectionEndPoint(selection, this.selections[index + 1]);
        }
      });
    }
  }

  initSelection(selection: Selection) {
    selection.dragPoint = null;
    let path = new Array<google.maps.LatLng>();
    for (let i = selection.startVertex; i <= selection.endVertex; i++) {
      let point: google.maps.LatLng = this.displayLap.overlay.getPath().getAt(i);
      if (selection.dragPoint == null && i >= selection.startVertex + ((selection.endVertex - selection.startVertex) / 2)) {
        // Place marker in the middle
        selection.dragPoint = new google.maps.Marker({
          position: point,
          /*icon: { 
            path: google.maps.SymbolPath.CIRCLE,
            strokeWeight: 2,
            strokeColor: "#FF0000"
          },*/
          map: null,
          draggable: (i != selection.startVertex && i != selection.endVertex)
        });
        google.maps.event.addListener(selection.dragPoint, 'dragstart', (event: google.maps.MapMouseEvent) => { this.dragStartCurve(event, selection) });
        google.maps.event.addListener(selection.dragPoint, 'drag', (event: google.maps.MapMouseEvent) => { this.dragCurve(event, selection) });
        google.maps.event.addListener(selection.dragPoint, 'dragend', (event: google.maps.MapMouseEvent) => { this.dragEndCurve(event, selection) });
      }

      path.push(point);
    }
    
    selection.editOverlay = new google.maps.Polyline(this.editOddOverlayOptions);
    selection.editOverlay.setPath(path);
    selection.editOverlay.setMap(this.map);
    selection.editOverlay.addListener("click", (event: google.maps.MapMouseEvent) => { this.showSegment(event) });

    selection.dragOverlay = new google.maps.Polyline(this.dragOverlayOptions);
    selection.dragOverlay.setPath(path);
    selection.dragOverlay.setMap(null);

    selection.dragPoint.setMap(this.map);
  }

  initSelectionEndPoint(firstSelection: Selection, secondSelection: Selection) {
    firstSelection.endPoint = new google.maps.Marker({
      position: secondSelection.editOverlay.getPath().getAt(0),
      /*icon: { 
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 2,
        strokeColor: "#FF0000"
      },*/
      map: this.map,
      draggable: true
    });
    google.maps.event.addListener(firstSelection.endPoint, 'dragstart', 
      (event: google.maps.MapMouseEvent) => { this.dragStartEndPoint(event, firstSelection, secondSelection) });
    google.maps.event.addListener(firstSelection.endPoint, 'drag', 
      (event: google.maps.MapMouseEvent) => { this.dragEndPoint(event, firstSelection, secondSelection) });
    google.maps.event.addListener(firstSelection.endPoint, 'dragend', 
      (event: google.maps.MapMouseEvent) => { this.dragEndEndPoint(event, firstSelection, secondSelection) });
  }

  updateSelectionColor(selection: Selection, index: number) {
    selection.editOverlay.setOptions(index % 2 === 0 ? this.editEvenOverlayOptions : this.editOddOverlayOptions);
  }

  closeSelection(selection: Selection) {
    google.maps.event.clearListeners(selection.dragPoint, 'dragstart');
    google.maps.event.clearListeners(selection.dragPoint, 'drag');
    google.maps.event.clearListeners(selection.dragPoint, 'dragend');
    selection.editOverlay.setMap(null);
    selection.dragOverlay.setMap(null);
    selection.dragPoint.setMap(null);
    if (selection.endPoint) {
      google.maps.event.clearListeners(selection.endPoint, 'dragstart');
      google.maps.event.clearListeners(selection.endPoint, 'drag');
      google.maps.event.clearListeners(selection.endPoint, 'dragend');
      selection.endPoint.setMap(null);
      selection.endPoint = null;
    }
  }

  private dragStartCurve(event: google.maps.MapMouseEvent, selection: Selection) {
    selection.dragOverlay.setMap(this.map);
  }

  private dragCurve(event: google.maps.MapMouseEvent, selection: Selection): Array<google.maps.LatLng> {
    return this.drawDragCurve(selection, 
      selection.editOverlay.getPath().getAt(0), 
      event.latLng, 
      selection.editOverlay.getPath().getAt(selection.editOverlay.getPath().getLength() - 1)
    );
  }

  private drawDragCurve(selection: Selection, startPoint: google.maps.LatLng, curvePoint: google.maps.LatLng, endPoint: google.maps.LatLng): Array<google.maps.LatLng>  {
    let path = new Array<google.maps.LatLng>();

    let distanceToStart = google.maps.geometry.spherical.computeLength([startPoint, curvePoint]);
    let distanceToEnd = google.maps.geometry.spherical.computeLength([curvePoint, endPoint]);
    let t = distanceToStart / (distanceToStart + distanceToEnd);

    let bezier: Bezier = Bezier.quadraticFromPoints(
      { x: startPoint.lng(), y: startPoint.lat() }, 
      { x: curvePoint.lng(), y: curvePoint.lat() }, 
      { x: endPoint.lng(), y: endPoint.lat() }, 
      t);
    let curvePoints: Point[] = bezier.getLUT(Math.round((selection.endVertex - selection.startVertex) / 5));

    curvePoints.forEach((point: Point) => path.push(new google.maps.LatLng({ lat: point.y, lng: point.x })));

    selection.dragOverlay.setPath(path);

    return path;
  }

  private dragEndCurve(event: google.maps.MapMouseEvent, selection: Selection): Array<google.maps.LatLng> {
    selection.dragOverlay.setMap(null);

    return this.getFinalCurve(selection, 
      selection.editOverlay.getPath().getAt(0), 
      event.latLng, 
      selection.editOverlay.getPath().getAt(selection.editOverlay.getPath().getLength() - 1)
    );
  }

  private getFinalCurve(selection: Selection, startPoint: google.maps.LatLng, curvePoint: google.maps.LatLng, endPoint: google.maps.LatLng): Array<google.maps.LatLng> {
    let path = new Array<google.maps.LatLng>();

    let distanceToStart = google.maps.geometry.spherical.computeLength([startPoint, curvePoint]);
    let distanceToEnd = google.maps.geometry.spherical.computeLength([curvePoint, endPoint]);
    let t = distanceToStart / (distanceToStart + distanceToEnd);

    let bezier = Bezier.quadraticFromPoints(
      { x: startPoint.lng(), y: startPoint.lat() }, 
      { x: curvePoint.lng(), y: curvePoint.lat() }, 
      { x: endPoint.lng(), y: endPoint.lat() }, 
      t);

    let firstRow = this.getEditableRow(selection.startVertex);
    let lastRow = this.getEditableRow(selection.startVertex + selection.editOverlay.getPath().getLength() - 1);
    let startTime = firstRow["UTC Time (s)"];
    let totalArea = 0;
    let areas : number[] = [];
    
    // Find total area of speed*time
    selection.editOverlay.getPath().forEach((value: google.maps.LatLng, index: number) => {
      let editableRow = this.getEditableRow(selection.startVertex + index);
      let nextRow = this.getEditableRow(selection.startVertex + index + 1); // TODO: Handle last point?
      let area = ((nextRow["UTC Time (s)"] - startTime) - (editableRow["UTC Time (s)"] - startTime)) * editableRow["Speed (mph) *obd"];
      if (index > 0) {
        totalArea += area;
      }
      areas.push(totalArea);
    });

    let previousPoint = this.displayLap.overlay.getPath().getAt(selection.startVertex - 1);
    selection.editOverlay.getPath().forEach((value: google.maps.LatLng, index: number) => {
      let t = areas[index] / totalArea;
      // Find point on the curve
      let point: Point = bezier.get(t);

      // Edit row values
      let editRow = this.getEditedRow(selection.startVertex + index);
      editRow["Latitude (deg)"] = point.y;
      editRow["Longitude (deg)"] = point.x;
      let latLng: google.maps.LatLng = new google.maps.LatLng({ lat: point.y, lng: point.x });
      editRow["Bearing (deg)"] = this.getBearing(previousPoint, latLng);
      previousPoint = latLng;
      path.push(latLng);
    });

    let newLapPath = this.displayLap.overlay.getPath().getArray().slice(0, selection.startVertex).concat(...path, ...this.displayLap.overlay.getPath().getArray().slice(selection.endVertex + 1));
    this.displayLap.overlay.setPath(newLapPath);
    selection.editOverlay.setPath(path);

    return path;
  }

  private dragStartEndPoint(event: google.maps.MapMouseEvent, firstSelection: Selection, secondSelection: Selection) {
    firstSelection.dragOverlay.setMap(this.map);

    secondSelection.dragOverlay.setMap(this.map);
  }

  private dragEndPoint(event: google.maps.MapMouseEvent, firstSelection: Selection, secondSelection: Selection) {
    // Draw changes to first selection
    this.drawDragCurve(firstSelection, 
      firstSelection.editOverlay.getPath().getAt(0), 
      firstSelection.dragPoint.getPosition(), 
      event.latLng
    );
    // Draw changes to second selection
    this.drawDragCurve(secondSelection, 
      event.latLng, 
      secondSelection.dragPoint.getPosition(), 
      secondSelection.editOverlay.getPath().getAt(secondSelection.editOverlay.getPath().getLength() - 1)
    );
  }

  private dragEndEndPoint(event: google.maps.MapMouseEvent, firstSelection: Selection, secondSelection: Selection) {
    firstSelection.dragOverlay.setMap(null);
    secondSelection.dragOverlay.setMap(null);

    // Save changes to first selection
    this.getFinalCurve(firstSelection, 
      firstSelection.editOverlay.getPath().getAt(0), 
      firstSelection.dragPoint.getPosition(), 
      event.latLng
    );

    // Save changes to second selection
    this.getFinalCurve(secondSelection, 
      event.latLng, 
      secondSelection.dragPoint.getPosition(), 
      secondSelection.editOverlay.getPath().getAt(secondSelection.editOverlay.getPath().getLength() - 1)
    );
  }

  hideSegment() {
    this.firstVertex = null;
    this.selections.forEach((selection: Selection) => this.closeSelection(selection));
    this.selections = [];
  }

  showInfoWindow(vertex: number) {
    this.infoWindow.close();
    let row = vertex in this.displayLap.editedData ? Object.assign({}, this.displayLap.editableData[vertex], this.displayLap.editedData[vertex]) : this.displayLap.editableData[vertex];
    this.infoWindow = new google.maps.InfoWindow({
      content: `<div style="color: black;"><p>Index: ${vertex}<br/>Edit Index: ${row["UTC Time (s)"]}<br/>Time: ${row["Time (s)"]}<br/>Lat: ${row["Latitude (deg)"]}<br/>Lng: ${row["Longitude (deg)"]}<br/>Bear: ${row["Bearing (deg)"]}</p></div>`,
      position: this.displayLap.overlay.getPath().getAt(vertex)
    });
    this.infoWindow.open(this.map);
  }

  private findClosestVertex(latLng: google.maps.LatLng) : number {
    let vertex: number = 0;
    let vertexDistance: number = -1;
    this.displayLap.overlay.getPath().forEach((editPoint: google.maps.LatLng, index: number) => {
      let distance = google.maps.geometry.spherical.computeDistanceBetween(editPoint, latLng);
      if (vertexDistance === -1 || distance < vertexDistance) {
        vertex = index;
        vertexDistance = distance;
      }
    });

    return vertex;
  }
}
