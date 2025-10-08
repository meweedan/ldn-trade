// src/theme/index.ts (Chakra v2 compatible)
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

/** ---- Color scales (plain strings, not { value }) ---- */
const colors = {
  brand: {
    50:  "#f7f3ea",
    100: "#efe6d3",
    200: "#e2d3b3",
    300: "#d3bf92",
    400: "#c1aa7b",
    500: "#b7a27d",
    600: "#9e8964",
    700: "#7d6c4f",
    800: "#5f523d",
    900: "#3f372a",
  },
  accent: {
    50:  "#fbf8f1",
    100: "#f2ead7",
    200: "#e6d6b3",
    300: "#d9c18e",
    400: "#cdae6f",
    500: "#b7a27d",
    600: "#9f8f66",
    700: "#827552",
    800: "#665b40",
    900: "#4b4330",
  },
  sand: {
    50:  "#faf7f2",
    100: "#f3ede2",
    200: "#e8dcc5",
    300: "#decdaa",
    400: "#cdb688",
    500: "#b7a27d",
    600: "#9e8d69",
    700: "#7f7153",
    800: "#5f5740",
    900: "#3f3a2b",
  },
  gray: {
    50:  "#F7FAFC",
    100: "#EDF2F7",
    200: "#E2E8F0",
    300: "#CBD5E0",
    400: "#A0AEC0",
    500: "#718096",
    600: "#4A5568",
    700: "#2D3748",
    800: "#1F2937",
    900: "#111827",
  },
};

/** ---- Fonts (plain strings) ---- */
const fonts = {
  heading:
    "'FuturaCustom', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  body:
    "'FuturaCustom', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

/** ---- Semantic tokens (v2 uses { default, _dark }) ---- */
const semanticTokens = {
  colors: {
    "bg.canvas":   { default: "sand.50",  _dark: "black" },
    "bg.surface":  { default: "white",    _dark: "#0a0a0a" },
    "text.primary":{ default: "gray.900", _dark: "white" },
    "text.muted":  { default: "gray.600", _dark: "gray.400" },
    "border.default": { default: "gray.200", _dark: "gray.700" },
    "accent.solid":{ default: "accent.500", _dark: "accent.400" },
    "accent.on":   { default: "white",       _dark: "gray.900" },
    // helpers (optional)
    "grad.blue.1": { default: "brand.400", _dark: "brand.500" },
    "grad.blue.2": { default: "brand.600", _dark: "brand.700" },
    "grad.gold.1": { default: "accent.400", _dark: "accent.500" },
    "grad.gold.2": { default: "accent.600", _dark: "accent.700" },
  },
};

/** ---- Global styles (keep it simple; rely on tokens) ---- */
const styles = {
  global: {
    "html, body, #root": {
      height: "100%",
      background: "bg.canvas",
      color: "text.primary",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    a: {
      color: "accent.500",
      _hover: { color: "accent.600", textDecoration: "none" },
    },
    "p, span, div, h1, h2, h3, h4, h5, h6, .chakra-text, .chakra-heading": {
      color: "inherit",
    },
    "h1, .chakra-heading[data-level='1']": {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    "h2, .chakra-heading[data-level='2']": {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    p: { lineHeight: 1.6 },
    "input, select, textarea": {
      color: "text.primary",
      background: "bg.surface",
      borderColor: "border.default",
      _placeholder: { color: "text.muted" },
    },
    ".chakra-input, .chakra-select, .chakra-textarea": {
      color: "text.primary",
      background: "bg.surface",
      borderColor: "border.default",
      _placeholder: { color: "text.muted" },
    },
    ".chakra-button": {
      _hover: { transform: "translateY(-1px)" },
    },
  },
};

/** ---- Theme config ---- */
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
  // direction: "ltr", // keep this; your i18n can flip <html dir="rtl"> when Arabic
};

/** ---- Build the v2 theme ---- */
const theme = extendTheme({
  config,
  colors,
  fonts,
  semanticTokens,
  styles,
});

export default theme;
