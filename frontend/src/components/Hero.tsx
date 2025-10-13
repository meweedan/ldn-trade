// src/components/Hero.tsx
import React from "react";
import { Box, Container, VStack, HStack, Button, Text, useToken } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import FadeInText from "./FadeInText";
import { useThemeMode } from "../themeProvider";
import { useSessionMemory } from "../hooks/useSessionMemory";
import { useCohortDeadline } from "../hooks/useCohortDeadline";
import api from "../api/client";

const GOLD = "#b7a27d";
const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

function GradientPill({
  children,
  size = "lg",
  mode = "dark",
}: {
  children: React.ReactNode;
  size?: "sm" | "lg";
  mode?: "light" | "dark" | string;
}) {
  const padding = size === "lg" ? { px: 4, py: 2.5 } : { px: 3, py: 1.5 };
  return (
    <Box
      bg={mode === "dark" ? "black" : "white"}
      border="1px solid"
      borderColor={GOLD}
      borderRadius="24px"
      textAlign="center"
      boxShadow="0 12px 28px rgba(0,0,0,0.18)"
      backdropFilter="blur(10px) saturate(1.08)"
      {...padding}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      {children}
    </Box>
  );
}

export default function Hero() {
  const { t, i18n } = useTranslation() as any;
  const navigate = useNavigate();
  const dir: "ltr" | "rtl" = i18n.dir?.() || (i18n.language?.startsWith("ar") ? "rtl" : "ltr");
  const { mode } = useThemeMode();
  const [shadowLg] = useToken("shadows", ["lg"]);

  // Persisted per-user deadline (1 hour for demo; set to 72 if you want 3 days)
  const { session } = useSessionMemory();
  const { deadline } = useCohortDeadline({
    hours: 1,
    storageKey: "cohort_deadline_ms",
    fixedDeadlineMs:
      session.utm?.campaign === "cohort" ? Date.now() + 1 * 60 * 60 * 1000 : undefined,
  });

  // On-scroll fade (optional subtle effect)
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

  // Countdown + red-flash seconds
  const [remain, setRemain] = React.useState<number>(Math.max(0, deadline - Date.now()));
  const [expired, setExpired] = React.useState(remain <= 0);
  const [flash, setFlash] = React.useState(false);

  React.useEffect(() => {
    const saved = Number(localStorage.getItem("cohort_deadline_ms"));
    if (!saved || saved <= Date.now()) {
      localStorage.setItem("cohort_deadline_ms", String(deadline));
    }
  }, [deadline]);

  React.useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, deadline - Date.now());
      setRemain(ms);
      if (ms > 0) {
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
      } else if (!expired) {
        setExpired(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, expired]);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const total = Math.max(0, Math.floor(remain / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const parts = [
    ...(d > 0 ? [{ label: i18n.t("time.days_short", "d"), value: String(d) }] : []),
    { label: i18n.t("time.hours_short", "h"), value: pad2(h) },
    { label: i18n.t("time.minutes_short", "m"), value: pad2(m) },
    { label: i18n.t("time.seconds_short", "s"), value: pad2(s) },
  ];

  // Promo (public; accept <=10% while timer runs, then fallback 5% after expiry)
  type PromoPayload = { code?: string; discountType?: "PERCENT" | "AMOUNT"; value?: number };
  const [promo, setPromo] = React.useState<{ code: string; value: number } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.get("/promos/cohort").catch(() => ({ data: null }));
        const data: PromoPayload | null = (r as any)?.data || null;
        if (!data?.code) return;
        const isPercent = String(data.discountType || "").toUpperCase() === "PERCENT";
        const val = Number(data.value);
        if (!isPercent || !Number.isFinite(val) || val <= 0 || val > 10) return;
        if (mounted) setPromo({ code: String(data.code).toUpperCase(), value: val });
      } catch {
        // no promo
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // When expired, force a 5% late promo if there isn't one already
  React.useEffect(() => {
    if (expired) setPromo((p) => p ?? { code: "LATE5", value: 5 });
  }, [expired]);

  // Subtle entrance anim
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
      {/* Desktop background */}
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        width="150% auto"
        inset={0}
        style={{
          backgroundImage:"url('/candlesticks.gif')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        zIndex={1}
      />
      {/* Mobile background */}
      <Box
        display={{ base: "block", md: "none" }}
        position="absolute"
        inset={0}
        zIndex={0}
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          bgImage:"url('/candlesticks.gif')",
          bgSize: "cover",
          bgRepeat: "no-repeat",
          bgPosition: "center",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxW={{ base: "92%", md: "container.2xl" }}
        position="absolute"
        inset={0}
        zIndex={4}
        px={{ base: 4, md: 8 }}
        style={{ opacity: heroOpacity }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={5} align="center" textAlign="center" dir={dir}>
          {/* Title */}
          <GradientPill mode={mode} size="lg">
            <FadeInText
              as="h1"
              dir={dir}
              fontSize={{ base: "2xl", md: "5xl", lg: "6xl" }}
              fontWeight="bold"
              color={mode === "dark" ? "#b7a27d" : "#b7a27d"}
            >
              {t("home.hero.title")}
            </FadeInText>
          </GradientPill>

          {/* Subtitle */}
          <GradientPill mode={mode} size="sm">
            <FadeInText
              as="p"
              dir={dir}
              fontSize={{ base: "md", md: "xl" }}
              fontWeight="bold"
              color={mode === "dark" ? "#b7a27d" : "#b7a27d"}
            >
              {t("home.hero.subtitle")}
            </FadeInText>
          </GradientPill>

          {/* Mobile centered countdown chip */}
          <Box display={{ base: "block", md: "none" }} w="100%">
            {!expired && (
              <MotionBox
                role="status"
                aria-live="polite"
                variants={pulse}
                initial="initial"
                animate="animate"
                alignSelf="center"
                bg={mode === "dark" ? "black" : "white"}
                color={mode === "dark" ? "white" : "black"}
                border="1px solid"
                borderColor={GOLD}
                boxShadow={shadowLg}
                borderRadius="24px"
                px={3}
                py={2}
                backdropFilter="blur(8px)"
                mx="auto"
                mb={1}
                maxW="min(100%, 560px)"
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
                    {parts.map((p, i) => {
                      const isSec = p.label === i18n.t("time.seconds_short", "s");
                      return (
                        <Box
                          key={`${p.label}-${i}`}
                          px={2}
                          py={1}
                          bgGradient={`linear(to-b, ${GOLD}, ${
                            mode === "dark" ? "#9b8a6b" : "#cbb89a"
                          })`}
                          color={isSec && flash ? "red.400" : "white"}
                          fontWeight="bold"
                          lineHeight="1"
                          minW="ch"
                          textAlign="center"
                          boxShadow={
                            isSec
                              ? "0 6px 18px rgba(255,0,0,0.35)"
                              : "0 6px 18px rgba(183,162,125,0.35)"
                          }
                        >
                          <Text as="span" fontFamily="mono" fontSize="sm">
                            {p.value}
                          </Text>
                          <Text as="span" ms={1} fontSize="xs" opacity={0.9}>
                            {p.label}
                          </Text>
                        </Box>
                      );
                    })}
                  </MotionHStack>
                </HStack>
              </MotionBox>
            )}

            {/* Mobile promo */}
            {promo?.code && (
              <MotionBox
                mt={2}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                bg={mode === "dark" ? "black" : "white"}
                color={mode === "dark" ? "white" : "black"}
                border="1px solid"
                borderColor={GOLD}
                boxShadow={shadowLg}
                borderRadius="20px"
                px={3}
                py={2}
                backdropFilter="blur(8px)"
                mx="auto"
                maxW="min(100%, 560px)"
              >
                <HStack gap={2} justify="center" wrap="wrap">
                  <Text fontSize="sm" opacity={0.95}>
                    {expired
                      ? t("home.promo.kicker_late", "Late access promo:")
                      : t("home.promo.kicker", "Limited-time cohort promo:")}
                  </Text>
                  <Box
                    px={2}
                    py={1}
                    borderRadius="md"
                    bgGradient={`linear(to-b, ${GOLD}, ${mode === "dark" ? "#9b8a6b" : "#cbb89a"})`}
                    color="white"
                    fontWeight="bold"
                  >
                    {promo.code}
                  </Box>
                  <Button
                    size="xs"
                    variant="outline"
                    borderColor={GOLD}
                    color={GOLD}
                    _hover={{ bg: "#b7a27d", color: "white" }}
                    onClick={() => copy(promo.code)}
                  >
                    {copied ? t("common.copied", "Copied") : t("home.promo.copy", "Copy")}
                  </Button>
                </HStack>
                <Text mt={1} fontSize="xs" opacity={0.8} textAlign="center">
                  {expired
                    ? t("home.promo.details_late", "Missed the cohort? Use this late access code.")
                    : t(
                        "home.promo.details",
                        "Save up to 10% — apply this code before the timer ends."
                      )}
                </Text>
              </MotionBox>
            )}
          </Box>

          {/* Desktop centered timer/promo */}
          <Box display={{ base: "none", md: "block" }} w="100%">
            <VStack gap={3} align="center">
              {!expired && (
                <MotionBox
                  role="status"
                  aria-live="polite"
                  variants={pulse}
                  initial="initial"
                  animate="animate"
                  bg={mode === "dark" ? "black" : "white"}
                  color={mode === "dark" ? "white" : "black"}
                  border="1px solid"
                  borderColor={GOLD}
                  boxShadow="0 16px 40px rgba(0,0,0,0.18)"
                  borderRadius="24px"
                  px={5}
                  py={4}
                  backdropFilter="blur(10px) saturate(1.1)"
                  maxW="min(100%, 720px)"
                  mx="auto"
                >
                  <VStack gap={3} align="center">
                    <Text fontSize="lg" fontWeight="bold" opacity={0.95}>
                      {t("home.urgency.kicker", "Cohort enrollment closes in")}
                    </Text>
                    <MotionHStack
                      gap={2}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                      flexWrap="wrap"
                      justify="center"
                    >
                      {parts.map((p, i) => {
                        const isSec = p.label === i18n.t("time.seconds_short", "s");
                        return (
                          <Box
                            key={`${p.label}-${i}`}
                            px={3}
                            py={2}
                            borderRadius="md"
                            bgGradient={`linear(to-b, ${GOLD}, ${
                              mode === "dark" ? "#9b8a6b" : "#cbb89a"
                            })`}
                            color={isSec && flash ? "red.400" : "white"}
                            fontWeight="bold"
                            lineHeight="1"
                            minW="ch"
                            textAlign="center"
                            boxShadow={
                              isSec
                                ? "0 8px 22px rgba(255,0,0,0.35)"
                                : "0 8px 22px rgba(183,162,125,0.35)"
                            }
                          >
                            <Text as="span" fontFamily="mono" fontSize="lg">
                              {p.value}
                            </Text>
                            <Text as="span" ms={2} fontSize="xs" opacity={0.9}>
                              {p.label}
                            </Text>
                          </Box>
                        );
                      })}
                    </MotionHStack>
                  </VStack>
                </MotionBox>
              )}

              {promo?.code && (
                <MotionBox
                  w="100%"
                  mt={2}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  bg={mode === "dark" ? "black" : "white"}
                  color={mode === "dark" ? "white" : "black"}
                  border="1px solid"
                  borderColor={GOLD}
                  boxShadow="0 12px 28px rgba(0,0,0,0.18)"
                  borderRadius="18px"
                  px={4}
                  py={3}
                  backdropFilter="blur(8px)"
                  maxW="min(100%, 720px)"
                  mx="auto"
                >
                  <HStack gap={3} justify="center" flexWrap="wrap">
                    <Text fontWeight="semibold">
                      {expired
                        ? t("home.promo.kicker_late", "Late access promo:")
                        : t("home.promo.kicker", "Limited-time cohort promo:")}
                    </Text>
                    <HStack gap={2}>
                      <Box
                        px={3}
                        py={1}
                        borderRadius="md"
                        bgGradient={`linear(to-b, ${GOLD}, ${
                          mode === "dark" ? "#9b8a6b" : "#cbb89a"
                        })`}
                        color="white"
                        fontWeight="bold"
                      >
                        {promo.code}
                      </Box>
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor={GOLD}
                        color={GOLD}
                        _hover={{ bg: "#b7a27d", color: "white" }}
                        onClick={() => copy(promo.code)}
                      >
                        {copied ? t("common.copied", "Copied") : t("home.promo.copy", "Copy")}
                      </Button>
                    </HStack>
                  </HStack>
                  <Text mt={1} fontSize="sm" opacity={0.85} textAlign="center">
                    {expired
                      ? t(
                          "home.promo.details_late",
                          "Missed the cohort? Use this late access code."
                        )
                      : t(
                          "home.promo.details",
                          "Save up to 10% — apply this code before the timer ends."
                        )}
                  </Text>
                </MotionBox>
              )}
            </VStack>
          </Box>

          {/* CTAs */}
          <HStack gap={3} pt={1} justify="center" flexWrap="wrap">
            <Button
              bg={GOLD}
              color={mode === "dark" ? "white" : "black"}
              borderColor={GOLD}
              borderWidth="1px"
              _hover={{ bg: "blackAlpha.300" }}
              onClick={() => navigate(expired ? "/contact" : "/courses")}
              borderRadius="xl"
            >
              {expired
                ? t("home.urgency.waitlist", "Join the Waitlist")
                : t("home.hero.cta_primary")}
            </Button>
            <Button
              variant="solid"
              bg={GOLD}
              borderColor={GOLD}
              color={mode === "dark" ? "white" : "black"}
              _hover={{ bg: "blackAlpha.300" }}
              onClick={() => navigate("/company/about")}
              borderRadius="xl"
            >
              {t("footer.about", { defaultValue: "About Us" })}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
