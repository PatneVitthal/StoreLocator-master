import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Store {
  name: string;
  display_name: string;
  basestore: string;
  Address: string;
  latitude: number;
  longitude: number;
  website:string;
  phone_number:String;
  sun_facing_amt:String;
  monday_time:String;
  tuesday_time:String;
  wednesday_time:String;
  thursday_time:String;
  friday_time:String;
  saturday_time:String;
  sunday_time:String;
}

@Component({
  selector: 'app-store-mapper',
  templateUrl: './store-mapper.component.html',
  styleUrls: ['./store-mapper.component.css']
})
export class StoreMapperComponent implements AfterViewInit {
  @ViewChild('autocomplete', { static: false }) autocompleteInput!: ElementRef;

  stores: Store[] = [];
  filteredStores: Store[] = [];
  searchQuery: string = '';
  mapCenter = { lat: 32.4685099, lng: -86.6535672 }; // Default center coordinates
  zoom: number = 6;
  loading: boolean = false;
  isDrawerOpen:boolean = false;
  error: string | null = null;
  storeIcon: google.maps.Icon = {
    url: '/_ui/responsive/common/_dl/assets/icons/individual/map-pin1.svg', // Path to your store icon image
    scaledSize: new google.maps.Size(40, 40), // Adjust the size of the icon
  };

  selectedStore: Store | null = null; // Holds the currently selected store for the popup
  popupStyle: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(private http: HttpClient,private cdr: ChangeDetectorRef) {}
  ngAfterViewInit() {
    this.initAutocomplete();
  
    const latRange = 1; // Adjust range as needed
    const longRange = 1; // Adjust range as needed
  
    const minLat = this.mapCenter.lat - latRange;
    const maxLat = this.mapCenter.lat + latRange;
    const minLong = this.mapCenter.lng - longRange;
    const maxLong = this.mapCenter.lng + longRange;
  
    // Fetch stores within the range
    this.fetchStores(minLat, maxLat, minLong, maxLong);
  }
  

  fetchStores(minLat: number, maxLat: number, minLong: number, maxLong: number) {
    this.loading = true;
    this.error = null;
    this.http
      .get<Store[]>(
        `http://localhost:3000/api/findStore?minLat=${minLat}&maxLat=${maxLat}&minLong=${minLong}&maxLong=${maxLong}`
      )
      .pipe(
        catchError((error) => {
          this.error = 'Failed to load stores. Please try again.';
          return of([]);
        })
      )
      .subscribe((data) => {
        this.stores = data;
        this.filteredStores = [...this.stores];
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
  

  initAutocomplete() {
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps API is not loaded.');
      return;
    }
    const autocomplete = new google.maps.places.Autocomplete(
      this.autocompleteInput.nativeElement,
      { types: [] } // Restrict results to geographical locations
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.viewport && place.geometry.location) {
        const viewport = place.geometry.viewport;

        // Safely extract bounds and enforce type as number
        const minLat: number = viewport.getSouthWest().lat() ?? 0;
        const maxLat: number = viewport.getNorthEast().lat() ?? 0;
        const minLong: number = viewport.getSouthWest().lng() ?? 0;
        const maxLong: number = viewport.getNorthEast().lng() ?? 0;
        const centerLat = Math.max(minLat, Math.min(place.geometry.location.lat(), maxLat));
        const centerLng = Math.max(minLong, Math.min(place.geometry.location.lng(), maxLong));

    this.mapCenter = {
      lat: centerLat,
      lng: centerLng,
    };
  
        this.zoom = 6;
    
        // Fetch stores within the bounds
        this.fetchStores(minLat, maxLat, minLong, maxLong);
      } else {
        console.warn('Place geometry or viewport is undefined.');
      }
    });
  }     

  filterStores() {
   
    this.filteredStores = this.stores.filter((store) =>
      store.display_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      store.Address.toLowerCase().includes(this.searchQuery.toLowerCase())
      
    );
    
  }

  centerMap(store: Store) {
    this.mapCenter = { lat: store.latitude, lng: store.longitude };
    this.zoom = 6; // Adjust zoom to focus on a specific store
  }

  openPopup(store: Store, index: number): void {
    this.selectedStore = store;
    const listItem = document.querySelectorAll('.store-item')[index] as HTMLElement;
    if (listItem) {
      const rect = listItem.getBoundingClientRect();
      this.popupStyle = {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.right + 10}px`,
      };
    }
    this.cdr.detectChanges(); // Trigger manual change detection if using OnPush
    
  }
  

  closePopup() {
    this.selectedStore = null; // Close the popup
    this.cdr.detectChanges(); // Trigger manual change detection if using OnPush
  }
  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.cdr.detectChanges(); // Trigger manual change detection if using OnPush
  } 
  
}
