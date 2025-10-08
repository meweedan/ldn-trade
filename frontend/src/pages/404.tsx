// src/pages/404.tsx
import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Link,
  chakra,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { keyframes } from "@emotion/react";

const GOLD = "#b7a27d";

// Animations
const shimmer = keyframes`
  0% { background-position: 0% 50%; text-shadow: 0 0 6px rgba(183,162,125,0.35), 0 0 14px rgba(183,162,125,0.15); }
  50% { background-position: 100% 50%; text-shadow: 0 0 10px rgba(183,162,125,0.6), 0 0 22px rgba(183,162,125,0.25); }
  100% { background-position: 0% 50%; text-shadow: 0 0 6px rgba(183,162,125,0.35), 0 0 14px rgba(183,162,125,0.15); }
`;

const floatUp1 = keyframes`
  0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: .0; }
  10%  { opacity: .8; }
  50%  { opacity: .9; }
  100% { transform: translateY(-60px) translateX(10px) rotate(8deg); opacity: .0; }
`;

const floatUp2 = keyframes`
  0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: .0; }
  10%  { opacity: .85; }
  55%  { opacity: 1; }
  100% { transform: translateY(-70px) translateX(-12px) rotate(-8deg); opacity: .0; }
`;

const floatUp3 = keyframes`
  0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: .0; }
  15%  { opacity: .85; }
  60%  { opacity: 1; }
  100% { transform: translateY(-80px) translateX(6px) rotate(5deg); opacity: .0; }
`;

const Floating = chakra(Box);

export default function NotFound() {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");
  const { search } = useLocation();

  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const errorId = params.get("errorId");
  const code = params.get("code") || "404";

  const retry = () => window.location.reload();

  const SYMBOLS = ["₿", "Ξ", "Au", "📈", "📉", "💹", "🕯️"];

  function makeSymbolStyle(seed: number): React.CSSProperties {
    const rand = (min: number, max: number) => min + ((seed % 1000) / 1000) * (max - min);
    const left = `${Math.round(rand(5, 95))}%`;
    const top = `${Math.round(rand(5, 75))}%`;
    const dur = `${Math.round(rand(8, 16))}s`;
    const delay = `${Math.round(rand(-6, 6))}s`;

    return {
      position: "absolute",
      left,
      top,
      fontSize: "clamp(16px, 2.5vw, 28px)",
      opacity: 0.15,
      animation: `floatY ${dur} ease-in-out ${delay} infinite alternate`,
      pointerEvents: "none",
      userSelect: "none",
    };
  }

  const symbolStyles = React.useMemo<React.CSSProperties[]>(
    () => SYMBOLS.map((_, i) => makeSymbolStyle((Date.now() + i) % 10000)),
    []
  );

return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="5xl">
        <VStack align="stretch" gap={6}>
          {/* Decorative hero with animated 404 */}
          <Box position="relative">
            {SYMBOLS.map((sym, i) => (
              <Text key={i} style={symbolStyles[i]}>
                {sym}
              </Text>
            ))}
          </Box>

          {/* Header */}
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Heading size="lg">{t("errors.404.title") || "Page not found"}</Heading>
              <Badge colorScheme="yellow" variant="outline" borderColor={GOLD}>
                {t("errors.404.code") || "Error"}: {code}
              </Badge>
            </HStack>

            <Text color="text.muted">
              {t("errors.404.subtitle") ||
                "The page you’re looking for isn’t available, or our servers had a brief hiccup."}
            </Text>

            {errorId ? (
              <HStack gap={2}>
                <Badge variant="subtle" colorScheme="yellow">
                  {t("errors.404.trace") || "Trace ID"}
                </Badge>
                <Text color="text.muted" fontFamily="mono">
                  {errorId}
                </Text>
              </HStack>
            ) : null}
          </VStack>

          {/* Actions */}
          <HStack gap={3} flexWrap="wrap">
            <RouterLink to="/">
              <Button bg={GOLD} color="black" _hover={{ opacity: 0.9 }} borderRadius="xl">
                {t("errors.404.cta_home") || "Go to Home"}
              </Button>
            </RouterLink>
            <Button
              variant="outline"
              borderColor={GOLD}
              color={GOLD}
              _hover={{ bg: "blackAlpha.300" }}
              borderRadius="xl"
              onClick={retry}
            >
              {t("errors.404.cta_retry") || "Try Again"}
            </Button>
            <Link
              href={`mailto:${t("legal.common.support_email") || "support@ldnprime.com"}`}
              _hover={{ textDecoration: "none", opacity: 0.9 }}
            >
              <Button variant="ghost" borderRadius="xl">
                {t("errors.404.cta_support") || "Contact Support"}
              </Button>
            </Link>
          </HStack>

          <Text color="text.muted" fontSize="sm" opacity={0.8}>
            {t("errors.404.helper") ||
              "If this keeps happening, include the error code or trace ID when contacting support."}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
