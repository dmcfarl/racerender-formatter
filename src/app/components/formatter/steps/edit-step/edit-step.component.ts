
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Session } from '../../race';
import { RaceService } from '../../race.service';
import { Loader } from "@googlemaps/js-api-loader";
import { environment } from '../../../../../environments/environment';
import { Column } from '../../reader/column';
import { Rounder } from '../../transform/rounder';
import { Bezier, Point } from "bezier-js";

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
  secondVertex: number = null;
  dragPoint: google.maps.Marker = null;
  editOverlay: google.maps.Polyline;
  dragOverlay: google.maps.Polyline;
  debugPolygons: google.maps.Polygon[];

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
    const lineControlDiv = document.createElement("div");
    lineControlDiv.style.clear = "both";

    // Set CSS for the control border
    const lineUI = document.createElement("div");
    lineUI.id = "lineUI";
    lineUI.title = "Click to transform the selection into a line";
    lineUI.style.backgroundColor = "#fff";
    lineUI.style.border = "2px solid #fff";
    lineUI.style.borderRadius = "3px";
    lineUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    lineUI.style.cursor = "pointer";
    lineUI.style.marginTop = "8px";
    lineUI.style.marginBottom = "22px";
    lineUI.style.textAlign = "center";
    lineUI.title = "Click to recenter the map";
    lineControlDiv.appendChild(lineUI);

    // Set CSS for the control interior
    const lineText = document.createElement("div");
    lineText.id = "lineText";
    lineText.style.color = "rgb(25,25,25)";
    lineText.style.fontFamily = "Roboto,Arial,sans-serif";
    lineText.style.fontSize = "16px";
    lineText.style.lineHeight = "38px";
    lineText.style.paddingLeft = "5px";
    lineText.style.paddingRight = "5px";
    lineText.innerHTML = "Line";
    lineUI.appendChild(lineText);

    lineUI.addEventListener("click", () => {
      if (this.firstVertex != null && this.secondVertex != null) {
        this.saveEditOverlay(0);
      }
    });

    this.lapChoices.forEach((lap: Lap) => lap.overlay.setMap(this.map));
    this.map.fitBounds(this.mapBounds);
    this.infoWindow = new google.maps.InfoWindow();
    this.map.addListener("click", (event: google.maps.MapMouseEvent) => {
      this.infoWindow.close();
      this.hideSegment();
    });
    let polylineOptions: google.maps.PolylineOptions = {
      editable: false,
      geodesic: true,
      strokeColor: '#F57C00',
      strokeOpacity: 1,
      strokeWeight: 3,
      visible: false
    };
    this.editOverlay = new google.maps.Polyline(polylineOptions);
    let polylineDragOptions: google.maps.PolylineOptions = {
      editable: false,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1,
      strokeWeight: 3,
      visible: false
    };
    this.dragOverlay = new google.maps.Polyline(polylineDragOptions);

    // @ts-ignore
    lineControlDiv.index = 1;
    lineControlDiv.style.paddingTop = "10px";
    this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(lineControlDiv);
  }

  showOverlays() {
    this.lapChoices.forEach((lap: Lap) => lap.overlay.setOptions({zIndex: lap.id === this.displayLap.id ? 2 : 1}));
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

      google.maps.event.addListener(path.getPath(), 'set_at', (index: any) => { this.saveEditedVertex(index) });
      path.addListener("click", (event: google.maps.PolyMouseEvent) => { this.showSegment(event) });

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

  saveEditedVertex(index: any) {
    let editedRow = this.getEditedRow(index);
    editedRow["Latitude (deg)"] = this.displayLap.overlay.getPath().getAt(index).lat();
    editedRow["Longitude (deg)"] = this.displayLap.overlay.getPath().getAt(index).lng();
    this.setHeading(index);
  }

  private setHeading(index: any) {
    let editedRow = this.getEditedRow(index);
    let previousRow: Object = null;
    // Set heading.  Use an average of the previous heading and the current one in order to better smooth everything.
    if (index > 0) {
      // Set the heading of the previous point
      previousRow = this.getEditedRow(index - 1);
      previousRow["Bearing (deg)"] = this.getBearing(this.displayLap.overlay.getPath().getAt(index - 1),
        this.displayLap.overlay.getPath().getAt(index));
    }
    if (index < this.displayLap.editableData.length - 1) {
      // Set the heading of the current point
      if (previousRow == null) {
        previousRow = this.getEditableRow(index - 1);
      }
      editedRow["Bearing (deg)"] = this.getBearing(
        this.displayLap.overlay.getPath().getAt(index),
        this.displayLap.overlay.getPath().getAt(index + 1)
      );
      if (editedRow["Bearing (deg)"] < 0) {
        // Transform from -180 to 180 into 0 to 360 to match existing data
        editedRow["Bearing (deg)"] = 360 + editedRow["Bearing (deg)"];
      }
    }
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
   * Create a row at the index if not already created.
   * @param index 
   * @returns 
   */
  private getEditedRow(index: any): Object {
    let editIndex = this.getEditedDataIndex(index);
    // Create the object in the editedData section if not already created
    if (!(editIndex in this.displayLap.editedData)) {
      this.displayLap.editedData[editIndex] = { "UTC Time (s)": editIndex };
    }
    return this.displayLap.editedData[editIndex];
  }

  /**
   * Retrieve a row at the index, but don't create it if not already present.
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
    } else if (this.secondVertex == null) {
      this.secondVertex = this.findClosestVertex(event.latLng);
      let start = this.firstVertex < this.secondVertex ? this.firstVertex : this.secondVertex;
      let end = this.firstVertex < this.secondVertex ? this.secondVertex : this.firstVertex;
      this.firstVertex = start;
      this.secondVertex = end;

      if (this.dragPoint !== null) {
        this.dragPoint.setMap(null);
        google.maps.event.clearListeners(this.dragPoint, 'dragstart');
        google.maps.event.clearListeners(this.dragPoint, 'drag');
        google.maps.event.clearListeners(this.dragPoint, 'dragend');
        this.dragPoint = null;
      }
      let path = new Array<google.maps.LatLng>();
      for (let i = start; i <= end; i++) {
        let point: google.maps.LatLng = this.displayLap.overlay.getPath().getAt(i);
        if (this.dragPoint == null && i >= start + ((end - start) / 2)) {
          // Place marker in the middle
          this.dragPoint = new google.maps.Marker({
            position: point,
            /*icon: { 
              path: google.maps.SymbolPath.CIRCLE,
              strokeWeight: 2,
              strokeColor: "#FF0000"
            },*/
            map: null,
            draggable: (i != start && i != end)
          });
          google.maps.event.addListener(this.dragPoint, 'dragstart', (event: google.maps.MapMouseEvent) => { this.dragStartCurve(event) });
          google.maps.event.addListener(this.dragPoint, 'drag', (event: google.maps.MapMouseEvent) => { this.dragCurve(event) });
          google.maps.event.addListener(this.dragPoint, 'dragend', (event: google.maps.MapMouseEvent) => { this.dragEndCurve(event) });
        }

        path.push(point);
      }
      this.editOverlay.setPath(path);
      this.dragOverlay.setPath(path);
      //google.maps.event.addListener(this.editOverlay.getPath(), 'set_at', (index: any) => { this.saveEditOverlay(index) });
      this.editOverlay.setMap(this.map);
      this.dragOverlay.setMap(null);
      this.editOverlay.setVisible(true);
      this.dragOverlay.setVisible(false);
      this.dragPoint.setMap(this.map);
      this.dragPoint.setVisible(true);
    } else {
      this.hideSegment();
    }
  }

  saveEditOverlay(index: any) {
    let newEditPath: Array<google.maps.LatLng>;
    if (index == 0 || index == this.editOverlay.getPath().getLength() - 1) {
      newEditPath = this.createLine();
    } else {
      newEditPath = this.createCurve(index);
    }
    let newLapPath = this.displayLap.overlay.getPath().getArray().slice(0, this.firstVertex).concat(...newEditPath, ...this.displayLap.overlay.getPath().getArray().slice(this.secondVertex + 1));
    this.displayLap.overlay.setPath(newLapPath);
    this.editOverlay.setPath(newEditPath);
    google.maps.event.addListener(this.editOverlay.getPath(), 'set_at', (index: any) => { this.saveEditOverlay(index) });
  }

  private createLine(): Array<google.maps.LatLng> {
    if (this.debugPolygons) {
      this.debugPolygons.forEach((polygon: google.maps.Polygon) => polygon.setVisible(false));
    }
    let path = new Array<google.maps.LatLng>();
    // Create straight line
    let startPoint = this.editOverlay.getPath().getAt(0);
    let endPoint = this.editOverlay.getPath().getAt(this.editOverlay.getPath().getLength() - 1);
    let bearing = this.getBearing(startPoint, endPoint);
    for (let i = 0; i < this.editOverlay.getPath().getLength(); i++) {
      let point: google.maps.LatLng = google.maps.geometry.spherical.interpolate(startPoint, endPoint, i / (this.editOverlay.getPath().getLength() - 1));
      path.push(point);
      let editRow = this.getEditedRow(this.firstVertex + i);
      editRow["Latitude (deg)"] = point.lat();
      editRow["Longitude (deg)"] = point.lng();
      editRow["Bearing (deg)"] = bearing;
    }

    return path;
  }

  private dragStartCurve(event: google.maps.MapMouseEvent) {
    this.dragOverlay.setMap(this.map);
    this.dragOverlay.setVisible(true);
  }

  private dragCurve(event: google.maps.MapMouseEvent): Array<google.maps.LatLng> {
    let path = new Array<google.maps.LatLng>();

    let startPoint = this.editOverlay.getPath().getAt(0);
    let curvePoint = event.latLng;
    let endPoint = this.editOverlay.getPath().getAt(this.editOverlay.getPath().getLength() - 1);

    let distanceToStart = google.maps.geometry.spherical.computeLength([startPoint, curvePoint]);
    let distanceToEnd = google.maps.geometry.spherical.computeLength([curvePoint, endPoint]);
    let t = distanceToStart / (distanceToStart + distanceToEnd);

    let bezier = Bezier.quadraticFromPoints(
      { x: startPoint.lng(), y: startPoint.lat() }, 
      { x: curvePoint.lng(), y: curvePoint.lat() }, 
      { x: endPoint.lng(), y: endPoint.lat() }, 
      t);
    let curvePoints: Point[] = bezier.getLUT(20);

    curvePoints.forEach((point: Point) => path.push(new google.maps.LatLng({ lat: point.y, lng: point.x })));

    this.dragOverlay.setPath(path);

    return path;
  }

  // TODO: Swap to Markers, use this to create a standard curve underneath. Setup dragend that does t across all the nodes by time
  private dragEndCurve(event: google.maps.MapMouseEvent): Array<google.maps.LatLng> {
    this.dragOverlay.setVisible(false);
    this.dragOverlay.setMap(null);

    let path = new Array<google.maps.LatLng>();

    let startPoint = this.editOverlay.getPath().getAt(0);
    let curvePoint = event.latLng;
    let endPoint = this.editOverlay.getPath().getAt(this.editOverlay.getPath().getLength() - 1);

    let distanceToStart = google.maps.geometry.spherical.computeLength([startPoint, curvePoint]);
    let distanceToEnd = google.maps.geometry.spherical.computeLength([curvePoint, endPoint]);
    let t = distanceToStart / (distanceToStart + distanceToEnd);

    let bezier = Bezier.quadraticFromPoints(
      { x: startPoint.lng(), y: startPoint.lat() }, 
      { x: curvePoint.lng(), y: curvePoint.lat() }, 
      { x: endPoint.lng(), y: endPoint.lat() }, 
      t);

    let firstRow = this.getEditedRow(this.firstVertex);
    let lastRow = this.getEditedRow(this.firstVertex + this.editOverlay.getPath().getLength());
    let startTime = firstRow["UTC Time (s)"];
    let totalTime = lastRow["UTC Time (s)"] - startTime;

    let previousPoint = this.displayLap.overlay.getPath().getAt(this.firstVertex - 1);
    this.editOverlay.getPath().forEach((value: google.maps.LatLng, index: number) => {
      // Find point on the curve
      let editRow = this.getEditedRow(this.firstVertex + index);
      let t = (editRow["UTC Time (s)"] - startTime) / totalTime;
      let point: Point = bezier.get(t);

      // Edit row values
      editRow["Latitude (deg)"] = point.y;
      editRow["Longitude (deg)"] = point.x;
      let latLng: google.maps.LatLng = new google.maps.LatLng({ lat: point.y, lng: point.x });
      editRow["Bearing (deg)"] = this.getBearing(previousPoint, latLng);
      previousPoint = latLng;
      path.push(latLng);
    });

    let newLapPath = this.displayLap.overlay.getPath().getArray().slice(0, this.firstVertex).concat(...path, ...this.displayLap.overlay.getPath().getArray().slice(this.secondVertex + 1));
    this.displayLap.overlay.setPath(newLapPath);
    this.editOverlay.setPath(path);

    return path;
  }

  private createCurve(index: any): Array<google.maps.LatLng> {
    if (this.debugPolygons == null) {
      this.debugPolygons = new Array<google.maps.Polygon>();
      let polygonOptions: google.maps.PolygonOptions = {
        editable: true,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: .75,
        strokeWeight: 1
      };
      for (let i = 0; i < 4; i++) {
       this.debugPolygons.push(new google.maps.Polygon(polygonOptions));
      }
    }
    let path = new Array<google.maps.LatLng>();
    // Create a curved line
    // Compute using two separate halves since it's unlikely that the exact middle
    //  index was picked and that it was dragged to exactly the center of the curve.

    // Compute first half
    let startPoint = this.editOverlay.getPath().getAt(0);
    let curvePoint = this.editOverlay.getPath().getAt(index);
    let endPoint = this.editOverlay.getPath().getAt(this.editOverlay.getPath().getLength() - 1);

    // Triangle corresponding to startPoint/curvePoint/intersection with chord
    // Use this to find the actual chord length and the arc height using Law of Sines
    let bearingToEnd = this.getBearing(startPoint, endPoint);
    let bearingToCurve = this.getBearing(startPoint, curvePoint);
    let angleToCurve = bearingToEnd - bearingToCurve;
    let lengthToCurvePoint = google.maps.geometry.spherical.computeLength([startPoint, curvePoint]);
    let height = lengthToCurvePoint * Math.sin(this.degreesToRadians(Math.abs(angleToCurve))) / Math.sin(this.degreesToRadians(90));
    let halfLength = lengthToCurvePoint * Math.sin(this.degreesToRadians(90 - Math.abs(angleToCurve))) / Math.sin(this.degreesToRadians(90));

    // Compute the radius from the chord length and arc height
    let radius = Math.pow(halfLength * 2, 2) / (8 * height) + height / 2;

    // Find the origin of the circle
    let angleToOrigin = this.radiansToDegrees(Math.asin((radius - height) * Math.sin(this.degreesToRadians(90)) / radius));
    let curveOrigin = google.maps.geometry.spherical.computeOffset(startPoint, radius, bearingToEnd + (angleToCurve < 0 ? -1 : 1) * angleToOrigin);
    
    // Find the angles used for computing the offsets along the curve
    let originAngle = 90 - angleToOrigin;
    let originHeading = this.getBearing(curveOrigin, startPoint);
    
    // Double check that we end up in the right spot
    let lengthCheck = google.maps.geometry.spherical.computeLength([startPoint, google.maps.geometry.spherical.computeOffset(curveOrigin, radius, 
      originHeading + (angleToCurve < 0 ? -1 : 1) * (1 / (this.editOverlay.getPath().getLength() - index) * originAngle))]);
    if (lengthCheck > 3) {
      angleToCurve = angleToCurve * -1;
      angleToOrigin = this.radiansToDegrees(Math.asin((radius - height) * Math.sin(this.degreesToRadians(90)) / radius));
      curveOrigin = google.maps.geometry.spherical.computeOffset(startPoint, radius, bearingToEnd + (angleToCurve < 0 ? -1 : 1) * angleToOrigin);
      originAngle = 90 - angleToOrigin;
      originHeading = this.getBearing(curveOrigin, curvePoint);
    }
    let crossPoint = google.maps.geometry.spherical.computeOffset(curvePoint, height, this.getBearing(curvePoint, curveOrigin));
    this.debugPolygons[2].setPath([endPoint, curvePoint, crossPoint]);
    this.debugPolygons[2].setMap(this.map);
    this.debugPolygons[3].setPath([endPoint, curveOrigin, crossPoint]);
    this.debugPolygons[3].setMap(this.map);
    this.debugPolygons.forEach((polygon: google.maps.Polygon) => polygon.setVisible(true));

    // Add points along the circle
    // Add the initial starting point
    let previousPoint = this.displayLap.overlay.getPath().getAt(this.firstVertex - 1);
    let editRow = this.getEditedRow(this.firstVertex);
    editRow["Latitude (deg)"] = startPoint.lat();
    editRow["Longitude (deg)"] = startPoint.lng();
    editRow["Bearing (deg)"] = this.getBearing(previousPoint, startPoint);
    previousPoint = startPoint;
    path.push(startPoint);

    // Add all of the other points along the circle until index
    for (let i = 1; i <= index; i++) {
      let point = google.maps.geometry.spherical.computeOffset(curveOrigin, radius, originHeading + (angleToCurve < 0 ? -1 : 1) * (i / index * originAngle));
      editRow = this.getEditedRow(this.firstVertex + i);
      editRow["Latitude (deg)"] = point.lat();
      editRow["Longitude (deg)"] = point.lng();
      editRow["Bearing (deg)"] = this.getBearing(previousPoint, point);
      previousPoint = point;
      path.push(point);
    }

    // Compute second half
    
    // Triangle corresponding to endPoint/curvePoint/intersection with chord
    // Use this to find the actual chord length and the arc height using Law of Sines
    let bearingToStart = this.getBearing(endPoint, startPoint);
    let endBearingToCurve = this.getBearing(endPoint, curvePoint);
    angleToCurve = endBearingToCurve - bearingToStart;
    lengthToCurvePoint = google.maps.geometry.spherical.computeLength([endPoint, curvePoint]);
    height = lengthToCurvePoint * Math.sin(this.degreesToRadians(Math.abs(angleToCurve))) / Math.sin(this.degreesToRadians(90));
    halfLength = lengthToCurvePoint * Math.sin(this.degreesToRadians(90 - Math.abs(angleToCurve))) / Math.sin(this.degreesToRadians(90));

    // Compute the radius from the chord length and arc height
    radius = Math.pow(halfLength * 2, 2) / (8 * height) + height / 2;

    // Find the origin of the circle
    angleToOrigin = this.radiansToDegrees(Math.asin((radius - height) * Math.sin(this.degreesToRadians(90)) / radius));
    curveOrigin = google.maps.geometry.spherical.computeOffset(endPoint, radius, bearingToStart - (angleToCurve < 0 ? -1 : 1) * angleToOrigin);
    
    // Find the angles used for computing the offsets along the curve
    originAngle = 90 - angleToOrigin;
    originHeading = this.getBearing(curveOrigin, curvePoint);

    // Double check that we end up in the right spot
    lengthCheck = google.maps.geometry.spherical.computeLength([curvePoint, google.maps.geometry.spherical.computeOffset(curveOrigin, radius, 
      originHeading + (angleToCurve < 0 ? -1 : 1) * (1 / (this.editOverlay.getPath().getLength() - index) * originAngle))]);
    if (lengthCheck > 3) {
      angleToCurve = angleToCurve * -1;
      angleToOrigin = this.radiansToDegrees(Math.asin((radius - height) * Math.sin(this.degreesToRadians(90)) / radius));
      curveOrigin = google.maps.geometry.spherical.computeOffset(endPoint, radius, bearingToStart - (angleToCurve < 0 ? -1 : 1) * angleToOrigin);
      originAngle = 90 - angleToOrigin;
      originHeading = this.getBearing(curveOrigin, curvePoint);
    }
    crossPoint = google.maps.geometry.spherical.computeOffset(curvePoint, height, this.getBearing(curvePoint, curveOrigin));
    this.debugPolygons[2].setPath([endPoint, curvePoint, crossPoint]);
    this.debugPolygons[2].setMap(this.map);
    this.debugPolygons[3].setPath([endPoint, curveOrigin, crossPoint]);
    this.debugPolygons[3].setMap(this.map);
    this.debugPolygons.forEach((polygon: google.maps.Polygon) => polygon.setVisible(true));

    // Add points along the circle
    previousPoint = path[path.length - 1];
    for (let i = index + 1; i < this.editOverlay.getPath().getLength(); i++) {
      let point = google.maps.geometry.spherical.computeOffset(curveOrigin, radius, 
        originHeading + (angleToCurve < 0 ? -1 : 1) * ((i - index) / (this.editOverlay.getPath().getLength() - index) * originAngle));
      editRow = this.getEditedRow(this.firstVertex + i);
      editRow["Latitude (deg)"] = point.lat();
      editRow["Longitude (deg)"] = point.lng();
      editRow["Bearing (deg)"] = this.getBearing(previousPoint, point);
      previousPoint = point;
      path.push(point);
    }
    editRow = this.getEditedRow(this.secondVertex);
    editRow["Latitude (deg)"] = endPoint.lat();
    editRow["Longitude (deg)"] = endPoint.lng();
    editRow["Bearing (deg)"] = this.getBearing(previousPoint, endPoint);
    path.push(endPoint);

    return path;
  }

  private degreesToRadians(degrees: number): number {
    return (degrees < 0 ? degrees + 360 : degrees) * Math.PI / 180.0;
  }

  private radiansToDegrees(radians: number): number {
    let degrees = radians * 180 / Math.PI;
    return degrees < 0 ? degrees + 360 : degrees;
  }

  hideSegment() {
    this.firstVertex = null;
    this.secondVertex = null;
    if (this.editOverlay) {
      this.editOverlay.setVisible(false);
    }
    if (this.dragPoint) {
      this.dragPoint.setVisible(false);
    }
    if (this.debugPolygons) {
      this.debugPolygons.forEach((polygon: google.maps.Polygon) => polygon.setVisible(false));
    }
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

  findClosestVertex(latLng: google.maps.LatLng) : number {
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
