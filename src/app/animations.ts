import { animate, group, query, style, transition, trigger } from '@angular/animations'

export const smoothHeight = trigger('grow', [
	transition('void <=> *', []),
	transition('* <=> *', [style({ height: '{{startHeight}}px', opacity: 0 }), animate('.5s ease')], {
		params: { startHeight: 0 },
	}),
])

export const sliderRoutes =
  trigger('routeAnimations', [
    transition('dashboard => *', slideTo('bottom') ),
    transition('agenda => dashboard', slideTo('top') ),
    transition('agenda => settings', slideTo('bottom') ),
    transition('settings => *', slideTo('top') ),
    transition('* => *', slideTo('top') ),
  ]);

function slideTo(direction: string) {
	const optional = { optional: true }
	return [
		query(
			':enter, :leave',
			[
				style({
					position: 'absolute',
					left: '50%',
    				transform: 'translateX(-50%)',
					[direction]: 0,
					width: '100%',
				}),
			],
			optional
		),
		query(':enter', [style({ [direction]: '-100%' })]),
		group([
			query(':leave', [animate('600ms ease', style({ [direction]: '100%' }))], optional),
			query(':enter', [animate('600ms ease', style({ [direction]: '0%' }))]),
		]),
		// Normalize the page style... Might not be necessary

		// Required only if you have child animations on the page
		// query(':leave', animateChild()),
		// query(':enter', animateChild()),
	]
}
