/**
 * Form-specific animations: validation shake, success pulse.
 *
 * The shake animation triggers when a form fails validation on submit.
 * Behavioral psychology: users associate shake with "no/wrong" universally
 * (cross-cultural head shake gesture), making feedback intuitive without text.
 */

import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const shakeAnimation = trigger('shake', [
  transition('* => shake', [
    animate(
      '500ms cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateX(-8px)', offset: 0.1 }),
        style({ transform: 'translateX(8px)', offset: 0.2 }),
        style({ transform: 'translateX(-8px)', offset: 0.3 }),
        style({ transform: 'translateX(8px)', offset: 0.4 }),
        style({ transform: 'translateX(-4px)', offset: 0.5 }),
        style({ transform: 'translateX(4px)', offset: 0.6 }),
        style({ transform: 'translateX(-2px)', offset: 0.7 }),
        style({ transform: 'translateX(2px)', offset: 0.8 }),
        style({ transform: 'translateX(0)', offset: 1 }),
      ]),
    ),
  ]),
]);

export const slideDownAnimation = trigger('slideDown', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-8px)', height: 0 }),
    animate(
      '200ms cubic-bezier(0.16, 1, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)', height: '*' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '150ms cubic-bezier(0.4, 0, 1, 1)',
      style({ opacity: 0, transform: 'translateY(-8px)', height: 0 }),
    ),
  ]),
]);
