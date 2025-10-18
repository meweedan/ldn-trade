// src/pages/Home.tsx
/* eslint-disable */
import React from "react";
import "../styles/fonts.css";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
  Link as ChakraLink,
  GridItem,
  Image,
  IconButton,
  Icon, // ⬅️ add
  Accordion, // ⬅️ add (namespace in v3)
  Badge,
  useToast,
  Stack,
  Input,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import api from "../api/client";
import BannerCarousel from "../components/BannerCarousel";
import { useThemeMode } from "../themeProvider";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Hero from "../components/Hero";
import { useSessionMemory } from "../hooks/useSessionMemory";
import CryptoMatrix from "../components/CryptoMatrix";
import ForexMatrix from "../components/ForexMatrix";
import { getMyPurchases } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import TimelineNewsTabs from "../components/TimelineNewsTabs";

// ===== Three.js lightweight visualizers (no extra deps) =====
const MotionBox = motion(Box);

const TvSafe: React.FC<React.ComponentProps<typeof AdvancedRealTimeChart>> = React.memo((props) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <AdvancedRealTimeChart {...props} />;
});

// Move this OUTSIDE and BEFORE the Home component
const MarketsBoard: React.FC<{ mode: string; accentColor: string; t: any }> = React.memo(({ mode, accentColor, t }) => {
  const symbolsFX = [
    "OANDA:XAUUSD",
    "FX:EURUSD",
    "FX:GBPUSD",
    "FX:USDJPY",
    "FX:USDCHF",
    "FX:USDCAD",
    "FX:AUDUSD",
    "FX:NZDUSD",
    "FX:EURGBP",
    "FX:EURJPY",
    "FX:EURCHF",
    "FX:EURCAD",
    "FX:EURAUD",
    "FX:EURNZD",
    "FOREXCOM:SPXUSD",
    "FOREXCOM:NSXUSD",
  ];
  const symbolsCR = ["COINBASE:BTCUSD", "COINBASE:ETHUSD", "BINANCE:SOLUSDT", "COINBASE:XRPUSD"];

  const [tabIndex, setTabIndex] = React.useState(() => {
    const saved = localStorage.getItem("mbTabIndex");
    return saved ? Number(saved) : 0;
  });

  const [fxActive, setFxActive] = React.useState(() => {
    return localStorage.getItem("mbFxActive") || "OANDA:XAUUSD";
  });

  const [crActive, setCrActive] = React.useState(() => {
    return localStorage.getItem("mbCrActive") || "BINANCE:BTCUSDT";
  });

  const chartHeight = 700;
  const themeRTW = React.useMemo(() => (mode === "dark" ? "dark" : "light") as "dark" | "light", [mode]);

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Heading textAlign="center" mb={3} color={accentColor} fontSize={{ base: "2xl", md: "3xl" }}>
        {t("home.enrolled.markets_title", { defaultValue: "Markets Overview" })}
      </Heading>
      <Text textAlign="center" opacity={0.85} mb={6}>
        {t("home.enrolled.markets_sub", {
          defaultValue: "Major FX & Crypto pairs with live candlesticks",
        })}
      </Text>

      <Box
        borderWidth="1px"
        borderColor={accentColor}
        borderRadius="xl"
        p={2}
        bg={mode === "dark" ? "black" : "white"}
      >
        <Tabs
          index={tabIndex}
          onChange={(index) => {
            setTabIndex(index);
            localStorage.setItem("mbTabIndex", String(index));
          }}
          isFitted
          color="#b7a27d"
          variant="solid"
        >
          <TabList>
            <Tab>{t("home.enrolled.markets_tab_fx", { defaultValue: "Forex" })}</Tab>
            <Tab>{t("home.enrolled.markets_tab_cr", { defaultValue: "Crypto" })}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={3}>
              <HStack spacing={2} flexWrap="wrap" mb={2}>
                {symbolsFX.map((s) => (
                  <Button
                    key={s}
                    size="xs"
                    variant={s === fxActive ? "solid" : "solid"}
                    bg={s === fxActive ? "#b7a27d" : "white"}
                    borderColor="#b7a27d"
                    onClick={() => {
                      setFxActive(s);
                      localStorage.setItem("mbFxActive", s);
                    }}
                  >
                    {s.split(":")[1] || s}
                  </Button>
                ))}
              </HStack>

              <Box w="100%" h={`${chartHeight}px`}>
                <TvSafe
                  symbol={fxActive}
                  interval={"60" as any}
                  theme={themeRTW as any}
                  locale="en"
                  hide_top_toolbar={false}
                  hide_legend={false}
                  withdateranges
                  allow_symbol_change={false}
                  save_image={false}
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            </TabPanel>

            <TabPanel p={3}>
              <HStack spacing={2} flexWrap="wrap" mb={2}>
                {symbolsCR.map((s) => (
                  <Button
                    key={s}
                    size="xs"
                    variant={s === crActive ? "solid" : "solid"}
                    bg={s === crActive ? "#b7a27d" : "white"}
                    borderColor="#b7a27d"
                    onClick={() => {
                      setCrActive(s);
                      localStorage.setItem("mbCrActive", s);
                    }}
                  >
                    {s.split(":")[1] || s}
                  </Button>
                ))}
              </HStack>

              <Box w="100%" h={`${chartHeight}px`}>
                <TvSafe
                  symbol={crActive}
                  interval={"60" as any}
                  theme={themeRTW as any}
                  locale="en"
                  hide_top_toolbar={false}
                  hide_legend={false}
                  withdateranges
                  allow_symbol_change={false}
                  save_image={false}
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
});

