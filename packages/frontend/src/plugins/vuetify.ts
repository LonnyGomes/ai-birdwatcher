import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const lightTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#546E7A',
    accent: '#7C4DFF',
    error: '#EF5350',
    info: '#29B6F6',
    success: '#66BB6A',
    warning: '#FFA726',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    'surface-variant': '#E3F2FD',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: '#42A5F5',
    secondary: '#78909C',
    accent: '#9575CD',
    error: '#EF5350',
    info: '#4FC3F7',
    success: '#66BB6A',
    warning: '#FFCA28',
    background: '#121212',
    surface: '#1E1E1E',
    'surface-variant': '#2C2C2C',
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
});
