import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-composer',
  templateUrl: './composer.component.html',
  providers: [MessageService],
  styleUrls: ['./composer.component.css']
})
export class ComposerComponent implements OnInit {

  steps: MenuItem[];

  activeIndex: number = 0;

  constructor(private messageService: MessageService, private outlet: RouterOutlet) { }

  ngOnInit(): void {
    this.steps = [
      {
        label: 'Laps',
        routerLink: '/composer/laps-step'
      },
      {
        label: 'Download',
        routerLink: '/composer/download-step'
      }
    ];
  }

}
