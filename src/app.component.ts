import { ChangeDetectionStrategy, Component, inject, signal, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { DogFriendlyData, GroundingChunk } from './models/dog-friendly-data.model';
import { MapService } from './services/map.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  private mapService = inject(MapService);

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;

  location = signal<string>('Zagreb, Hrvatska');
  results = signal<DogFriendlyData | null>(null);
  sources = signal<GroundingChunk[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const resultsData = this.results();
      if (resultsData && this.mapContainer) {
        // Use a short timeout to ensure the map container is visible in the DOM
        setTimeout(() => this.mapService.initializeMap(this.mapContainer.nativeElement, resultsData), 0);
      } else {
        this.mapService.destroyMap();
      }
    });
  }

  async searchLocation(): Promise<void> {
    if (!this.location().trim()) {
      this.error.set('Molimo unesite lokaciju.');
      return;
    }

    this.loading.set(true);
    this.results.set(null); // This will trigger the effect to destroy the map
    this.sources.set([]);
    this.error.set(null);

    try {
      const response = await this.geminiService.findDogFriendlySpots(this.location());
      this.results.set(response.data);
      this.sources.set(response.sources);
    } catch (e: any) {
      this.error.set(e.message || 'Nepoznata pogreška.');
    } finally {
      this.loading.set(false);
    }
  }
}