const Home: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language === "ar";
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const toast = useToast();
  const lang = String(i18n?.language || "en").toLowerCase();
  const isAR = lang.startsWith("ar");
  const isFR = lang.startsWith("fr");
  const accentColor = "#b7a27d";

  const [tiers, setTiers] = React.useState<any[]>([]);
  const [courseIdx, setCourseIdx] = React.useState(0);
  const { user } = useAuth() as any; // optional, safe even if unused elsewhere
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [enrolledTiers, setEnrolledTiers] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token && !user) return; // only check when logged-in-ish
        const mine = await getMyPurchases({ ttlMs: 2 * 60 * 1000 }).catch(() => []);
        if (!mounted) return;
        const list = Array.isArray(mine) ? mine : [];
        const confirmed = list.filter((p: any) => String(p?.status).toUpperCase() === "CONFIRMED");
        setIsEnrolled(confirmed.length > 0);
        // map to tiers we already fetched
        const tiersMap = new Map(tiers.map((t: any) => [t.id, t]));
        const myTiers = confirmed.map((p: any) => tiersMap.get(p.tierId)).filter(Boolean);
        const uniqueTiers = Array.from(new Map(myTiers.map((t: any) => [t.id, t])).values());
        setEnrolledTiers(uniqueTiers);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [user, tiers]);

  React.useEffect(() => {
    let mounted = true;
    api
      .get("/courses")
      .then((r) => {
        if (mounted) setTiers(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => {
        if (mounted) setTiers([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const go = React.useCallback(
    (delta: number) => {
      setCourseIdx((i) => (tiers.length ? (i + delta + tiers.length) % tiers.length : 0));
    },
    [tiers.length]
  );

  const shownTiers = React.useMemo(() => {
    const n = tiers.length;
    if (!n) return [] as any[];
    const out = [] as any[];
    for (let k = 0; k < Math.min(3, n); k++) out.push(tiers[(courseIdx + k) % n]);
    return out;
  }, [tiers, courseIdx]);

  const TipsAndTricks: React.FC = () => (
    <Box py={{ base: 6, md: 10 }}>
      <Heading textAlign="center" mb={6} color={accentColor} fontSize={{ base: "2xl", md: "3xl" }}>
        {t("home.enrolled.tips_title", { defaultValue: "Tips & Tricks" })}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        {[
          t("home.enrolled.tip1", { defaultValue: "Use a risk-reward of at least 1:2." }),
          t("home.enrolled.tip2", { defaultValue: "Wait for candle close; avoid chasing wicks." }),
          t("home.enrolled.tip3", { defaultValue: "Mark HTF S/R weekly and daily." }),
          t("home.enrolled.tip4", { defaultValue: "Keep a journal and tag setups." }),
          t("home.enrolled.tip5", { defaultValue: "Focus on a handful of pairs to master flow." }),
          t("home.enrolled.tip6", {
            defaultValue: "Avoid trading around high-impact news unless planned.",
          }),
        ].map((text, i) => (
          <Box
            key={i}
            p={4}
            borderWidth="1px"
            borderRadius="xl"
            borderColor={accentColor}
            bg={mode === "dark" ? "black" : "white"}
          >
            <Text>{text}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );

  const EnrolledCoursesQuickAccess: React.FC = () => (
    <Box py={{ base: 6, md: 10 }}>
      <Heading textAlign="center" mb={6} color={accentColor} fontSize={{ base: "2xl", md: "3xl" }}>
        {t("home.enrolled.courses_title", { defaultValue: "Continue Learning" })}
      </Heading>
      {enrolledTiers.length === 0 ? (
        <Text textAlign="center" opacity={0.8}>
          {t("home.enrolled.no_courses", { defaultValue: "No active courses yet." })}
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {enrolledTiers.map((tier: any, idx: number) => (
            <Box
              key={`${tier?.id ?? "tier"}-${idx}`}
              p={5}
              borderWidth="1px"
              borderRadius="xl"
              borderColor={accentColor}
              bg={mode === "dark" ? "black" : "white"}
            >
              <VStack align="start" gap={2}>
                <Heading size="md">{tier.name}</Heading>
                {tier.description && (
                  <Text fontSize="sm" opacity={0.9}>
                    {tier.description}
                  </Text>
                )}
                <Button bg={accentColor} onClick={() => navigate(`/learn/${tier.id}`)}>
                  {t("dashboard.continue", { defaultValue: "Continue" })}
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );

  const BrokerCTA: React.FC = () => (
    <Box
      mt={{ base: 4, md: 8 }}
      p={{ base: 4, md: 6 }}
      border="1px solid"
      borderRadius="2xl"
      borderColor={accentColor}
      bg={mode === "dark" ? "black" : "white"}
      textAlign="center"
    >
      <Heading size="md" mb={2} color={accentColor}>
        {t("home.enrolled.broker_title", { defaultValue: "Trade With Our Preferred Broker" })}
      </Heading>
      <Text opacity={0.9} mb={4}>
        {t("home.enrolled.broker_sub", {
          defaultValue: "Tight spreads, ECN execution, and fast withdrawals.",
        })}
      </Text>
      <Button size="lg" bg={accentColor} onClick={() => window.open("/broker", "_self")}>
        {t("home.enrolled.broker_cta", { defaultValue: "Join Our Broker" })}
      </Button>
    </Box>
  );

  // Course-first copy via i18n keys
  const featureHighlights = [
    {
      title: t("home.benefits.one") || "Expert-Led Curriculum",
      description:
        t("home.benefits.one_desc") || "Structured paths from fundamentals to advanced strategies.",
      image: "/images/rand/advisors.png",
    },
    {
      title: t("home.benefits.two") || "Actionable Lessons",
      description:
        t("home.benefits.two_desc") || "Projects and case studies designed for real outcomes.",
      image: "/images/rand/100s-products.png",
    },
    {
      title: t("home.benefits.three") || "Premium Community",
      description:
        t("home.benefits.three_desc") || "Access mentorship, events and private channels.",
      image: "/images/rand/comp-cond.png",
    },
    {
      title: t("home.benefits.four") || "Shariah-compliant",
      description: t("home.benefits.four_desc") || "All courses teach Shariah-compliant trading.",
      image: "/images/rand/0-fees.png",
    },
  ];

  const courseFeatures = [
    {
      title: t("home.features.one") || "Foundations to Mastery",
      description:
        t("home.features.one_desc") || "From basics to advanced methodology in a clear track.",
    },
    {
      title: t("home.features.two") || "Cohort-Based Learning",
      description: t("home.features.two_desc") || "Learn with peers, guided by instructors.",
    },
    {
      title: t("home.features.three") || "Resources Library",
      description: t("home.features.three_desc") || "Templates, checklists and downloads included.",
    },
    {
      title: t("home.features.four") || "Certificate of Completion",
      description: t("home.features.four_desc") || "Showcase your achievement upon graduation.",
    },
  ];

  // Trustpilot-style carousel (localized)
  const trustSlides = [
    {
      headline: t("home.trustpilot.headline1") || "Trustpilot Verified",
      ratingText: t("home.trustpilot.ratingText1") || "Excellent • 4.8 out of 5",
      reviewsCount: t("home.trustpilot.reviewsCount1") || "1,200+ reviews",
      proofText: t("home.trustpilot.proofText1") || "Real students. Real outcomes.",
      badgeSrc: "/images/rand/trustpilot-badge.svg", // optional - add in /public/images
    },
    {
      headline: t("home.trustpilot.headline2") || "Highly Rated by Learners",
      ratingText: t("home.trustpilot.ratingText2") || "4.9/5 Average Instructor Rating",
      reviewsCount: t("home.trustpilot.reviewsCount2") || "Top 1% in category",
      proofText: t("home.trustpilot.proofText2") || "Independently verified feedback.",
      badgeSrc: "/images/rand/trustpilot-stars.svg",
    },
    {
      headline: t("home.trustpilot.headline3") || "Trusted in MENA & Beyond",
      ratingText: t("home.trustpilot.ratingText3") || "Global community of learners",
      reviewsCount: t("home.trustpilot.reviewsCount3") || "Growing every week",
      proofText: t("home.trustpilot.proofText3") || "Transparency you can count on.",
      badgeSrc: "/images/rand/trustpilot-check.svg",
    },
  ];
  const [trustIdx, setTrustIdx] = React.useState(0);
  const trustGo = React.useCallback(
    (d: number) => setTrustIdx((i) => (i + d + trustSlides.length) % trustSlides.length),
    [trustSlides.length]
  );
  React.useEffect(() => {
    const id = setInterval(() => setTrustIdx((i) => (i + 1) % trustSlides.length), 4000);
    return () => clearInterval(id);
  }, [trustSlides.length]);

  // Reviews demo
  type Review = {
    source: "Trustpilot" | "Forex Peace Army" | "CryptoCompare" | "Sitejabber" | "Other";
    rating: number;
    title: string;
    body: string;
    author: string;
    date?: string;
    url?: string;
    locale?: string;
  };

  const sampleReviews: Review[] = [
    {
      source: "Trustpilot",
      rating: 5,
      title: t("home.trustpilot.headline1") || "Trustpilot Verified",
      body: t("home.trustpilot.proofText1") || "Real students. Real outcomes.",
      author: "M. Ibrahim",
      date: "2025-09-18",
      url: "#",
    },
    {
      source: "Forex Peace Army",
      rating: 5,
      title: t("home.trustpilot.headline2") || "Highly Rated by Learners",
      body: t("home.trustpilot.ratingText2") || "4.9/5 Average Instructor Rating",
      author: "FPA Member",
      date: "2025-09-09",
      url: "#",
    },
    {
      source: "CryptoCompare",
      rating: 5,
      title: t("home.trustpilot.headline3") || "Trusted in MENA & Beyond",
      body: t("home.trustpilot.proofText3") || "Transparency you can count on.",
      author: "CC Reviewer",
      date: "2025-08-30",
      url: "#",
    },
    {
      source: "Sitejabber",
      rating: 4,
      title: t("home.trustpilot.headline2") || "Highly Rated by Learners",
      body: t("home.trustpilot.reviewsCount1") || "1,200+ reviews",
      author: "A. Rahman",
      date: "2025-08-12",
      url: "#",
    },
  ];

  const [paused, setPaused] = React.useState(false);

  // Build real reviews from courses (latestReviews per tier)
  const courseReviews: Review[] = React.useMemo(() => {
    try {
      const out: Review[] = [];
      for (const tier of tiers) {
        const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
        for (const r of lr) {
          const rating = Math.max(1, Math.min(5, Number(r?.rating) || 0));
          const body = String(r?.comment || "").trim();
          if (!body) continue;
          out.push({
            source: "Other",
            rating,
            title: tier?.name || t("home.trustpilot.headline1") || "Verified Review",
            body: body.length > 280 ? body.slice(0, 277) + "..." : body,
            author: r?.user?.name || t("common.anonymous") || "Student",
            date: r?.created_at,
            url: undefined,
            locale: i18n.language,
          });
        }
      }
      // keep up to 20 most recent by date
      out.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      return out.slice(0, 20);
    } catch {
      return [];
    }
  }, [tiers, i18n.language]);

  const reviewsToShow: Review[] = React.useMemo(
    () => (courseReviews.length ? courseReviews : sampleReviews),
    [courseReviews, sampleReviews]
  );

  // Lightweight CountUp that starts when visible
  const CountUpNumber: React.FC<{
    end: number;
    duration?: number;
    suffix?: string;
    locale?: string;
  }> = ({ end, duration = 2.0, suffix = "", locale }) => {
    const ref = React.useRef<HTMLSpanElement | null>(null);
    const [value, setValue] = React.useState(0);
    const [started, setStarted] = React.useState(false);
    const startedOnce = React.useRef(false);

    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && !startedOnce.current) {
              startedOnce.current = true;
              setStarted(true);
            }
          });
        },
        { threshold: 0.3 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);

    React.useEffect(() => {
      if (!started) return;
      let raf = 0;
      const t0 = performance.now();
      const animate = (t: number) => {
        const p = Math.min(1, (t - t0) / (duration * 1000));
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.floor(eased * end));
        if (p < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, [started, end, duration]);

    const formatter = React.useMemo(() => {
      try {
        const loc = String(locale || i18n.language || "en");
        return new Intl.NumberFormat(loc);
      } catch {
        return new Intl.NumberFormat();
      }
    }, [locale, i18n.language]);

    return (
      <span ref={ref}>
        {formatter.format(value)} {suffix}
      </span>
    );
  };

  // FAQ (localized)
  const faqItems = (t("home.faq.items", { returnObjects: true }) as any[]) || [
    {
      q: t("home.faq.q1") || "Who are these programs for?",
      a:
        t("home.faq.a1") ||
        "Beginners to advanced learners looking for structured, outcome-focused training.",
    },
    {
      q: t("home.faq.q2") || "How are the courses delivered?",
      a:
        t("home.faq.a2") ||
        "Live cohorts and self-paced modules with community support and downloadable resources.",
    },
    {
      q: t("home.faq.q3") || "Do I get a certificate?",
      a:
        t("home.faq.a3") ||
        "Yes, you’ll receive a certificate of completion you can share on LinkedIn.",
    },
    {
      q: t("home.faq.q4") || "Can I try before committing?",
      a:
        t("home.faq.a4") ||
        "We offer previews and sample lessons so you can explore before you enroll.",
    },
  ];

  // ===== Lead magnet form (moved to bottom) =====
  const [lead, setLead] = React.useState({
    name: "",
    email: "",
    phone: "",
    method: "email",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const { session } = useSessionMemory();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim());
  const phoneValid = /^\+?[0-9\s\-]{7,15}$/.test(lead.phone.trim());

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.name.trim()) {
      toast({ status: "warning", title: t("lead.name_required") || "Please enter your name." });
      return;
    }
    if (lead.method === "email" && !emailValid) {
      toast({
        status: "warning",
        title: t("lead.email_invalid") || "Please enter a valid email.",
      });
      return;
    }
    if (lead.method === "phone" && !phoneValid) {
      toast({
        status: "warning",
        title: t("lead.phone_invalid") || "Please enter a valid phone number.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const message = [
        "Lead Magnet Submission",
        `Name: ${lead.name}`,
        `Contact: ${lead.method === "email" ? lead.email : lead.phone}`,
        `Locale: ${i18n.language}`,
        session?.utm ? `UTM: ${JSON.stringify(session.utm)}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await api.post("/communications", {
        name: lead.name,
        email: lead.method === "email" ? lead.email : undefined,
        phone: lead.method === "phone" ? lead.phone : undefined,
        message,
        locale: i18n.language,
        url: window.location.href,
        utm: session?.utm || undefined,
      });

      toast({ status: "success", title: t("lead.success") || "Thank you for your interest!" });
      setLead({ name: "", email: "", phone: "", method: "email" });
    } catch (err) {
      toast({
        status: "error",
        title: t("lead.error") || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const ReviewCard: React.FC<{ review: Review; accentColor: string }> = ({
    review,
    accentColor,
  }) => {
    const { source, rating, title, body, author, date, url } = review;

    return (
      <Box
        role="listitem"
        minW={{ base: "280px", md: "360px" }}
        maxW={{ base: "280px", md: "360px" }}
        border="1px solid"
        borderColor={accentColor}
        borderRadius="xl"
        px={5}
        py={4}
        boxShadow="md"
        bg="transparent"
      >
        <HStack justify="space-between" align="center" mb={2} gap={3}>
          <HStack gap={2} align="center">
            {source !== "Other" && (
              <Image
                src={
                  source === "Trustpilot"
                    ? mode === "dark"
                      ? "/images/logos/TP-White.png"
                      : "/images/logos/TP-Black.png"
                    : source === "Forex Peace Army"
                    ? "/images/logos/fpa.png"
                    : source === "CryptoCompare"
                    ? mode === "dark"
                      ? "/images/logos/cryptocom-dark.png"
                      : "/images/logos/cryptocompare-darktext.png"
                    : source === "Sitejabber"
                    ? "/images/logos/sitejabber.png"
                    : "/images/logos/review-generic.svg"
                }
                h="16px"
              />
            )}
          </HStack>
          <HStack gap={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                as={Star}
                boxSize={4}
                color={i < rating ? accentColor : "gray.400"}
                fill={i < rating ? accentColor : "none"}
              />
            ))}
          </HStack>
        </HStack>

        <Heading size="sm" mb={1}>
          {title}
        </Heading>
        <Text fontSize="sm" opacity={0.9} mb={3}>
          {body}
        </Text>

        <HStack justify="space-between" align="center" gap={2}>
          <Text fontSize="xs" opacity={0.7}>
            {author}
            {date ? ` • ${new Date(date).toLocaleDateString()}` : ""}
          </Text>
          {url && (
            <ChakraLink href={url} _hover={{ textDecoration: "none" }}>
              <Button size="xs" variant="outline" borderColor={accentColor} color={accentColor}>
                {t("home.courses.view") || "View"}
              </Button>
            </ChakraLink>
          )}
        </HStack>
      </Box>
    );
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const scaleUp = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  // --- ratings & reviews helpers ---
  const getAvgRating = (tier: any): { avg: number; count: number } => {
    const explicit = Number(tier?.rating);
    const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
    const count = lr.length;

    const fromReviews =
      count > 0 ? lr.reduce((s: number, r: any) => s + (Number(r?.rating) || 0), 0) / count : NaN;

    const avg =
      !Number.isNaN(explicit) && explicit > 0
        ? explicit
        : Number.isNaN(fromReviews)
        ? 0
        : fromReviews;
    return { avg, count };
  };

  const getPositiveComments = (tier: any, limit = 3): any[] => {
    const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
    const scored = lr
      .filter(
        (r: any) => (Number(r?.rating) || 0) >= 4 && String(r?.comment || "").trim().length > 0
      )
      .map((r: any) => ({
        ...r,
        __score:
          (Number(r?.rating) || 0) * 1000 +
          (r?.created_at ? new Date(r.created_at).getTime() / 1e11 : 0) +
          Math.min(String(r?.comment || "").length, 180) / 180,
      }))
      .sort((a: any, b: any) => b.__score - a.__score);

    return scored.slice(0, limit);
  };

  const fmtAvg = (n: number) => (n ? (Math.round(n * 10) / 10).toFixed(1) : "0.0");

  type FaqRowProps = {
    q: string;
    a: string;
    accentColor: string;
  };

  const FaqRow: React.FC<FaqRowProps> = ({ q, a, accentColor }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Box
        border="1px solid"
        borderColor={accentColor}
        borderRadius="lg"
        overflow="hidden"
        bg={mode === "dark" ? "black" : "white"}
      >
        <Button
          onClick={() => setOpen((v) => !v)}
          variant="ghost"
          w="full"
          justifyContent="space-between"
          px={4}
          py={4}
          borderRadius="0"
          _hover={{ bg: "rgba(183,162,125,0.08)" }}
        >
          <Box textAlign="start" fontWeight="semibold" flex="1" pr={3} color={accentColor}>
            {q}
          </Box>
          <Box
            as="span"
            transition="transform 0.2s"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            color={accentColor}
          >
            ▾
          </Box>
        </Button>

        {open && (
          <MotionBox
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            overflow="hidden"
            borderTop="1px solid"
            borderColor={accentColor}
            bg="rgba(183,162,125,0.04)"
          >
            <Box px={4} py={4}>
              <Text color={accentColor}>{a}</Text>
            </Box>
          </MotionBox>
        )}
      </Box>
    );
  };

  return (
    <Box dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <Hero />

      <Container maxW="container.xl">
        {/* ===== What is Forex / Crypto (with lightweight Three.js animations) ===== */}

        {isEnrolled ? (
          <>
            {/* Enrolled View: keep Hero (already at top), keep Banner (above), and the CTA image below */}
            <TipsAndTricks />
            <EnrolledCoursesQuickAccess />
            <MarketsBoard mode={mode} accentColor={accentColor} t={t} />
            <TimelineNewsTabs
              mode={mode === "dark" ? "dark" : "light"}
              i18nLang={i18n.language || "en"}
              accentColor={accentColor}
            />
            {/* Keep your existing start-trading-cta image */}
              <Box>
                <Box mb={{ base: 8, md: 12 }} marginTop={10} px={{ base: 4, md: 0 }}>
                  <Image
                    src={
                      isAR
                        ? "/images/rand/start-trading-cta-ar.png"
                        : isFR
                        ? "/images/rand/start-trading-cta-fr.png"
                        : "/images/rand/start-trading-cta.png"
                    }
                    alt={
                      isAR
                        ? "ابدأ التداول الآن — تعليم احترافي لكل المستويات"
                        : t("home.cta.image_alt") ||
                          "Start trading — premium education for every level"
                    }
                    w="70%"
                    maxW="container.lg"
                    mx="auto"
                    objectFit="cover"
                    loading="lazy"
                  />
                </Box>
              </Box>
            <BrokerCTA />
          </>
        ) : (
          <>
            <Container maxW="container.xl" pt={{ base: 6, md: 10 }}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="center">
                {/* What is Forex */}
                <MotionBox
                  initial="hidden"
                  whileInView="visible"
                  bg="bg.surface"
                  borderRadius="lg"
                  borderWidth="1px"
                  overflow="hidden"
                  borderColor={accentColor}
                  p={4}
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <Heading
                    color={accentColor}
                    mb={2}
                    fontSize={{ base: "2xl", md: "3xl" }}
                    textAlign={{ base: "center", md: "center" }}
                  >
                    {t("learn.forex.title") || "What is Forex?"}
                  </Heading>
                  <Text opacity={0.9} mb={4} textAlign={{ base: "center", md: "center" }}>
                    {t("learn.forex.subtitle") ||
                      "Currencies move in pairs. You can buy one, sell the other—on the spot."}
                  </Text>
                  <ForexMatrix />
                  <VStack
                    align={{ base: "center", md: "center" }}
                    mt={4}
                    fontSize={{ base: "lg", md: "xl" }}
                    spacing={2}
                    color={accentColor}
                  >
                    <Text>
                      •{" "}
                      {t("learn.forex.points.gharar") ||
                        "Cut uncertainty (gharar): learn basics, decide clearly."}
                    </Text>
                    <Text>
                      • {t("learn.forex.points.no_riba") || "No interest/swaps (no riba)."}
                    </Text>
                    <Text>
                      •{" "}
                      {t("learn.forex.points.ecn") ||
                        "Use ECN brokers—own your position digitally."}
                    </Text>
                  </VStack>
                  <Text
                    fontSize="lg"
                    opacity={0.7}
                    mt={3}
                    textAlign={{ base: "center", md: "center" }}
                  >
                    {t("learn.disclaimer") ||
                      "Halal when: spot settlement, no riba, and speculation minimized."}
                  </Text>
                </MotionBox>

                {/* What is Crypto */}
                <MotionBox
                  initial="hidden"
                  bg="bg.surface"
                  borderRadius="lg"
                  borderWidth="1px"
                  overflow="hidden"
                  borderColor={accentColor}
                  p={4}
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <Heading
                    color={accentColor}
                    mb={2}
                    fontSize={{ base: "2xl", md: "3xl" }}
                    textAlign={{ base: "center", md: "center" }}
                  >
                    {t("learn.crypto.title") || "What is Crypto?"}
                  </Heading>
                  <Text opacity={0.9} mb={4} textAlign={{ base: "center", md: "center" }}>
                    {t("learn.crypto.subtitle") ||
                      "Digital assets on blockchains. Trade and transfer peer‑to‑peer."}
                  </Text>
                  <CryptoMatrix />
                  <VStack
                    align={{ base: "center", md: "center" }}
                    mt={4}
                    fontSize={{ base: "lg", md: "xl" }}
                    spacing={2}
                    color={accentColor}
                  >
                    <Text>
                      •{" "}
                      {t("learn.crypto.points.ownership") ||
                        "Buy the asset directly; avoid interest‑bearing products."}
                    </Text>
                    <Text>• {t("learn.crypto.points.no_interest") || "No interest (riba)."}</Text>
                    <Text>
                      •{" "}
                      {t("learn.crypto.points.education") ||
                        "Reduce gharar: learn risk basics and trade thoughtfully."}
                    </Text>
                  </VStack>
                  <Text
                    fontSize="lg"
                    opacity={0.7}
                    mt={3}
                    textAlign={{ base: "center", md: "center" }}
                  >
                    {t("learn.disclaimer_short") ||
                      "Permissible when avoiding riba/maysir and minimizing gharar."}
                  </Text>
                </MotionBox>
              </SimpleGrid>
            </Container>

            {/* Course Benefits */}
            <Box mt={20}>
              <Heading
                textAlign="center"
                mb={6}
                fontSize={{ base: "2xl", md: "2xl" }}
                color={accentColor}
              >
                {t("home.benefits.title") || "Experience a Luxurious Learning Journey"}
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={8}>
                {featureHighlights.map((feature, idx) => (
                  <Box
                    key={idx}
                    overflow="hidden"
                    boxShadow="xl"
                    h="100%"
                    backdropFilter="blur(6px)"
                    borderRadius="24px"
                    bg={mode === "dark" ? "black" : "white"}
                    borderWidth={0.1}
                    borderColor={accentColor}
                  >
                    <Grid
                      templateColumns={{ base: "1fr", md: "70px 1fr" }}
                      templateAreas={{ base: `"img" "content"`, md: `"img content"` }}
                      gap={4}
                      p={6}
                      alignItems="center"
                    >
                      <Box
                        gridArea="img"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mb={{ base: 2, md: 0 }}
                      >
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          maxH="80px"
                          objectFit="contain"
                        />
                      </Box>

                      <Box gridArea="content">
                        <Heading size="md" mb={1} color={accentColor}>
                          {feature.title}
                        </Heading>
                        <Text fontSize="sm">{feature.description}</Text>
                      </Box>
                    </Grid>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Image for iPhones with charts */}
            <Box px={{ base: 4, md: 0 }} mt={{ base: 6, md: 12 }}>
              <Image
                src="/images/rand/iphones-chart.webp"
                maxW="container.lg"
                w="100%"
                mx="auto"
                loading="lazy"
              />
            </Box>

            {/* Program Highlights */}
            <Box py={{ base: 6, md: 10 }}>
              <Heading
                textAlign="center"
                mb={10}
                fontSize={{ base: "3xl", md: "4xl" }}
                color={accentColor}
              >
                {t("home.features.title") || "What Makes Our Programs Elite"}
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 2, lg: 4 }} gap={8}>
                {courseFeatures.map((f, index) => (
                  <MotionBox
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    borderRadius="24px"
                    bg={mode === "dark" ? "black" : "white"}
                    borderWidth={0.1}
                    borderColor={accentColor}
                  >
                    <Box p={6} h="full">
                      <VStack align="center" gap={4}>
                        <Heading size="md" color={accentColor} textAlign="center">
                          {f.title}
                        </Heading>
                        <Text textAlign="center">{f.description}</Text>
                      </VStack>
                    </Box>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </Box>

            {/* Animated stats bar */}
            <Box
              mb={{ base: 6, md: 8 }}
              borderWidth="1px"
              borderColor={accentColor}
              borderRadius="2xl"
              bg={mode === "dark" ? "black" : "white"}
              px={{ base: 4, md: 8 }}
              py={{ base: 4, md: 6 }}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} alignItems="center">
                <VStack gap={1} textAlign="center">
                  <Heading size="lg" color={accentColor}>
                    <CountUpNumber end={4200} suffix="+" locale={i18n.language} />
                  </Heading>
                  <Text opacity={0.85}>
                    {t("home.stats.students", { defaultValue: "Learners trained" })}
                  </Text>
                </VStack>
                <VStack gap={1} textAlign="center">
                  <Heading size="lg" color={accentColor}>
                    <CountUpNumber end={80} suffix="%+" locale={i18n.language} />
                  </Heading>
                  <Text opacity={0.85}>
                    {t("home.stats.profitability", { defaultValue: "Reported profitability" })}
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Banner */}
            <BannerCarousel />

            {/* Featured Courses */}
            <Box py={{ base: 12, md: 25 }} position="relative">
              <Heading
                textAlign="center"
                color={accentColor}
                mb={8}
                fontSize={{ base: "3xl", md: "4xl" }}
              >
                {t("home.courses.title") || "Featured Courses"}
              </Heading>

              {/* Mobile: show 4 courses in 2x2 grid, no sliders */}
              <Box display={{ base: "block", md: "none" }}>
                <SimpleGrid columns={2} gap={4}>
                  {tiers.slice(0, 4).map((tier, idx) => (
                    <MotionBox
                      key={tier.id || idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Box
                        position="relative"
                        borderRadius="2xl"
                        overflow="hidden"
                        boxShadow="2xl"
                        border="1px solid"
                        bg={mode === "dark" ? "black" : "white"}
                        borderColor="#b7a27d"
                      >
                        <Box p={4} textAlign="center">
                          <VStack gap={3}>
                            <Heading size="md">{tier.name}</Heading>
                            <Text fontSize="sm">{tier.description}</Text>
                            {(() => {
                              const { avg, count } = getAvgRating(tier);
                              if (!avg) return null;
                              const full = Math.round(avg);
                              return (
                                <VStack gap={1}>
                                  <HStack justify="center" gap={1}>
                                    {Array.from({ length: 5 }).map((_, k) => (
                                      <Icon
                                        key={k}
                                        as={Star}
                                        boxSize={3.5}
                                        color={k < full ? accentColor : "gray.400"}
                                        fill={k < full ? accentColor : "none"}
                                      />
                                    ))}
                                  </HStack>
                                  <Text fontSize="xs" opacity={0.8}>
                                    {fmtAvg(avg)} • {count || 0} {t("common.reviews") || "reviews"}
                                  </Text>
                                </VStack>
                              );
                            })()}
                          </VStack>
                        </Box>
                        <Box p={4} pt={0}>
                          <Button
                            w="full"
                            size="md"
                            bg={accentColor}
                            onClick={() => navigate(`/courses/${tier.id}`)}
                          >
                            {t("home.courses.view") || "View Curriculum"}
                          </Button>
                        </Box>
                      </Box>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Desktop/Tablet: keep carousel */}
              <Box display={{ base: "none", md: "block" }} position="relative">
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                  {shownTiers.map((tier, idx) => (
                    <MotionBox
                      key={tier.id || idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Box
                        position="relative"
                        borderRadius="2xl"
                        overflow="hidden"
                        boxShadow="2xl"
                        border="1px solid"
                        bg={mode === "dark" ? "black" : "white"}
                        borderColor="#b7a27d"
                      >
                        <Box p={8} textAlign="center">
                          <VStack gap={4}>
                            <Heading size="lg">{tier.name}</Heading>
                            <Text fontSize="sm">{tier.description}</Text>
                            {(() => {
                              const { avg, count } = getAvgRating(tier);
                              if (!avg) return null;
                              const rounded = Math.round(avg);
                              return (
                                <VStack gap={1}>
                                  <HStack justify="center" gap={1}>
                                    {Array.from({ length: 5 }).map((_, k) => (
                                      <Icon
                                        key={k}
                                        as={Star}
                                        boxSize={4}
                                        color={k < rounded ? accentColor : "gray.400"}
                                        fill={k < rounded ? accentColor : "none"}
                                      />
                                    ))}
                                  </HStack>
                                  <Text fontSize="xs" opacity={0.8}>
                                    {fmtAvg(avg)} • {count || 0} {t("common.reviews") || "reviews"}
                                  </Text>
                                </VStack>
                              );
                            })()}
                          </VStack>
                        </Box>
                        {(() => {
                          const positives = getPositiveComments(tier, 3);
                          if (positives.length === 0) return null;

                          return (
                            <Box px={8} pt={0} pb={4}>
                              <VStack align="stretch" gap={3}>
                                {positives.map((r: any, i: number) => (
                                  <Box key={r.id || i} p={3}>
                                    <HStack justify="space-between" mb={1}>
                                      <HStack gap={1}>
                                        {Array.from({ length: 5 }).map((_, k) => (
                                          <Icon
                                            key={k}
                                            as={Star}
                                            boxSize={3.5}
                                            color={
                                              k < (Number(r.rating) || 0) ? accentColor : "gray.400"
                                            }
                                            fill={
                                              k < (Number(r.rating) || 0) ? accentColor : "none"
                                            }
                                          />
                                        ))}
                                      </HStack>
                                      <Text fontSize="xs" opacity={0.7}>
                                        {r?.user?.name || t("common.anonymous") || "Student"} •{" "}
                                        {r?.created_at
                                          ? new Date(r.created_at).toLocaleDateString()
                                          : ""}
                                      </Text>
                                    </HStack>

                                    <Text
                                      fontSize="sm"
                                      style={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: "3",
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {String(r.comment).slice(0, 240) +
                                        (String(r.comment).length > 240 ? "..." : "")}
                                    </Text>
                                  </Box>
                                ))}
                              </VStack>
                            </Box>
                          );
                        })()}
                        <Box p={8} pt={0}>
                          <Button
                            w="full"
                            size="lg"
                            bg={accentColor}
                            onClick={() => navigate(`/courses/${tier.id}`)}
                          >
                            {t("home.courses.view") || "View Curriculum"}
                          </Button>
                        </Box>
                      </Box>
                    </MotionBox>
                  ))}
                </SimpleGrid>

                {tiers.length > 3 && (
                  <>
                    <IconButton
                      aria-label="Previous"
                      variant="solid"
                      bg="#b7a27d"
                      color="white"
                      position="absolute"
                      top="50%"
                      left={{ base: 0, md: -6 }}
                      onClick={() => go(-1)}
                    >
                      {isRTL ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>

                    <IconButton
                      aria-label="Next"
                      variant="solid"
                      bg="#b7a27d"
                      color="white"
                      position="absolute"
                      top="50%"
                      right={{ base: 0, md: -6 }}
                      onClick={() => go(1)}
                    >
                      {isRTL ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {/* Stats Bar + Trustpilot-like Carousel */}
            <Box py={{ base: 10, md: 14 }}>
              <Heading
                textAlign="center"
                mb={6}
                color={accentColor}
                fontSize={{ base: "3xl", md: "4xl" }}
              >
                {t("home.trustpilot.title") || "Verified by learners — and it shows"}
              </Heading>

              {courseReviews.length === 0 && (
                <Box textAlign="center" mb={8}>
                  <HStack gap={4} justify="center" wrap="wrap" opacity={0.8}>
                    <Image
                      src={
                        mode === "dark"
                          ? "/images/logos/TP-White.png"
                          : "/images/logos/TP-Black.png"
                      }
                      alt="TrustPilot"
                      h="18px"
                    />
                    <Image src="/images/logos/fpa.png" alt="Forex Peace Army" h="18px" />
                    <Image
                      src={
                        mode === "dark"
                          ? "/images/logos/cryptocom-dark.png"
                          : "/images/logos/cryptocompare-darktext.png"
                      }
                      alt="CryptoCompare"
                      h="18px"
                    />
                    <Image src="/images/logos/sitejabber.png" alt="Sitejabber" h="18px" />
                  </HStack>
                </Box>
              )}

              <Box
                position="relative"
                overflow="hidden"
                borderWidth="1px"
                borderColor={accentColor}
                borderRadius="2xl"
                bg={mode === "dark" ? "black" : "white"}
                px={{ base: 2, md: 4 }}
                py={{ base: 4, md: 6 }}
              >
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  bottom={0}
                  w="60px"
                  bgGradient={`linear(to-r, ${
                    mode === "dark" ? "gray.900" : "white"
                  } , transparent)`}
                  zIndex={1}
                  pointerEvents="none"
                />
                <Box
                  position="absolute"
                  right={0}
                  top={0}
                  bottom={0}
                  w="60px"
                  bgGradient={`linear(to-l, ${
                    mode === "dark" ? "gray.900" : "white"
                  } , transparent)`}
                  zIndex={1}
                  pointerEvents="none"
                />

                <MotionBox
                  role="list"
                  display="flex"
                  gap={4}
                  onHoverStart={() => setPaused(true)}
                  onHoverEnd={() => setPaused(false)}
                  animate={{ x: paused ? 0 : ["0%", "-50%"] }}
                  transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                  style={{ direction: "ltr", whiteSpace: "nowrap" }}
                >
                  {[...reviewsToShow, ...reviewsToShow].map((r, i) => (
                    <Box key={i} style={{ display: "inline-block", direction: "ltr" }}>
                      <ReviewCard review={r} accentColor={accentColor} />
                    </Box>
                  ))}
                </MotionBox>
              </Box>

              <Text fontSize="xs" opacity={0.6} mt={3} textAlign="center">
                {t("home.trustpilot.badge") || "Trustpilot Verified"} •{" "}
                {t("home.trustpilot.proofText1") || "Real students. Real outcomes."}
              </Text>
            </Box>

            {/* FAQ Section (bottom) */}
            <Box py={{ base: 10, md: 16 }}>
              <Heading
                textAlign="center"
                mb={6}
                color={accentColor}
                fontSize={{ base: "3xl", md: "4xl" }}
              >
                {t("home.faq.title") || "Frequently Asked Questions"}
              </Heading>
              <Text textAlign="center" mb={8} opacity={0.9}>
                {t("home.faq.subtitle") ||
                  "Find quick answers below. Still stuck? Reach out — we’re happy to help."}
              </Text>

              <VStack gap={4} align="stretch" color={accentColor}>
                {faqItems.map((item, idx) => (
                  <FaqRow key={idx} q={item.q} a={item.a} accentColor={accentColor} />
                ))}
              </VStack>
            </Box>

            {/* Closing CTA */}
            <Box>
              <Box mb={{ base: 8, md: 12 }} px={{ base: 4, md: 0 }}>
                <Image
                  src={
                    isAR
                      ? "/images/rand/start-trading-cta-ar.png"
                      : isFR
                      ? "/images/rand/start-trading-cta-fr.png"
                      : "/images/rand/start-trading-cta.png"
                  }
                  alt={
                    isAR
                      ? "ابدأ التداول الآن — تعليم احترافي لكل المستويات"
                      : t("home.cta.image_alt") ||
                        "Start trading — premium education for every level"
                  }
                  w="70%"
                  maxW="container.lg"
                  mx="auto"
                  objectFit="cover"
                  loading="lazy"
                />
              </Box>

              <MotionBox
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <VStack gap={6} align="center" textAlign="center">
                  <Text color={accentColor} fontWeight="bold" fontSize={{ base: "3xl", md: "4xl" }}>
                    {t("home.cta.kicker") || "Ready to Learn?"}
                  </Text>
                  <Heading fontSize={{ base: "3xl", md: "4xl" }}>
                    {t("home.cta.title") || "Start Your Learning Journey Today"}
                  </Heading>
                  <Text fontSize="lg">
                    {t("home.cta.subtitle") ||
                      "Join learners globally and access our premium course library."}
                  </Text>
                  <HStack gap={6} wrap="wrap" justify="center">
                    <Button bg={accentColor} onClick={() => navigate("/courses")}>
                      {t("home.cta.primary") || "Browse Courses"}
                    </Button>
                    <Button
                      variant="outline"
                      borderColor={accentColor}
                      color={accentColor}
                      onClick={() => navigate("/contact")}
                    >
                      {t("home.cta.secondary") || "Contact Us"}
                    </Button>
                  </HStack>
                </VStack>
              </MotionBox>
            </Box>

            {/* Lead Magnet — moved to bottom */}
            <Box
              mt={{ base: 8, md: 8 }}
              p={{ base: 4, md: 6 }}
              border="1px solid"
              borderRadius="2xl"
              borderColor={accentColor}
              bg={mode === "dark" ? "black" : "white"}
            >
              <Stack direction={{ base: "column", md: "row" }} align="center" spacing={6}>
                <VStack align="start" flex="1" gap={1}>
                  <Text fontSize={{ base: "xl", md: "2xl" }} color={accentColor} fontWeight="bold">
                    {t("lead.title") || "Download the 3-Step Halal Trading Checklist"}
                  </Text>
                  <Text opacity={0.9}>
                    {t("lead.subtitle") || "Plus: get an instant free lesson and weekly setups."}
                  </Text>
                </VStack>

                <Box as="form" onSubmit={submitLead} w={{ base: "100%", md: "auto" }}>
                  <Stack direction={{ base: "column", md: "row" }} gap={3}>
                    <Input
                      placeholder={t("lead.name") || "Your name"}
                      value={lead.name}
                      onChange={(e) => setLead((s) => ({ ...s, name: e.target.value }))}
                      required
                    />

                    <Stack direction="row" spacing={1} align="center" justify="center">
                      <Button
                        size="sm"
                        variant={lead.method === "email" ? "solid" : "outline"}
                        bg={lead.method === "email" ? accentColor : "transparent"}
                        color={lead.method === "email" ? "white" : accentColor}
                        borderColor={accentColor}
                        borderWidth="1px"
                        _hover={{
                          bg: lead.method === "email" ? accentColor : "rgba(183,162,125,0.15)",
                        }}
                        onClick={() => setLead((s) => ({ ...s, method: "email" }))}
                      >
                        {t("common.email") || "Email"}
                      </Button>
                      <Button
                        size="sm"
                        variant={lead.method === "phone" ? "solid" : "outline"}
                        bg={lead.method === "phone" ? accentColor : "transparent"}
                        color={lead.method === "phone" ? "white" : accentColor}
                        borderColor={accentColor}
                        borderWidth="1px"
                        _hover={{
                          bg: lead.method === "phone" ? accentColor : "rgba(183,162,125,0.15)",
                        }}
                        onClick={() => setLead((s) => ({ ...s, method: "phone" }))}
                      >
                        {t("common.phone") || "Phone"}
                      </Button>
                    </Stack>

                    {lead.method === "email" ? (
                      <FormControl isInvalid={lead.email.length > 0 && !emailValid}>
                        <Input
                          type="email"
                          placeholder={t("lead.email") || "Email address"}
                          value={lead.email}
                          onChange={(e) => setLead((s) => ({ ...s, email: e.target.value }))}
                          required
                        />
                        <FormErrorMessage>
                          {t("lead.email_invalid") || "Please enter a valid email."}
                        </FormErrorMessage>
                      </FormControl>
                    ) : (
                      <FormControl isInvalid={lead.phone.length > 0 && !phoneValid}>
                        <Input
                          type="tel"
                          placeholder={t("lead.phone") || "Phone number"}
                          value={lead.phone}
                          onChange={(e) => setLead((s) => ({ ...s, phone: e.target.value }))}
                          required
                        />
                        <FormErrorMessage>
                          {t("lead.phone_invalid") || "Please enter a valid phone number."}
                        </FormErrorMessage>
                      </FormControl>
                    )}

                    <Button
                      type="submit"
                      minW="70px"
                      variant="solid"
                      isLoading={submitting}
                      bg={accentColor}
                    >
                      {t("lead.cta") || "Get it free"}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Home;