// src/components/Hero.tsx
import React from "react";
import { Box, Container, VStack, HStack, Button, useBreakpointValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FadeInText from "./FadeInText";
import { useThemeMode } from "../themeProvider";

const GOLD = "#b7a27d";

export default function Hero() {
  const { t, i18n } = useTranslation() as any;
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const dir: "ltr" | "rtl" = i18n.dir?.() || (i18n.language?.startsWith("ar") ? "rtl" : "ltr");
  const isRTL = dir === "rtl";
  const { mode } = useThemeMode();

  // Fade on scroll
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setY(window.scrollY || window.pageYOffset || 0);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const heroOpacity = Math.max(0, 1 - y / 250);

  return (
    <Box
      as="section"
      position="relative"
      minH={{ base: "96vh", md: "94vh" }}
      overflow="hidden"
      dir={dir}
    >
      {/* === Desktop layered imagery === */}
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        inset={0}
        bgImage="url('/images/rand/background-image.png')"
        bgRepeat="no-repeat"
        bgSize="100% 100%"
        bgPosition="center"
        opacity={0.25}
        zIndex={0}
      />
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        inset={0}
        bgImage="url('/images/rand/background-1.png')"
        bgRepeat="no-repeat"
        bgSize="100% 100%"
        bgPosition="center"
        opacity={0.35}
        zIndex={1}
      />
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        inset={0}
        style={{
          backgroundImage: "url('/images/rand/clouds.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        opacity={0.15}
        zIndex={2}
      />
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        insetY={0}
        left={0}
        w="100vw"
        bgImage="url('/images/rand/ldn-skyline.png')"
        bgRepeat="no-repeat"
        bgSize={{ base: "100% auto", md: "contain" }}
        bgPosition={isRTL ? "right bottom" : "left bottom"}
        opacity={0.5}
        zIndex={3}
      />

      {/* === Mobile: candlesticks GIF background === */}
      <Box
        display={{ base: "block", md: "none" }}
        position="absolute"
        inset={0}
        zIndex={0}
        bg={mode === "dark" ? "black" : "white"}
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          bgImage:
            mode === "dark" ? "url('/candlesticks.gif')" : "url('/inverted_candlesticks.gif')",
          bgSize: "cover",
          bgRepeat: "no-repeat",
          bgPosition: "center",
          opacity: 0.75,
          zIndex: 0,
        }}
      />

      {/* === Content === */}
      <Container
        maxW={{ base: "90%", md: "container.2xl" }}
        position="absolute"
        inset={0}
        zIndex={4}
        px={{ base: 4, md: 8 }}
        style={{ opacity: heroOpacity }}
      >
        <Box
          position="absolute"
          top={{ base: "36%", md: "50%" }}
          left={isRTL ? "auto" : { base: "50%", md: "auto" }}
          right={isRTL ? { base: "50%", md: 6 } : "auto"}
          transform={
            isRTL
              ? { base: "translateX(50%)", md: "translateY(-50%)" }
              : { base: "translateX(-50%)", md: "translateY(-50%)" }
          }
          maxW={{ base: "92%", md: "520px", lg: "540px" }}
          textAlign={{ base: "center", md: isRTL ? "right" : "left" }}
        >
          <VStack align="center" gap={5}>
            <FadeInText
              as="h1"
              dir={dir}
              fontSize={{ base: "2xl", md: "5xl", lg: "6xl" }}
              fontWeight="extrabold"
              color={isMobile ? GOLD : "#b7a27d"}
              align={{ base: "center", md: isRTL ? "right" : "left" }}
            >
              {t("home.hero.title")}
            </FadeInText>

            <FadeInText
              as="p"
              dir={dir}
              fontSize={{ base: "md", md: "xl" }}
              fontWeight="medium"
              color={isMobile ? (mode === "dark" ? "white" : "white") : "whiteAlpha.900"}
              align={{ base: "center", md: isRTL ? "right" : "left" }}
            >
              {t("home.hero.subtitle")}
            </FadeInText>

            <HStack justify="center" spacing={3} pt={1}>
              <Button
                bg={GOLD}
                color="black"
                borderColor={GOLD}
                borderWidth="1px"
                _hover={{ bg: "blackAlpha.300" }}
                onClick={() => navigate("/courses")}
                borderRadius="xl"
              >
                {t("home.hero.cta_primary")}
              </Button>

              <Button
                variant="solid"
                bg={GOLD}
                borderColor={GOLD}
                color={isMobile ? (mode === "dark" ? "whiteAlpha.900" : "black") : "white"}
                _hover={{ bg: "blackAlpha.300" }}
                onClick={() => navigate("/company/about")}
                borderRadius="xl"
              >
                {t("footer.about", { defaultValue: "About Us" })}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
