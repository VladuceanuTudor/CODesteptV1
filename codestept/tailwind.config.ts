/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",

		// Or if using `src` directory:
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
    	extend: {
    		colors: {
    			'dark-layer-1': 'rgb(40,40,40)',
    			'dark-layer-2': 'rgb(26,26,26)',
    			'dark-label-2': 'rgba(239, 241, 246, 0.75)',
    			'dark-divider-border-2': 'rgb(61, 61, 61)',
    			'dark-fill-2': 'hsla(0,0%,100%,.14)',
    			'dark-fill-3': 'hsla(0,0%,100%,.1)',
    			'dark-gray-6': 'rgb(138, 138, 138)',
    			'dark-gray-7': 'rgb(179, 179, 179)',
    			'gray-8': 'rgb(38, 38, 38)',
    			'dark-gray-8': 'rgb(219, 219, 219)',
    			'brand-orange': 'rgb(255 161 22)',
    			'brand-orange-s': 'rgb(193, 122, 15)',
    			'dark-yellow': 'rgb(255 192 30)',
    			'dark-pink': 'rgb(255 55 95)',
    			olive: 'rgb(0, 184, 163)',
    			'dark-green-s': 'rgb(44 187 93)',
    			'dark-blue-s': 'rgb(10 132 255)',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};