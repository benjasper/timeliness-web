const defaultTheme = require('tailwindcss/defaultTheme')

const primaryColor = '#22125a'

module.exports = {
	content: ["./src/app/**/*.{js,ts,html}"],
	darkMode: 'class',
	theme: {
		fontSize: {
			'xss': '1rem',
			'xs': '1.2rem',
			'sm': '1.4rem',
			'base': '1.6rem',
			'lg': '1.8rem',
			'xl': '2rem',
			'2xl': '2.2rem',
			'3xl': '2.4rem',
			'4xl': '2.6rem',
			'5xl': '2.8rem',
			'6xl': '3.2rem',
			'7xl': '3.4rem',
		},
		extend: {
			fontFamily: {
				signature: ['Karla', ...defaultTheme.fontFamily.sans],
				sans: ['"noto-sans"', ...defaultTheme.fontFamily.sans],
				google: ['Roboto', ...defaultTheme.fontFamily.sans],
			},
			gridTemplateColumns: {
				'modal': '65rem 45rem',
				'sidebar': 'auto 1fr'
			},
			gridTemplateRows: {
				'app-bar': '1fr auto'
			},
			animation: {
				'spin-slow': 'spin 3s linear infinite'
			}
		},
		colors: {
			primary: {
				DEFAULT: primaryColor,
				light: '#2f2066'
			},
			secondary: {
				DEFAULT: '#dbe2ff'
			},
			transparent: {
				DEFAULT: 'transparent'
			},
			current: 'currentColor',
			purple: {
				DEFAULT: '#9d78f5',
				dark: primaryColor
			},
			grey: {
				DEFAULT: '#eee',
				light: '#f4f4f4',
				'very-light': '#F5F7FB',
				dark: '#707a8b',
				'very-dark': '#15181C',
				'google': 'rgba(0, 0, 0, 0.54)'
			},
			black: '#040f0f',
			white: {
				DEFAULT: '#fff'
			},
			red: {
				DEFAULT: '#E00000',
				light: '#ffe6e9'
			},
			green: {
				DEFAULT: '#CDF0EA',
				dark: '#00725f'
			},
			pink: {
				DEFAULT: '#F6DFEB',
				dark: '#c4307c'
			},
			'ice-blue': {
				DEFAULT: '#DEECFF',
				dark: '#1b519c'
			},
		},
		backgroundColor: theme => ({
			...theme('colors')
		})
	},
	variants: {
		extend: {}
	},
	plugins: [
		require('@tailwindcss/line-clamp'),
	]
}
