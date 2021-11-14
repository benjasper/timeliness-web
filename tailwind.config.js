const defaultTheme = require('tailwindcss/defaultTheme')

const primaryColor = '#22125a'

module.exports = {
	mode: 'jit',
	purge: ["./src/app/**/*.{js,ts,html,scss}"],
	darkMode: 'class',
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
				'modal': '65rem 1fr',
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
			purple: {
				DEFAULT: '#9d78f5',
				dark: primaryColor
			},
			grey: {
				DEFAULT: '#eee',
				light: '#f4f4f4',
				'very-light': '#F5F7FB',
				dark: '#8d99ae',
				'very-dark': '#15181C'
			},
			black: '#040f0f',
			white: {
				DEFAULT: '#fff'
			},
			red: {
				DEFAULT: '#ef233c'
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
	plugins: []
}
