import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-formatter',
  templateUrl: './formatter.component.html',
  providers: [MessageService],
  styleUrls: ['./formatter.component.css']
})
export class FormatterComponent implements OnInit {

  steps: MenuItem[];

  activeIndex: number = 0;

  constructor(private messageService: MessageService, private outlet: RouterOutlet) { }

  ngOnInit(): void {
    this.steps = [
      {
        label: 'Upload',
        routerLink: '/formatter/upload-step'
      },
      {
        label: 'Columns',
        routerLink: '/formatter/columns-step'
      },
      {
        label: 'Laps',
        routerLink: '/formatter/laps-step'
      },
      {
        label: 'Edit',
        routerLink: '/formatter/edit-step'
      },
      {
        label: 'Download',
        routerLink: '/formatter/download-step'
      }
    ];
  }

}
