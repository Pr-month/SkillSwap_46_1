import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-docs',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    
    return mergeConfig(config, {
      plugins: [
        (await import('vite-plugin-svgr')).default({
          svgrOptions: {
            exportType: 'default',
          },
          include: '**/*.svg?react',
        }),
      ],
    });
  },
};

export default config;