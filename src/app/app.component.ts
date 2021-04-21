/// <reference types="google.maps" />
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { AppRoutingModule } from './app-routing.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ MessageService ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  tabs: MenuItem[];
  activeItem: MenuItem;
  
  constructor(private messageService: MessageService, private outlet: RouterOutlet, private router: Router) { }

  ngOnInit(): void {
    this.tabs = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        routerLink: AppRoutingModule.routes[0].path
      },
      {
        label: 'Formatter',
        icon: 'pi pi-download',
        routerLink: AppRoutingModule.routes[1].path
      },
      /*{
        label: 'Editor',
        icon: 'pi pi-fw pi-pencil',
        routerLink: AppRoutingModule.routes[2].path
      }*/
    ];
    
    this.activeItem = this.tabs[0];
  }

}
