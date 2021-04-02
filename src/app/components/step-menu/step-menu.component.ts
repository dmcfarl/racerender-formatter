import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MenuItem} from 'primeng/api';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-step-menu',
  templateUrl: './step-menu.component.html',
  providers: [MessageService],
  styleUrls: ['./step-menu.component.css']
})
export class StepMenuComponent implements OnInit {

  steps: MenuItem[];

  constructor(private messageService: MessageService, private outlet: RouterOutlet) { }

  ngOnInit(): void {
    this.steps = [
      {
        label: 'Upload',
        routerLink: 'upload-step'
      },
      {
        label: 'Columns',
        routerLink: 'columns-step'
      },
      {
        label: 'Laps',
        routerLink: 'laps-step'
      },
      {
        label: 'Download',
        routerLink: 'download-step'
      }
    ];
  }

}
