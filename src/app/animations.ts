import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations'

const optional = { optional: true }

export const smoothHeight = trigger('grow', [
	transition('void <=> *', []),
	transition('* <=> *', [style({ height: '{{startHeight}}px', opacity: 0 }), animate('.5s ease')], {
		params: { startHeight: 0 },
	}),
])

export const sliderRoutes = trigger('routeAnimations', [
	transition('dashboard => *', slideTo('bottom')),
	transition('agenda => dashboard', slideTo('top')),
	transition('agenda => settings', slideTo('bottom')),
	transition('settings => *', slideTo('top')),
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
		query(':enter', [animate('600ms ease', style({ opacity: 1, transform: 'scale(1)' }))]),
	]),
])

export const fader = trigger('routeAnimations', [
	transition('* <=> *', [
		// Set a default  style for enter and leave
		query(':enter, :leave', [
			style({
				position: 'absolute',
				left: 0,
				width: '100%',
				opacity: 0,
				transform: 'scale(0) translateY(100%)',
			}),
		]),
		
		// Animate the new page in
		query(':enter', [animate('600ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))]),
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
