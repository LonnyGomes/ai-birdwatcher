import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

// Nature-inspired color palette
const lightTheme = {
  dark: false,
  colors: {
    // Primary - Deep Forest Green
    primary: '#1B4332',
    'primary-lighten-1': '#2D6A4F',
    'primary-lighten-2': '#40916C',
    'primary-darken-1': '#143527',

    // Secondary - Earthy Brown
    secondary: '#5C4033',
    'secondary-lighten-1': '#7A5C4A',
    'secondary-lighten-2': '#9B7B6B',
    'secondary-darken-1': '#4A3328',

    // Accent - Warm Sunset Orange
    accent: '#E85D04',
    'accent-lighten-1': '#F48C06',
    'accent-lighten-2': '#FAA307',
    'accent-darken-1': '#DC2F02',

    // Semantic Colors (nature-inspired variants)
    error: '#9B2226',
    info: '#3D5A80',
    success: '#2D6A4F',
    warning: '#E76F51',

    // Surfaces
    background: '#F8F6F3',
    surface: '#FFFFFF',
    'surface-variant': '#E8E4DF',
    'surface-bright': '#FDFCFB',

    // Text colors
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#FFFFFF',
    'on-background': '#1B4332',
    'on-surface': '#2D3B35',

    // Additional Nature Colors
    'forest-mist': '#95D5B2',
    'golden-hour': '#FFBA08',
    bark: '#774936',
    moss: '#52796F',
    dawn: '#FFE5D9',
    dusk: '#364156',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    // Primary - Lighter Forest Green for dark mode
    primary: '#40916C',
    'primary-lighten-1': '#52B788',
    'primary-lighten-2': '#74C69D',
    'primary-darken-1': '#2D6A4F',

    // Secondary - Lighter Brown
    secondary: '#9B7B6B',
    'secondary-lighten-1': '#B89B8B',
    'secondary-lighten-2': '#D4BEB2',
    'secondary-darken-1': '#7A5C4A',

    // Accent - Brighter Orange for dark mode
    accent: '#F48C06',
    'accent-lighten-1': '#FAA307',
    'accent-lighten-2': '#FFBA08',
    'accent-darken-1': '#E85D04',

    // Semantic Colors
    error: '#E5383B',
    info: '#4EA8DE',
    success: '#52B788',
    warning: '#FAA307',

    // Dark Surfaces
    background: '#0D1B14',
    surface: '#1A2F23',
    'surface-variant': '#243B2D',
    'surface-bright': '#2D4A38',

    // Text colors
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#FFFFFF',
    'on-background': '#E8E4DF',
    'on-surface': '#E8E4DF',

    // Additional Dark Nature Colors
    'forest-mist': '#74C69D',
    'golden-hour': '#FFBA08',
    bark: '#9B7B6B',
    moss: '#74C69D',
    dawn: '#3D2C27',
    dusk: '#1B2838',
  },
};

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
    },
    VBtn: {
      elevation: 0,
    },
  },
});
