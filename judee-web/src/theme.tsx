import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        darkblue?: Palette['primary'];
        lightgrey?: Palette['primary'];
    }
    interface PaletteOptions {
        darkblue?: PaletteOptions['primary'];
        lightgrey?: PaletteOptions['primary'];
        darkgreen?: PaletteOptions['primary'];
        darkred?: PaletteOptions['primary'];
    }
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#878A8F',
        },  
        secondary: {
            main: '#F3F5F7',
        },
        success: {
            main: '#5CA132',
        },
        error: {
            main: '#C10F3A', // Assuming brandcolor is used as error
        },
        darkblue:{
            main: '#002044',
        },
        warning: {
            main: '#FD5339',
        },
        lightgrey: {
            main: '#878A8F',
        },
        darkgreen:{
            main: '#004B23',
        },
        darkred:{
            main: '#7E1B2A',
        }
    },
    typography: {
        fontFamily: [
            'St. Jude Sans',
            'Roboto',       // Fallback font
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(',')
    },
});

export default theme;
