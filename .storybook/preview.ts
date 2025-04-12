import type { Preview } from '@storybook/svelte';
import '../src/app.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    // Add this to ensure proper styling in Storybook
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: 'light', color: '#f5f5f5' },
        { name: 'dark', class: 'dark', color: '#333333' },
      ],
    },
  },
};

export default preview;