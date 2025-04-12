import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|ts|svelte)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-svelte-csf",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
    "@storybook/addon-themes" // Add themes addon for better support
  ],
  "framework": {
    "name": "@storybook/sveltekit",
    "options": {}
  },
  "staticDirs": ['../static'], // Add static dirs for proper asset loading
  "webpackFinal": async (config) => {
    // Ensure proper CSS processing for svelte-ux
    return config;
  }
};
export default config;