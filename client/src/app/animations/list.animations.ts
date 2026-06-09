/**
 * Staggered list animations for product grids and cart lists.
 *
 * The staggered effect (each item animates with a small delay after the previous)
 * creates a perception of intentional, choreographed motion rather than
 * everything appearing at once.
 *
 * Stagger delay of 40ms is the sweet spot: long enough to perceive the cascade,
 * short enough that the full list appears within 1 second even with 20 items.
 */

import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const listStaggerAnimation = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.98)' }),
        stagger(40, [
          animate(
            '400ms cubic-bezier(0.16, 1, 0.3, 1)',
            style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
          ),
        ]),
      ],
      { optional: true },
    ),

    query(
      ':leave',
      [
        stagger(-20, [
          animate(
            '200ms cubic-bezier(0.4, 0, 1, 1)',
            style({ opacity: 0, transform: 'translateX(-30px) scale(0.95)' }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

export const fadeInUpAnimation = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate(
      '400ms cubic-bezier(0.16, 1, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
]);

export const scaleInAnimation = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate(
      '250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '150ms cubic-bezier(0.4, 0, 1, 1)',
      style({ opacity: 0, transform: 'scale(0.95)' }),
    ),
  ]),
]);
