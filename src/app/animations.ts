import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations'

const optional = { optional: true }

export const modalBackground = trigger('modalBackground', [
	transition(':enter', [style({ opacity: 0 }), animate("100ms ease-in-out")]),
	transition(':leave', [animate("100ms ease-in-out", style({ opacity: 0.6 }))])
])

export const modalFlyInOut = trigger('modalFlyInOut', [
	transition(':enter', [style({ transform: 'translate(-50%, -50%) scale(0.95)', opacity: 0 }), animate("200ms ease-in-out")]),
	transition(':leave', [animate("200ms ease-in-out", style({ transform: 'translate(-50%, -50%) scale(0.95)', opacity: 0 }))]),
])

export const sliderRoutes = trigger('routeAnimations', [
	transition(':increment', slideTo('bottom')),
	transition(':decrement', slideTo('top')),
	transition('* <=> *', [
		// Set a default  style for enter and leave
		query(':enter, :leave', [
			style({
				position: 'absolute',
				left: 0,
				width: '100%',
				opacity: 0,
				//transform: 'scale(3)',
			}),
		]),
		// Animate the new page in
		query(':enter', [animate('600ms ease', style({ opacity: 1, transform: 'scale(1)' }))], { optional: true }),
	]),
])

export const fader = trigger('routeAnimations', [
	transition('* <=> *', [
		// Set a default  style for enter and leave
		query(
			':enter, :leave',
			[
				style({
					position: 'absolute',
					left: 0,
					width: '100%',
					opacity: 0,
				}),
			],
			{ optional: true }
		),

		// Animate the new page in
		query(':enter', [animate('600ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))], {
			optional: true,
		}),
		animateChild(),
	]),
])

function slideTo(direction: string) {
	return [
		query(
			':enter, :leave',
			[
				style({
					position: 'absolute',
					left: 0,
					[direction]: 0,
					width: '100%',
					height: '100%',
					overflow: 'hidden',
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
		query(':leave', animateChild()),
		query(':enter', animateChild()),
	]
}
