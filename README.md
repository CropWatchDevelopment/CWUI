# CropWatch UI Library

A unified UI component library for CropWatch applications.

## Installation

```bash
# Using npm
npm install @cropwatchdevelopment/cwui

# Using pnpm
pnpm add @cropwatchdevelopment/cwui

# Using yarn
yarn add @cropwatchdevelopment/cwui
```

## Usage

### Importing Components

```svelte
<script>
  import { DashboardCard, DataRowItem, CustomAvatar } from '@cropwatchdevelopment/cwui';
</script>
```

### Importing Styles

To use the CWUI styles in your application, you need to import the CSS file:

```js
// In your main JS/TS file
import '@cropwatchdevelopment/cwui/styles.css';
```

Or in a Svelte file:

```svelte
<script>
  import '@cropwatchdevelopment/cwui/styles.css';
</script>
```

### TailwindCSS Configuration

This library uses TailwindCSS with the @layerstack configuration. If you're using TailwindCSS in your project, make sure to add the following to your tailwind.config.js:

```js
module.exports = {
  // ... your other config
  content: [
    // ... your other content paths
    './node_modules/@cropwatchdevelopment/cwui/**/*.{js,svelte}',
  ],
  // Optional: if you want to use the same theme settings
  theme: {
    extend: {
      // Your theme extensions
    },
  },
}
```

## Development

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build your library:

```bash
npm run package
```

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Publishing

To publish your library to GitHub Packages:

```bash
npm run build
npm publish
```
