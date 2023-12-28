import { Component, OnInit } from '@angular/core';
import { RaceService } from '../../race.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent implements OnInit {
  isImporting: boolean = false;
  displayImport: boolean = false;

  constructor(public raceService: RaceService) { }

  ngOnInit(): void {
  }

  onUpload(event) {
    this.isImporting = true;
    this.raceService.import(event.files[0]).then(data => {
      this.isImporting = false;
      this.displayImport = false;
    });
  }

}
