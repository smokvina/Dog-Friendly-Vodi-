import { Injectable } from '@angular/core';
import { DogFriendlyData } from '../models/dog-friendly-data.model';

// Declaring 'L' as a global variable to work with the Leaflet library loaded from CDN
declare var L: any;

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private map: any; // Using 'any' for Leaflet map instance

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  initializeMap(container: HTMLElement, data: DogFriendlyData): void {
    this.destroyMap();

    if (!container || !data) return;

    // Center map on the first available coordinate or default
    const firstPark = data.parkovi_i_setnice?.[0];
    const firstShop = data.pet_shopovi?.[0];
    const firstVet = data.veterinari?.[0];
    const centerLat = firstPark?.latitude ?? firstShop?.latitude ?? firstVet?.latitude ?? 45.815;
    const centerLng = firstPark?.longitude ?? firstShop?.longitude ?? firstVet?.longitude ?? 15.9819;

    this.map = L.map(container).setView([centerLat, centerLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const markers: any[] = [];

    // Add park markers
    data.parkovi_i_setnice.forEach(park => {
      if (park.latitude && park.longitude) {
        const marker = this.createMarker([park.latitude, park.longitude], 'green', park.naziv);
        markers.push(marker);
      }
    });

    // Add pet shop markers
    data.pet_shopovi.forEach(shop => {
      if (shop.latitude && shop.longitude) {
        const marker = this.createMarker([shop.latitude, shop.longitude], 'blue', shop.naziv);
        markers.push(marker);
      }
    });

    // Add veterinarian markers
    data.veterinari.forEach(vet => {
      if (vet.latitude && vet.longitude) {
        const marker = this.createMarker([vet.latitude, vet.longitude], 'red', vet.naziv);
        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      const featureGroup = L.featureGroup(markers).addTo(this.map);
      this.map.fitBounds(featureGroup.getBounds().pad(0.1));
    }
  }

  private createMarker(latLng: [number, number], color: string, tooltipText: string) {
    const icon = L.divIcon({
      html: `<svg class="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C9.37 0 4 5.37 4 12C4 21.75 16 32 16 32S28 21.75 28 12C28 5.37 22.63 0 16 0Z" fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="12" r="5" fill="white"/>
            </svg>`,
      className: '',
      iconSize: [24, 32],
      iconAnchor: [12, 32],
    });

    return L.marker(latLng, { icon }).bindPopup(tooltipText);
  }
}
