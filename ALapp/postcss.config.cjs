// // postcss.config.cjs

// const autoprefixer = require('autoprefixer');

// // 💡 The Fix: Handle potential default export nesting
// // PostCSS plugins are functions. We need to ensure the 'purgecss' variable
// // holds the actual function, not a module object containing the function.
// const purgecssModule = require('@fullhuman/postcss-purgecss');
// const purgecss = purgecssModule.default || purgecssModule; // Use .default if available, otherwise use the module directly

// module.exports = {
//   plugins: [
//     autoprefixer,
//     // The plugin function must be called with its configuration object.
//     purgecss({
//       content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
//       safelist: [
//         /^p-/,      // PrimeFlex and PrimeReact base component classes
//         /^pi-/,     // PrimeIcons
//         /p-inputtext/ // Add any other known utility class patterns you use
//       ],
//       defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
//     }),
//   ],
// };