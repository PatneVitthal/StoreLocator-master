import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  mapCenter = { lat: 36.4685099, lng: -86.6535672 }; // Default center coordinates
  zoom: number = 10;
  loading: boolean = false;
  error: string | null = null;

  selectedStore: Store | null = null; // Holds the currently selected store for the popup
  popupStyle: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.initAutocomplete();
    this.fetchStores(this.mapCenter.lat, this.mapCenter.lng); // Fetch stores around the default location
  }

  fetchStores(lat: number, lng: number) {
    this.loading = true;
    this.error = null;
    this.http.get<Store[]>(`http://localhost:3000/api/findStore?lat=${lat}&long=${lng}`)
      .pipe(
        catchError(error => {
          this.error = 'Failed to load stores. Please try again.';
          return of([]);
        })
      )
      .subscribe((data) => {
        this.stores = data;
        this.filteredStores = [...this.stores];
        this.loading = false;
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
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        this.mapCenter = { lat, lng };
        this.zoom = 12;

        // Fetch stores near the selected place's coordinates
        this.fetchStores(lat, lng);
      } else {
        console.warn('Place geometry or location is undefined.');
      }
    });
  }

  filterStores() {
    this.filteredStores = this.stores.filter((store) =>
      store.display_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      store.Address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      store.website.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  centerMap(store: Store) {
    this.mapCenter = { lat: store.latitude, lng: store.longitude };
    this.zoom = 14; // Adjust zoom to focus on a specific store
  }

  openPopup(store: Store, index: number) {
    this.selectedStore = store;

    // Calculate popup position relative to the clicked store item
    const listItem = document.querySelectorAll('.store-item')[index] as HTMLElement;
    const rect = listItem.getBoundingClientRect();
    this.popupStyle = {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.right + 10}px`,
    };
  }

  closePopup() {
    this.selectedStore = null; // Close the popup
  }
}
