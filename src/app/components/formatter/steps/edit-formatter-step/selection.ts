export class Selection {
    startVertex: number;
    endVertex: number;
    dragPoint: google.maps.Marker;
    endPoint: google.maps.Marker;
    editOverlay: google.maps.Polyline;
    dragOverlay: google.maps.Polyline;

    constructor(startVertex: number, endVertex: number) {
        this.startVertex = startVertex;
        this.endVertex = endVertex;
    }
}