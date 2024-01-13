/// <reference types="google.maps" />
import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
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
  
  constructor() { }

  ngOnInit(): void {
    this.tabs = [
      {
        label: 'Home',
        icon: PrimeIcons.HOME,
        routerLink: AppRoutingModule.routes[0].path
      },
      {
        label: 'Formatter',
        icon: PrimeIcons.DOWNLOAD,
        routerLink: AppRoutingModule.routes[1].path
      },
      /*{
        label: 'Editor',
        icon: 'pi pi-fw pi-pencil',
        routerLink: AppRoutingModule.routes[2].path
      }*/
      {
        label: 'Donate',
        icon: PrimeIcons.HEART,
        url: 'https://venmo.com/?txn=pay&audience=private&recipients=HoboBob&amount=5.00&note=www.hobo-bob.com%20appreciation'
      }
    ];
    
    this.activeItem = this.tabs[0];
  }

}
