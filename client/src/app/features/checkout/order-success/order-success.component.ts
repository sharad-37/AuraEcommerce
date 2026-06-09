/**
 * Order confirmation page shown after successful checkout.
 *
 * Why fetch the order rather than passing it via router state?
 * Router state is lost on page refresh. Bookmarkable confirmation URLs
 * mean users can return to verify their order details anytime.
 *
 * The big animated checkmark uses SVG stroke-dasharray animation for a
 * polished "drawing" effect on first paint.
 */

import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { Order } from '../../../core/models';
import { fadeInUpAnimation, scaleInAnimation } from '../../../animations';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, NavbarComponent],
  animations: [fadeInUpAnimation, scaleInAnimation],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent implements OnInit {
  @Input({ required: true }) orderId!: string;

  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        if (response.data) {
          this.order.set(response.data);
        } else {
          this.notFound.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }
}
