/**
 * Route-level animations for page transitions.
 *
 * Why fade + slight slide instead of pure slide?
 * Pure slide animations feel "weighty" and slow on long content pages.
 * A combination of fade (for the incoming page) and brief slide (for spatial
 * continuity) feels both responsive and intentional.
 *
 * The animation duration is intentionally short (250ms) — anything longer
 * makes navigation feel sluggish. Users perceive animations under 300ms
 * as instant but smooth.
 */

import {
  animate,
  query,
  style,
  transition,
  trigger,
  group,
} from '@angular/animations';

export const routeFadeAnimation = trigger('routeFade', [
  transition('* <=> *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          left: 0,
          right: 0,
          width: '100%',
        }),
      ],
      { optional: true },
    ),

    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' })], {
      optional: true,
    }),

    group([
      query(
        ':leave',
        [
          animate(
            '200ms cubic-bezier(0.16, 1, 0.3, 1)',
            style({ opacity: 0, transform: 'translateY(-8px)' }),
          ),
        ],
        { optional: true },
      ),

      query(
        ':enter',
        [
          animate(
            '300ms 100ms cubic-bezier(0.16, 1, 0.3, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);
