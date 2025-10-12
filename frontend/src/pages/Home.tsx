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
import api from "../api/client";
import BannerCarousel from "../components/BannerCarousel";
import { useThemeMode } from "../themeProvider";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Hero from "../components/Hero";
import { useSessionMemory } from "../hooks/useSessionMemory";

const MotionBox = motion(Box);

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
  const moonPos = useBreakpointValue({
    base: "top -100px",
    md: "top -100px",
  });
  const moonSize = useBreakpointValue({ base: "900px auto", md: "contain" });

  const [tiers, setTiers] = React.useState<any[]>([]);
  const [courseIdx, setCourseIdx] = React.useState(0);
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

  // Reviews: pass real reviews via API -> 'realReviews' if you have them
  // Structure shown here; replace sample entries with your API payload.
  type Review = {
    source: "Trustpilot" | "Forex Peace Army" | "CryptoCompare" | "Sitejabber" | "Other";
    rating: number; // 1..5
    title: string;
    body: string;
    author: string;
    date?: string; // ISO or human
    url?: string; // link to original
    locale?: string; // to filter per language if needed
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

  // if you fetch real reviews: const [realReviews, setRealReviews] = React.useState<Review[]>([]);
  // show API reviews if available; otherwise fall back to sample
  const reviewsToShow: Review[] = React.useMemo(
    () => /* realReviews.length ? realReviews :  */ sampleReviews,
    [/* realReviews, */ i18n.language] // re-run when language changes for i18n text
  );

  // marquee pause on hover
  const [paused, setPaused] = React.useState(false);

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
      method: "email", // default
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
    // explicit numeric rating on the tier takes precedence
    const explicit = Number(tier?.rating);
    const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
    const count = lr.length;

    // average from latestReviews if present
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

  // keep only positive (4★+) comments with non-empty text
  const getPositiveComments = (tier: any, limit = 3): any[] => {
    const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
    // Score = rating, tie-break: newer first, then longer useful text
    const scored = lr
      .filter(
        (r: any) => (Number(r?.rating) || 0) >= 4 && String(r?.comment || "").trim().length > 0
      )
      .map((r: any) => ({
        ...r,
        __score:
          (Number(r?.rating) || 0) * 1000 +
          (r?.created_at ? new Date(r.created_at).getTime() / 1e11 : 0) + // tiny tilt toward recency
          Math.min(String(r?.comment || "").length, 180) / 180, // small bonus for substance
      }))
      .sort((a: any, b: any) => b.__score - a.__score);

    return scored.slice(0, limit);
  };

  // pretty print average to one decimal (e.g., 4.7)
  const fmtAvg = (n: number) => (n ? (Math.round(n * 10) / 10).toFixed(1) : "0.0");

  type FaqRowProps = {
    q: string;
    a: string;
    accentColor: string;
  };

  const FaqRow: React.FC<FaqRowProps> = ({ q, a, accentColor }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Box border="1px solid" borderColor={accentColor} borderRadius="lg" overflow="hidden">
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
          {/* caret */}
          <Box
            as="span"
            transition="transform 0.2s"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            color={accentColor}
          >
            ▾
          </Box>
        </Button>

        {/* animated content (no Chakra Collapse needed) */}
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
        {/* Course Benefits */}
        <Box py={10}>
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
              <Box key={idx} overflow="hidden" boxShadow="xl" h="100%" backdropFilter="blur(6px)">
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
        <Box mb={{ base: 8, md: 12 }} px={{ base: 4, md: 0 }}>
          <Image
            src="/images/rand/iphones-chart.webp"
            w="70%"
            maxW="container.lg"
            mx="auto"
            loading="lazy"
          />
        </Box>

        {/* Program Highlights */}
        <Box py={{ base: 12, md: 20 }}>
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
                    borderColor="#b7a27d"
                  >
                    <Box p={8} textAlign="center">
                      <VStack gap={4}>
                        <Heading size="lg">{tier.name}</Heading>
                        <Text fontSize="sm">{tier.description}</Text>
                        {/* Average summary */}
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
                      const positives = getPositiveComments(tier, 3); // top 3 positive comments
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
                                        fill={k < (Number(r.rating) || 0) ? accentColor : "none"}
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

                                {/* positive comment body */}
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

        {/* Trustpilot-like Carousel */}
        <Box py={{ base: 10, md: 14 }}>
          <Heading
            textAlign="center"
            mb={6}
            color={accentColor}
            fontSize={{ base: "3xl", md: "4xl" }}
          >
            {t("home.trustpilot.title") || "Verified by learners — and it shows"}
          </Heading>

          <Text textAlign="center" opacity={0.8} mb={8} fontSize={{ base: "xl", md: "2xl" }}>
            <HStack gap={4} justify="center" wrap="wrap">
              <Image
                src={mode === "dark" ? "/images/logos/TP-White.png" : "/images/logos/TP-Black.png"}
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
          </Text>

          <Box
            position="relative"
            overflow="hidden"
            borderWidth="1px"
            borderColor={accentColor}
            borderRadius="2xl"
            px={{ base: 2, md: 4 }}
            py={{ base: 4, md: 6 }}
          >
            {/* edge fades */}
            <Box
              position="absolute"
              left={0}
              top={0}
              bottom={0}
              w="60px"
              bgGradient={`linear(to-r, ${mode === "dark" ? "gray.900" : "white"} , transparent)`}
              zIndex={1}
              pointerEvents="none"
            />
            <Box
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              w="60px"
              bgGradient={`linear(to-l, ${mode === "dark" ? "gray.900" : "white"} , transparent)`}
              zIndex={1}
              pointerEvents="none"
            />

            {/* marquee rail */}
            <MotionBox
              role="list"
              display="flex"
              gap={4} // remove extra spacing
              onHoverStart={() => setPaused(true)}
              onHoverEnd={() => setPaused(false)}
              animate={{ x: paused ? 0 : ["0%", "-50%"] }}
              transition={{ duration: 30, ease: "linear", repeat: Infinity }}
              style={{
                direction: "ltr", // ensures consistent left-to-right layout for all content
                whiteSpace: "nowrap", // keeps items on one line
              }}
            >
              {[...reviewsToShow, ...reviewsToShow].map((r, i) => (
                <Box
                  key={i}
                  style={{
                    display: "inline-block", // prevents line breaks between items
                    direction: "ltr", // ensures AR text doesn't reverse layout
                  }}
                >
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
          {/* New image above CTA */}
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
                  : t("home.cta.image_alt") || "Start trading — premium education for every level"
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
          bg="rgba(183,162,125,0.05)"
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

            {/* === Lead form === */}
            <Box as="form" onSubmit={submitLead} w={{ base: "100%", md: "auto" }}>
              <Stack direction={{ base: "column", md: "row" }} gap={3}>
                <Input
                  placeholder={t("lead.name") || "Your name"}
                  value={lead.name}
                  onChange={(e) => setLead((s) => ({ ...s, name: e.target.value }))}
                  required
                />

                {/* Contact method switcher */}
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

                {/* Conditional input */}
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

                <Button type="submit" minW="70px" variant="solid" isLoading={submitting} bg={accentColor}>
                  {t("lead.cta") || "Get it free"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
