/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Hero.tsx
import React from "react";
import { Box, Container, VStack, HStack, Button, Text, useToken, Progress, SimpleGrid, IconButton, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import FadeInText from "./FadeInText";
import { useThemeMode } from "../themeProvider";
import { useCohortDeadline } from "../hooks/useCohortDeadline";
import api from "../api/client";
import DisplacementSphere from "./DisplacementSphere";

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
      columnGap={2}
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

const InfinityLayer: React.FC<{
  count?: number;
  zIndex?: number;
}> = ({ count = 44, zIndex = 2 }) => {
  const [items, setItems] = React.useState<
    { id: number; left: string; top: string; size: number; delay: number; duration: number }[]
  >([]);

  React.useEffect(() => {
    // client-only randoms
    const arr = Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 92 + 4; // 4%..96%
      const top = Math.random() * 80 + 8; // 8%..88% (avoid extreme edges so shimmer stays visible)
      const size = Math.round(Math.random() * 18 + 16); // 16..34px
      const delay = Math.random() * 3; // 0..3s
      const duration = Math.random() * 4 + 4; // 4..8s fade cycle
      return { id: i, left: `${left}%`, top: `${top}%`, size, delay, duration };
    });
    setItems(arr);

    // optional re-shuffle every 15s
    const t = setInterval(() => {
      const shuffled = arr.map((it) => ({
        ...it,
        left: `${Math.random() * 92 + 4}%`,
        top: `${Math.random() * 80 + 8}%`,
        delay: Math.random() * 3,
        duration: Math.random() * 4 + 4,
      }));
      setItems(shuffled);
    }, 15000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <Box position="absolute" inset={0} zIndex={zIndex} pointerEvents="none" aria-hidden="true">
      {items.map((it) => (
        <motion.div
          key={it.id}
          style={{
            position: "absolute",
            left: it.left,
            top: it.top,
            fontSize: it.size,
            lineHeight: 1,
            filter: "saturate(0.9)",
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [8, 0, -6],
            scale: [0.9, 1, 0.98],
          }}
          transition={{
            delay: it.delay,
            duration: it.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ♾️
        </motion.div>
      ))}
    </Box>
  );
};

export default function Hero() {
  const { t, i18n } = useTranslation() as any;
  const navigate = useNavigate();
  const dir: "ltr" | "rtl" = i18n.dir?.() || (i18n.language?.startsWith("ar") ? "rtl" : "ltr");
  const { mode } = useThemeMode();
  const [shadowLg] = useToken("shadows", ["lg"]);

  // Persisted per-device deadline (1 hour). Do not reset on refresh.
  const storageKey = "cohort_deadline_ms";
  const saved = Number(localStorage.getItem(storageKey));
  const initial =
    Number.isFinite(saved) && saved > Date.now() ? saved : Date.now() + 1 * 60 * 60 * 1000;
  const { deadline } = useCohortDeadline({ hours: 1, storageKey, fixedDeadlineMs: initial });

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
  const [isMember, setIsMember] = React.useState(false);
  const [me, setMe] = React.useState<any>(null);
  const [recentCourses, setRecentCourses] = React.useState<any[]>([]);
  const [vipActive, setVipActive] = React.useState(false);
  const [vipEnd, setVipEnd] = React.useState<string | null>(null);
  const [tgLink, setTgLink] = React.useState<string>("");
  const [enrolledCount, setEnrolledCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);

  // Determine if user is enrolled or VIP
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [st, mine, meResp, courses] = await Promise.all([
          api.get("/community/status").catch(() => ({ data: null })),
          api.get("/purchase/mine").catch(() => ({ data: [] })),
          api.get("/users/me").catch(() => ({ data: null })),
          api.get("/courses").catch(() => ({ data: [] })),
        ]);
        const vip = !!(st as any)?.data?.vip;
        const tg = !!(st as any)?.data?.telegram;
        const vipEndDate = (st as any)?.data?.vipEnd || null;
        
        // Get Telegram URL from VIP tier
        const allTiers = Array.isArray((courses as any)?.data) ? (courses as any).data : [];
        const vipTier = allTiers.find((t: any) => t?.isVipProduct);
        const telegramUrl = vipTier?.telegramUrl || "";
        
        const list = Array.isArray((mine as any)?.data) ? (mine as any).data : [];
        const confirmed = list.filter(
          (p: any) => String(p.status || "").toUpperCase() === "CONFIRMED"
        );
        if (active) {
          setIsMember(vip || tg || confirmed.length > 0);
          setMe((meResp as any)?.data || null);
          setVipActive(vip);
          setVipEnd(vipEndDate);
          setTgLink(telegramUrl);
          setEnrolledCount(confirmed.length);
          // compute all confirmed courses — include tier for product links
          const recents = confirmed
            .sort(
              (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((p: any) => ({
              id: p?.tier?.id,
              name: p?.tier?.name || "Course",
              date: p.createdAt,
              tier: p?.tier,
            }));
          setRecentCourses(recents);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const savedNow = Number(localStorage.getItem(storageKey));
    if (!savedNow || savedNow <= Date.now()) {
      localStorage.setItem(storageKey, String(deadline));
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

  // Promo code is shown ONLY to guests now
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
    if (me) return; // do NOT fetch/show promos when logged in
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
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [me]);

  const codeToShow: string = expired ? "LATE5" : promo?.code ?? "";

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

  const isLoggedIn = !!me;

  return (
    <Box
      as="section"
      position="relative"
      minH={{ base: "96vh", md: "94vh" }}
      overflow="hidden"
      dir={dir}
    >
      <InfinityLayer count={12} zIndex={3} />
      {/* Displacement Sphere Background - always visible, morphs based on enrollment */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={3}
        pointerEvents="none"
        overflow="hidden"
        w={{ base: "min(110vw, 900px)", md: "min(88vw, 1200px)", lg: "min(70vw, 1400px)" }}
        h={{ base: "58vh", md: "62vh", lg: "68vh" }}
      >
        <DisplacementSphere />
      </Box>

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
          {/* Title / Welcome */}
          {!isLoggedIn ? (
            <>
              <GradientPill mode={mode} size="lg">
                <FadeInText
                  as="h1"
                  dir={dir}
                  fontSize={{ base: "2xl", md: "5xl", lg: "6xl" }}
                  fontWeight="bold"
                  color={GOLD}
                >
                  {t("home.hero.title")}
                </FadeInText>
              </GradientPill>
              <GradientPill mode={mode} size="sm">
                <FadeInText
                  as="p"
                  dir={dir}
                  fontSize={{ base: "md", md: "xl" }}
                  fontWeight="bold"
                  color={GOLD}
                >
                  {t("home.hero.subtitle")}
                </FadeInText>
              </GradientPill>
            </>
          ) : (
            // Distinct premium welcome for logged-in users
            <Box
              px={{ base: 4, md: 6 }}
              py={{ base: 3, md: 4 }}
              borderRadius="28px"
              bg="bg.surface"
              backdropFilter="blur(10px) saturate(1.1)"
              border="1px solid"
              borderColor="rgba(183,162,125,0.55)"
              boxShadow="0 16px 42px rgba(0,0,0,0.28)"
            >
              <Text
                as="h1"
                bgClip="text"
                bgGradient={`linear(to-r, ${GOLD}, #e6d8bf)`}
                fontWeight="extrabold"
                letterSpacing="-0.02em"
                fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
                lineHeight="1.1"
              >
                {t("home.hero.welcome", {
                  defaultValue: "Welcome, {{name}}",
                  name: me?.name || me?.email || "Trader",
                })}
              </Text>
              <Text mt={1} fontSize={{ base: "sm", md: "md" }}>
                {t("home.hero.welcome_sub", {
                  defaultValue:
                    "Pick up where you left off — your courses, tools, and community await.",
                })}
              </Text>
            </Box>
          )}

          {/* Mobile countdown chip — show only to guests */}
          {!isLoggedIn && (
            <Box display={{ base: "block", md: "none" }} w="100%">
              {!expired && !isMember && (
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
                  <HStack gap={2} flexWrap="wrap" justify="center">
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

              {/* Mobile promo — guests only */}
              {(expired || promo?.code) && (
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
                  <HStack gap={2} justify="center" flexWrap="wrap">
                    <Text fontSize="sm" opacity={0.95}>
                      {expired
                        ? t("home.promo.kicker_late", "Late access promo:")
                        : t("home.promo.kicker", "Limited-time cohort promo:")}
                    </Text>
                    <Box
                      px={2}
                      py={1}
                      borderRadius="md"
                      bgGradient={`linear(to-b, ${GOLD}, ${
                        mode === "dark" ? "#9b8a6b" : "#cbb89a"
                      })`}
                      color="white"
                      fontWeight="bold"
                    >
                      {codeToShow}
                    </Box>
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
            </Box>
          )}

          {/* Desktop timer/promo — guests only */}
          {!isLoggedIn && (
            <Box display={{ base: "none", md: "block" }} w="100%">
              <VStack gap={3} align="center">
                {!expired && !isMember && (
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

                {(expired || promo?.code) && (
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
                          {codeToShow}
                        </Box>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor={GOLD}
                          color={GOLD}
                          _hover={{ bg: "#b7a27d", color: "white" }}
                          onClick={() => copy(codeToShow)}
                        >
                          {t("home.promo.copy", "Copy")}
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
          )}

          {/* VIP Telegram status for logged-in users */}
          {isLoggedIn && vipActive && (
            <Box
              w="100%"
              bg="bg.surface"
              border="1px solid"
              borderColor={GOLD}
              borderRadius="lg"
              p={{ base: 3, md: 4 }}
              maxW="600px"
            >
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                  <Text fontWeight="bold" color={GOLD} fontSize="lg">
                    {t("home.hero.vip_title", { defaultValue: "VIP Telegram" })}
                  </Text>
                  {tgLink && (
                    <Button
                      size="sm"
                      bg={GOLD}
                      color="black"
                      _hover={{ opacity: 0.9 }}
                      onClick={() => window.open(tgLink, "_blank", "noreferrer")}
                    >
                      {t("home.hero.open_telegram", { defaultValue: "Open Telegram" })}
                    </Button>
                  )}
                </HStack>
                {vipEnd && (() => {
                  const end = new Date(vipEnd).getTime();
                  const now = Date.now();
                  const leftMs = Math.max(0, end - now);
                  const dayMs = 24 * 60 * 60 * 1000;
                  const daysLeft = Math.max(0, Math.ceil(leftMs / dayMs));
                  const totalDays = 30; // assume 30-day subscription
                  const pct = Math.max(0, Math.min(100, Math.round((daysLeft / totalDays) * 100)));
                  const color = daysLeft <= 2 ? "red" : daysLeft <= 10 ? "orange" : "blue";
                  return (
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" opacity={0.85}>
                          {t("home.hero.days_remaining", { defaultValue: "Days remaining" })}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {daysLeft} {t("home.hero.days", { defaultValue: "days" })}
                        </Text>
                      </HStack>
                      <Progress value={pct} colorScheme={color} borderRadius="md" size="sm" />
                    </VStack>
                  );
                })()}
              </VStack>
            </Box>
          )}

          {/* Enrolled courses summary */}
          {isLoggedIn && enrolledCount > 0 && (() => {
            const count = recentCourses.length;
            // Determine columns: 1 course = 1 col, 2-3 courses = up to 3 cols, 4+ courses = 3 cols
            const columns = count === 1 ? 1 : count <= 3 ? count : 3;
            
            // Mobile pagination: 3 courses per page
            const coursesPerPage = 3;
            const totalPages = Math.ceil(count / coursesPerPage);
            const startIdx = currentPage * coursesPerPage;
            const endIdx = startIdx + coursesPerPage;
            const currentCourses = recentCourses.slice(startIdx, endIdx);
            
            return (
              <Box
                w="100%"
                bg="bg.surface"
                border="1px solid"
                borderColor={GOLD}
                borderRadius="lg"
                p={{ base: 3, md: 4 }}
                maxW="900px"
              >
                <Text fontWeight="bold" mb={2} color={GOLD}>
                  {t("home.hero.enrolled_courses", { defaultValue: "Your Courses" })}
                </Text>
                <Text fontSize="sm" opacity={0.85} mb={3}>
                  {enrolledCount} {t("home.hero.courses_enrolled", { defaultValue: "courses enrolled" })}
                </Text>
                
                {/* Desktop: Show all in grid */}
                <Box display={{ base: "none", md: "block" }}>
                  <SimpleGrid columns={columns} spacing={3}>
                    {recentCourses.map((c, i) => {
                      const tier = c.tier;
                      const productLink = tier?.telegramUrl || tier?.discordInviteUrl || `/learn/${c.id}`;
                      return (
                        <Box
                          key={i}
                          p={3}
                          border="1px solid"
                          borderColor={GOLD}
                          borderRadius="md"
                          bg="bg.subtle"
                          display="flex"
                          flexDirection="column"
                          gap={2}
                        >
                          <Text fontWeight="semibold" fontSize="sm">{c.name}</Text>
                          <Button
                            size="sm"
                            bg={GOLD}
                            color="black"
                            _hover={{ filter: "brightness(0.95)" }}
                            onClick={() => {
                              if (tier?.telegramUrl || tier?.discordInviteUrl) {
                                window.open(productLink, "_blank", "noreferrer");
                              } else {
                                navigate(productLink);
                              }
                            }}
                          >
                            {t("home.courses.access", { defaultValue: "Access" })}
                          </Button>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>
                
                {/* Mobile: Paginated view */}
                <Box display={{ base: "block", md: "none" }}>
                  <VStack align="stretch" spacing={3}>
                    {currentCourses.map((c, i) => {
                      const tier = c.tier;
                      const productLink = tier?.telegramUrl || tier?.discordInviteUrl || `/learn/${c.id}`;
                      return (
                        <Box
                          key={startIdx + i}
                          p={3}
                          border="1px solid"
                          borderColor={GOLD}
                          borderRadius="md"
                          bg="bg.subtle"
                          display="flex"
                          flexDirection="column"
                          gap={2}
                        >
                          <Text fontWeight="semibold" fontSize="sm">{c.name}</Text>
                          <Button
                            size="sm"
                            bg={GOLD}
                            color="black"
                            _hover={{ filter: "brightness(0.95)" }}
                            onClick={() => {
                              if (tier?.telegramUrl || tier?.discordInviteUrl) {
                                window.open(productLink, "_blank", "noreferrer");
                              } else {
                                navigate(productLink);
                              }
                            }}
                          >
                            {t("home.courses.access", { defaultValue: "Access" })}
                          </Button>
                        </Box>
                      );
                    })}
                  </VStack>
                  
                  {/* Pagination controls for mobile */}
                  {totalPages > 1 && (
                    <Flex align="center" justify="center" gap={3} mt={4}>
                      <IconButton
                        aria-label="Previous page"
                        icon={<Text fontSize="lg">{dir === "rtl" ? "→" : "←"}</Text>}
                        size="sm"
                        bg={GOLD}
                        color="black"
                        isDisabled={currentPage === 0}
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        _hover={{ opacity: 0.8 }}
                        _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
                      />
                      
                      {/* Page dots */}
                      <HStack spacing={2}>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <Box
                            key={idx}
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg={idx === currentPage ? GOLD : "gray.500"}
                            opacity={idx === currentPage ? 1 : 0.4}
                            cursor="pointer"
                            onClick={() => setCurrentPage(idx)}
                            transition="all 0.2s"
                            _hover={{ opacity: 1 }}
                          />
                        ))}
                      </HStack>
                      
                      <IconButton
                        aria-label="Next page"
                        icon={<Text fontSize="lg">{dir === "rtl" ? "←" : "→"}</Text>}
                        size="sm"
                        bg={GOLD}
                        color="black"
                        isDisabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        _hover={{ opacity: 0.8 }}
                        _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
                      />
                    </Flex>
                  )}
                </Box>
              </Box>
            );
          })()}

          {/* CTAs — hide when logged in */}
          {!isLoggedIn && (
            <HStack gap={3} pt={1} justify="center" flexWrap="wrap">
              <Button
                bg={GOLD}
                color="black"
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
          )}
        </VStack>
      </Container>
    </Box>
  );
}
