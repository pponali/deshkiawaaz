import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CapacitorService } from './services/capacitor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(private capacitorService: CapacitorService) {}

  ngOnInit(): void {
    this.capacitorService.initialize();
  }
}
