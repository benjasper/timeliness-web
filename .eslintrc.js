module.exports = {
	extends: ['prettier', 'standard-with-typescript'],
	plugins: ['prettier'],
	parserOptions: {
		project: './tsconfig.json',
	},
	indent: ['error', 'tab']
}
