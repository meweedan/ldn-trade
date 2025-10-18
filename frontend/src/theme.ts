// src/theme/index.ts (Chakra v2)
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

/** ---- Color scales ---- */
const colors = {
  brand: {
    50:"#f7f3ea",100:"#efe6d3",200:"#e2d3b3",300:"#d3bf92",400:"#c1aa7b",
    500:"#b7a27d",600:"#9e8964",700:"#7d6c4f",800:"#5f523d",900:"#3f372a",
  },
  accent: {
    50:"#fbf8f1",100:"#f2ead7",200:"#e6d6b3",300:"#d9c18e",400:"#cdae6f",
    500:"#b7a27d",600:"#9f8f66",700:"#827552",800:"#665b40",900:"#4b4330",
  },
  sand: {
    50:"#faf7f2",100:"#f3ede2",200:"#e8dcc5",300:"#decdaa",400:"#cdb688",
    500:"#b7a27d",600:"#9e8d69",700:"#7f7153",800:"#5f5740",900:"#3f3a2b",
  },
  gray: {
    50:"#F7FAFC",100:"#EDF2F7",200:"#E2E8F0",300:"#CBD5E0",400:"#A0AEC0",
    500:"#718096",600:"#4A5568",700:"#2D3748",800:"#1F2937",900:"#111827",
  },
};

/** ---- Base font stacks (overridden by dir-specific globals) ---- */
const fonts = {
  heading:
    "'FuturaCustom', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  body:
    "'FuturaCustom', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

/** ---- Semantic tokens ---- */
const semanticTokens = {
  colors: {
    "bg.canvas":   { default: "sand.50",  _dark: "black" },
    "bg.surface":  { default: "white",    _dark: "#0a0a0a" },
    "text.primary":{ default: "gray.900", _dark: "white" },
    "text.muted":  { default: "gray.600", _dark: "gray.400" },
    "border.default": { default: "gray.200", _dark: "gray.700" },
    "accent.solid":{ default: "accent.500", _dark: "accent.400" },
    "accent.on":   { default: "white",       _dark: "gray.900" },
    "grad.blue.1": { default: "brand.400", _dark: "brand.500" },
    "grad.blue.2": { default: "brand.600", _dark: "brand.700" },
    "grad.gold.1": { default: "accent.400", _dark: "accent.500" },
    "grad.gold.2": { default: "accent.600", _dark: "accent.700" },
  },
};

/** ---- Global styles (dir-aware font families + utilities) ---- */
const styles = {
  global: {
    /* Base canvas and stacking */
    "html, body": {
      height: "100%",
      background: "bg.canvas",
      color: "text.primary",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    /* Important: keep #root transparent and above the decorative layers */
    "#root": {
      height: "100%",
      background: "transparent !important",
      position: "relative",
      zIndex: 3, // content baseline
    },

    /* ------------------------------------------------------
       Dot pattern layer (now above section BGs, below content)
       ------------------------------------------------------ */
    "body::before": {
      content: "''",
      position: "fixed",
      inset: 0,
      zIndex: 2,              // ↑ above hero BG (z=0/1), below content (z=3+)
      pointerEvents: "none",

      /* mode-aware dot color via CSS var */
      backgroundImage: "radial-gradient(var(--dot-color, rgba(0,0,0,0.06)) 1.2px, transparent 2px)",
      backgroundSize: "22px 22px", // less condensed dots
      backgroundPosition: "0 0",

      /* Shallower fade so dots still appear right at the top */
      WebkitMaskImage:
        "linear-gradient(to bottom, transparent 0, black 3vh, black calc(100% - 3vh), transparent 100%)",
      maskImage:
        "linear-gradient(to bottom, transparent 0, black 3vh, black calc(100% - 3vh), transparent 100%)",
    },

    /* ------------------------------------------------------
       Subtle #b7a27d shimmer at top & bottom (also above hero BGs)
       ------------------------------------------------------ */
    "body::after": {
      content: "''",
      position: "fixed",
      inset: 0,
      zIndex: 2,              // sits with dots layer; ::after paints above ::before
      pointerEvents: "none",
      backgroundImage:
        "linear-gradient(to bottom, rgba(134, 112, 74, 0.24), rgba(183,162,125,0))," +
        "linear-gradient(to top, rgba(134, 112, 74, 0.24), rgba(183,162,125,0))",
      backgroundRepeat: "no-repeat, no-repeat",
      backgroundPosition: "top, bottom",
      backgroundSize: "100% 25vh, 100% 25vh", // slightly slimmer for elegance
      filter: "blur(0.2px)",
    },

    /* ---- Light mode dot color ---- */
    "html:not([data-theme='dark']).chakra-ui-light body, html:not([data-theme='dark']) body:not(.chakra-ui-dark)":
      { "--dot-color": "rgba(0,0,0,0.09)" },

    /* ---- Dark mode dot color (brand gold) ---- */
    "html.chakra-ui-dark body, body.chakra-ui-dark, html[data-theme='dark'] body, [data-theme='dark'] body":
      { "--dot-color": "rgba(183,162,125,0.12)" },

    /* === Dir-aware base font === */
    "html[dir='ltr'] body": {
      fontFamily:
        "'FuturaCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji' !important",
    },
    "html[dir='rtl'] body": {
      fontFamily:
        "'Hacen-Liner-Print-Out', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji' !important",
      fontWeight: 400,
    },

    /* === Headings default === */
    ".chakra-heading": {
      fontFamily:
        "'FuturaCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial !important",
    },
    "html[dir='rtl'] .chakra-heading": {
      fontFamily: "'Hacen-Liner-Print-Out' !important",
      fontWeight: 400,
    },

    a: { color: "accent.500", _hover: { color: "accent.600", textDecoration: "none" } },
    "p, span, div, h1, h2, h3, h4, h5, h6, .chakra-text, .chakra-heading": { color: "inherit" },
    "h1, .chakra-heading[data-level='1']": { fontWeight: 800, letterSpacing: "-0.02em" },
    "h2, .chakra-heading[data-level='2']": { fontWeight: 700, letterSpacing: "-0.01em" },
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
    ".chakra-button": { _hover: { transform: "translateY(-1px)" } },

    /* === Optional section heading underline === */
    ".section-heading": {
      fontFamily:
        "'FuturaCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji' !important",
      fontWeight: 500,
      letterSpacing: "0.02em",
      lineHeight: 1.02,
      position: "relative",
      display: "inline-block",
    },
    ".section-heading::after": {
      content: "''",
      position: "absolute",
      left: 0,
      right: 0,
      bottom: "-6px",
      height: "2px",
      background: "#b7a27d",
      borderRadius: "9999px",
    },
    "html[dir='rtl'] .section-heading, body[dir='rtl'] .section-heading": {
      fontFamily: "'Hacen-Liner-Print-Out' !important",
      fontWeight: 400,
    },
  },
};

/** ---- Component-level: Heading variant for section titles ---- */
const components = {
  Heading: {
    variants: {
      section: {
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.02,
        display: "inline-block",
        position: "relative",
        _after: {
          content: "''",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-6px",
          height: "2px",
          bg: "accent.solid",
          borderRadius: "full",
        },
      },
    },
  },
};

/** ---- Theme config ---- */
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
  // direction is handled by i18n toggling <html dir="rtl"> when Arabic
};

/** ---- Build theme ---- */
const theme = extendTheme({
  config,
  colors,
  fonts,
  semanticTokens,
  styles,
  components,
});

export default theme;
