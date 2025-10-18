// src/components/TimelineNewsTabs.tsx
/* eslint-disable */
import * as React from "react";
import { Box, Button, HStack, VStack, Heading, Divider } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type Props = {
  mode: "light" | "dark";
  i18nLang: string; // "en", "fr", "ar"
  accentColor?: string;
  height?: number;
};

const resolveLocale = (lang: string) => {
  const base = (lang || "en").split("-")[0].toLowerCase();
  return base === "fr" ? "fr" : "en"; // avoid AR here to prevent TV errors
};

function tvTimelineUrl(params: {
  feedMode: "market" | "symbol";
  market?: "forex" | "crypto" | "index";
  symbol?: string;
  theme: "light" | "dark";
  locale: "en" | "fr";
}) {
  const base = "https://s.tradingview.com/embed-widget/timeline/";
  const query = `?locale=${encodeURIComponent(params.locale)}`;
  const cfg = encodeURIComponent(
    JSON.stringify({
      feedMode: params.feedMode,
      market: params.market,
      symbol: params.symbol,
      colorTheme: params.theme,
      isTransparent: true,
      displayMode: "adaptive",
    })
  );
  return `${base}${query}#${cfg}`;
}

const Section: React.FC<{ title: string; accent: string; children: React.ReactNode }> = ({
  title,
  accent,
  children,
}) => (
  <VStack align="stretch" spacing={2} mb={6}>
    <Heading as="h3" size="sm" color={accent} px={1}>
      {title}
    </Heading>
    <Divider borderColor={accent} opacity={0.35} />
    {children}
  </VStack>
);

const TimelineNewsTabs: React.FC<Props> = ({
  mode,
  i18nLang,
  accentColor = "#b7a27d",
  height = 360,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState<0 | 1>(0);
  const locale = resolveLocale(i18nLang);

  const forexAll = tvTimelineUrl({ feedMode: "market", market: "forex", theme: mode, locale });
  const goldXAU = tvTimelineUrl({
    feedMode: "symbol",
    symbol: "OANDA:XAUUSD",
    theme: mode,
    locale,
  });
  const indices = tvTimelineUrl({ feedMode: "market", market: "index", theme: mode, locale });
  const cryptoAll = tvTimelineUrl({ feedMode: "market", market: "crypto", theme: mode, locale });

  return (
    <Box
      borderWidth="1px"
      borderColor={accentColor}
      borderRadius="xl"
      p={2}
      bg={mode === "dark" ? "black" : "white"}
      // ⬇️ Force crisp text color by theme (fixes gray-on-white in light mode)
      color={mode === "dark" ? "white" : "black"}
    >
      <HStack gap={8} justify="center" mb={3} wrap="wrap">
        <Button
          onClick={() => setTab(0)}
          size="sm"
          borderRadius="8px"
          border="1px solid"
          borderColor={accentColor}
          bg={tab === 0 ? accentColor : "transparent"}
          color={tab === 0 ? "white" : accentColor}
          _hover={{ bg: tab === 0 ? accentColor : "rgba(183,162,125,0.1)" }}
        >
          {t("Forex_Gold_Indices")}
        </Button>
        <Button
          onClick={() => setTab(1)}
          size="sm"
          borderRadius="8px"
          border="1px solid"
          borderColor={accentColor}
          bg={tab === 1 ? accentColor : "transparent"}
          color={tab === 1 ? "white" : accentColor}
          _hover={{ bg: tab === 1 ? accentColor : "rgba(183,162,125,0.1)" }}
        >
          {t("Crypto")}
        </Button>
      </HStack>

      <Box position="relative">
        <Box style={{ display: tab === 0 ? "block" : "none" }}>
          <Section title={t("All_Forex_Headlines")} accent={accentColor}>
            <iframe
              key={`tv-forexAll-${mode}-${locale}`}
              title={t("Forex_Timeline")}
              src={forexAll}
              style={{ border: 0, width: "100%", height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write; fullscreen"
            />
          </Section>

          <Section title={t("Gold_XAUUSD_Headlines")} accent={accentColor}>
            <iframe
              key={`tv-gold-${mode}-${locale}`}
              title={t("Gold_Timeline")}
              src={goldXAU}
              style={{ border: 0, width: "100%", height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write; fullscreen"
            />
          </Section>

          <Section title={t("Indices_Headlines")} accent={accentColor}>
            <iframe
              key={`tv-indices-${mode}-${locale}`}
              title={t("Indices_Timeline")}
              src={indices}
              style={{ border: 0, width: "100%", height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write; fullscreen"
            />
          </Section>
        </Box>

        <Box style={{ display: tab === 1 ? "block" : "none" }}>
          <Section title={t("All_Crypto_Headlines")} accent={accentColor}>
            <iframe
              key={`tv-cryptoAll-${mode}-${locale}`}
              title={t("Crypto_Timeline")}
              src={cryptoAll}
              style={{ border: 0, width: "100%", height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write; fullscreen"
            />
          </Section>
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineNewsTabs;
