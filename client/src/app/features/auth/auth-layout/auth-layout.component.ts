/**
 * Shared layout for all auth pages (login, register, future: forgot password).
 *
 * Design rationale:
 * The layout is a two-panel composition:
 * - Left panel: Brand storytelling with gradient backdrop and decorative elements
 * - Right panel: The actual form, projected via <ng-content>
 *
 * On mobile, the left panel collapses into a compact header.
 * This responsive transformation happens at the SCSS layer, not via JS,
 * for smoother behavior on resize.
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fadeInUpAnimation, scaleInAnimation } from '../../../animations';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [fadeInUpAnimation, scaleInAnimation],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
}
