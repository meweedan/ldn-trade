// src/components/Hero.tsx
import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  useBreakpointValue,
  Text,
  useToken,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import FadeInText from "./FadeInText";
import { useThemeMode } from "../themeProvider";
import { useSessionMemory } from "../hooks/useSessionMemory";
import { useCohortDeadline } from "../hooks/useCohortDeadline";

const GOLD = "#b7a27d";
const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

export default function Hero() {
  const { t, i18n } = useTranslation() as any;
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const dir: "ltr" | "rtl" = i18n.dir?.() || (i18n.language?.startsWith("ar") ? "rtl" : "ltr");
  const isRTL = dir === "rtl";
  const { mode } = useThemeMode();
  const [shadowLg] = useToken("shadows", ["lg"]);

  const { session } = useSessionMemory();
  const { deadline } = useCohortDeadline({
    hours: 72,
    storageKey: "cohort_deadline_ms",
    fixedDeadlineMs: session.utm?.campaign === "cohort" ? Date.now() + 72 * 60 * 60 * 1000 : undefined,
  });

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

  // === Convincing countdown (72h per user; persists) ===
  const [remain, setRemain] = React.useState<number>(Math.max(0, deadline - Date.now()));

  React.useEffect(() => {
    const saved = Number(localStorage.getItem("cohort_deadline_ms"));
    if (!saved || saved <= Date.now()) {
      localStorage.setItem("cohort_deadline_ms", String(deadline));
    }
  }, [deadline]);

  React.useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, deadline - Date.now());
      setRemain((prev) => (Math.floor(prev / 1000) === Math.floor(next / 1000) ? prev : next));
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const parts = React.useMemo(() => {
    const total = Math.max(0, Math.floor(remain / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const p: { label: string; value: string }[] = [];
    if (d > 0) p.push({ label: i18n.t("time.days_short", "d"), value: String(d) });
    p.push({ label: i18n.t("time.hours_short", "h"), value: pad2(h) });
    p.push({ label: i18n.t("time.minutes_short", "m"), value: pad2(m) });
    p.push({ label: i18n.t("time.seconds_short", "s"), value: pad2(s) });
    return p;
  }, [remain, i18n]);

  const pulse = {
    initial: { opacity: 0, y: -6, filter: "saturate(0.9)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "saturate(1)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <Box
      as="section"
      position="relative"
      minH={{ base: "96vh", md: "94vh" }}
      overflow="hidden"
      dir={dir}
    >
      {/* Desktop background GIF */}
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        width="150% auto"
        inset={0}
        style={{
          backgroundImage:
            typeof mode !== "undefined" && mode === "dark"
              ? "url('/candlesticks.gif')"
              : "url('/inverted_candlesticks.gif')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        zIndex={1}
      />
      {/* Mobile background GIF */}
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
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxW={{ base: "90%", md: "container.2xl" }}
        position="absolute"
        inset={0}
        zIndex={4}
        px={{ base: 4, md: 8 }}
        style={{ opacity: heroOpacity }}
      >
        {/* Text block */}
        <Box
          position="absolute"
          top={{ base: "36%", md: "50%" }}
          left={isRTL ? "auto" : { base: "50%", md: 8 }}
          right={isRTL ? { base: "50%", md: 8 } : "auto"}
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

            {/* Mobile inline countdown chip (centered) */}
            <Box display={{ base: "block", md: "none" }}>
              <MotionBox
                role="status"
                aria-live="polite"
                variants={pulse}
                initial="initial"
                animate="animate"
                alignSelf="center"
                bg={mode === "dark" ? "blackAlpha.600" : "whiteAlpha.700"}
                color={mode === "dark" ? "whiteAlpha.900" : "blackAlpha.900"}
                border="1px solid"
                borderColor={mode === "dark" ? "whiteAlpha.300" : "blackAlpha.200"}
                boxShadow={shadowLg}
                borderRadius="md"
                px={3}
                py={2}
                backdropFilter="blur(8px)"
                mb={1}
              >
                <HStack gap={2} wrap="wrap" justify="center">
                  <Text fontSize="sm" opacity={0.9} fontWeight="semibold">
                    {t("home.urgency.kicker", "Cohort enrollment closes in")}
                  </Text>
                  <MotionHStack
                    gap={1.5}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                  >
                    {parts.map((p, i) => (
                      <Box
                        key={`${p.label}-${i}`}
                        px={2}
                        py={1}
                        bgGradient={`linear(to-b, ${GOLD}, ${
                          mode === "dark" ? "#9b8a6b" : "#cbb89a"
                        })`}
                        color="white"
                        fontWeight="bold"
                        lineHeight="1"
                        minW="ch"
                        textAlign="center"
                        boxShadow="0 6px 18px rgba(183,162,125,0.35)"
                      >
                        <Text as="span" fontFamily="mono" fontSize="sm">
                          {p.value}
                        </Text>
                        <Text as="span" ms={1} fontSize="xs" opacity={0.9}>
                          {p.label}
                        </Text>
                      </Box>
                    ))}
                  </MotionHStack>
                </HStack>
              </MotionBox>
            </Box>

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

        {/* Desktop opposite-side countdown (auto-flips for RTL) */}
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          top="50%"
          transform="translateY(-50%)"
          right={isRTL ? "auto" : 8}
          left={isRTL ? 8 : "auto"}
          zIndex={5}
          maxW="520px"
        >
          <MotionBox
            role="status"
            aria-live="polite"
            variants={pulse}
            initial="initial"
            animate="animate"
            bg={mode === "dark" ? "blackAlpha.600" : "whiteAlpha.7"}
            color={mode === "dark" ? "whiteAlpha.900" : "blackAlpha.900"}
            border="1px solid"
            borderColor={mode === "dark" ? "whiteAlpha.300" : "blackAlpha.200"}
            boxShadow="0 16px 40px rgba(0,0,0,0.18)"
            borderRadius="24px"
            px={5}
            py={4}
            backdropFilter="blur(10px) saturate(1.1)"
          >
            <VStack gap={3} align={isRTL ? "flex-start" : "flex-start"}>
              <Text fontSize="lg" fontWeight="bold" opacity={0.95}>
                {t("home.urgency.kicker", "Cohort enrollment closes in")}
              </Text>
              <MotionHStack
                gap={2}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                flexWrap="wrap"
              >
                {parts.map((p, i) => (
                  <Box
                    key={`${p.label}-${i}`}
                    px={3}
                    py={2}
                    borderRadius="md"
                    bgGradient={`linear(to-b, ${GOLD}, ${mode === "dark" ? "#9b8a6b" : "#cbb89a"})`}
                    color="white"
                    fontWeight="bold"
                    lineHeight="1"
                    minW="ch"
                    textAlign="center"
                    boxShadow="0 8px 22px rgba(183,162,125,0.35)"
                  >
                    <Text as="span" fontFamily="mono" fontSize="lg">
                      {p.value}
                    </Text>
                    <Text as="span" ms={2} fontSize="xs" opacity={0.9}>
                      {p.label}
                    </Text>
                  </Box>
                ))}
              </MotionHStack>

              <HStack gap={3} pt={1}>
                <Button
                  size="sm"
                  bg={GOLD}
                  _hover={{ color: "black" }}
                  color="white"
                  borderRadius="full"
                  onClick={() => navigate("/courses")}
                >
                  {t("home.urgency.enroll", "Enroll Now")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor={GOLD}
                  color={GOLD}
                  borderRadius="full"
                  _hover={{ bg: "#b7a27d", color: "white" }}
                  onClick={() => navigate("/contact")}
                >
                  {t("home.urgency.talk", "Talk to an Advisor")}
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
}
