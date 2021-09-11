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
