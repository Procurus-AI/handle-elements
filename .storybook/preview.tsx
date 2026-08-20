import type { Preview } from '@storybook/react-vite';
import React, { useEffect } from 'react';

// Exactly what a consumer app imports:
import '../src/styles/fonts.css';
import '../src/styles/styles.css';

const preview: Preview = {
  globalTypes: {
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
      // Consumer-real mechanism: the attribute lives on <html>.
      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, [theme]);
      return (
        <div className="he-root" style={{ minHeight: '100vh', margin: -16, padding: 24 }}>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'padded',
  },
};

export default preview;
