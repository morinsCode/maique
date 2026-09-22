// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111111",
      contrastText: "#f4f4f0",
    },
    background: {
      default: "#e8e7e2",
      paper: "#f4f4f0",
    },
    text: {
      primary: "#111111",
      secondary: "#3f3f3f",
    },
  },

  shape: {
    borderRadius: 0,
  },

  typography: {
    fontFamily: '"Roboto Condensed", "Arial Narrow", Arial, sans-serif',

    h1: {
      fontWeight: 900,
      fontSize: "clamp(3.5rem, 8vw, 8rem)",
      lineHeight: 0.86,
      letterSpacing: "-0.06em",
      textTransform: "uppercase",
    },

    button: {
      fontWeight: 800,
      fontSize: "1.1rem",
      letterSpacing: "0.02em",
      textTransform: "uppercase",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: "18px 24px",
          borderWidth: "2px",
        },
      },
    },
  },
});
