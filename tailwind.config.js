const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
	mode: 'jit',
	purge: [
		'./src/**/*.html',
		'./src/**/*.vue',
		'./src/**/*.jsx',
	],
	darkMode: false,
	theme: {
		fontSize: {
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
				sans: ['"noto-sans"', ...defaultTheme.fontFamily.sans]
			},
			gridTemplateColumns: {
				'modal': '2fr 1fr',
			}
		},
		colors: {
			primary: {
				DEFAULT: '#22125a',
				light: '#2f2066'
			},
			secondary: {
				DEFAULT: '#dbe2ff'
			},
			grey: {
				DEFAULT: '#eee',
				light: '#f4f4f4',
				'very-light': '#F5F7FB',
				dark: '#8d99ae'
			},
			white: {
				DEFAULT: '#fff'
			},
			red: {
				DEFAULT: '#ef233c'
			}
		},
		backgroundColor: theme => ({
			...theme('colors')
		})
	},
	variants: {
		extend: {}
	},
	plugins: []
}
