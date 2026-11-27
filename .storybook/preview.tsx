import type { Preview } from '@storybook/react-vite';
import React, { useEffect } from 'react';

// Exactly what a consumer app imports:
import '../src/styles/fonts.css';
import '../src/styles/styles.css';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    // Also settable from the URL (`&globals=theme:dark`); scripts/storybook-run.mjs uses that.
    theme: {
      description: 'Handle theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? 'light';
      const fullscreen = context.parameters.layout === 'fullscreen';
      // Consumer-real mechanism: the attribute lives on <html>.
      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, [theme]);
      const surface = { background: 'var(--he-bg-app)', color: 'var(--he-text-primary)' };
      return (
        <div
          className="he-root"
          style={
            fullscreen
              ? { ...surface, minHeight: '100vh' }
              : { ...surface, minHeight: '100vh', margin: -16, padding: 24 }
          }
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Introduction',
          ['Overview', 'Benchmarks', 'Atomic Design', 'Changelog'],
          'Foundations',
          'Atoms',
          'Molecules',
          'Organisms',
          'Templates',
          'Pages',
          '*',
        ],
      },
    },
  },
};

export default preview;
