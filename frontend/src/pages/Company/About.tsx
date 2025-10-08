import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Link,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Global } from "@emotion/react";

// === Theme tokens ===
const GOLD = "#b7a27d";
const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

// == Reusable full-viewport section with snap and pulsing dot ==
const SnapSection: React.FC<{
  heading: string;
  sub?: string;
  media?: React.ReactNode;
  invert?: boolean;
  k?: string;
}> = ({ heading, sub, media, invert = false, k }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px", once: false });

  return (
    <Box
      as="section"
      ref={ref}
      id={k}
      minH="100svh"
      position="relative"
      display="grid"
      // Mobile also uses 2 columns so the rail divides text (L) / image (R)
      gridTemplateColumns={{ base: "1fr 1fr", md: "1.1fr 0.9fr" }}
      alignItems="center"
      gap={{ base: 4, md: 10 }}
      px={{ base: 4, md: 10 }}
      py={{ base: 8, md: 10 }}
      scrollSnapAlign="start"
    >
      {/* Pulsing dot (subtle / Apple-y) */}
      <MotionBox
        aria-hidden
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="12px"
        h="12px"
        borderRadius="full"
        bg={GOLD}
        boxShadow={`0 0 0 6px ${GOLD}22, 0 0 0 12px ${GOLD}11`}
        zIndex={1}
        initial={{ opacity: 0.5, scale: 0.9 }}
        animate={
          inView
            ? {
                opacity: [0.7, 0.9, 0.7],
                scale: [1, 1.12, 1],
                transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
              }
            : { opacity: 0.4, scale: 0.96 }
        }
      />

      {/* Text — always left on mobile; alternates on desktop via `invert` */}
      <MotionVStack
        align="start"
        gap={4}
        order={{ base: 1, md: invert ? 2 : 1 }}
        initial={{ opacity: 0, y: 26 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 12 }}
        transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.8 }}
      >
        <Heading size={{ base: "lg", md: "2xl" }} color={GOLD} letterSpacing="tight">
          {heading}
        </Heading>
        {sub && (
          <Text color="text.muted" fontSize={{ base: "md", md: "lg" }} maxW="48ch">
            {sub}
          </Text>
        )}
      </MotionVStack>

      {/* Media — narrowed a bit so images aren't edge-to-edge */}
      <MotionBox
        order={{ base: 2, md: invert ? 1 : 2 }}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0.6, scale: 0.99 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9, delay: 0.02 }}
        w={{ base: "92%", md: "82%" }}
        maxW="980px"
        mx="auto"
      >
        {media}
      </MotionBox>
    </Box>
  );
};

export default function About() {
  const { t } = useTranslation() as any;

  // Page-level effects
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // Make this page the ONLY scroll container
    document.body.setAttribute("data-page", "about");
    document.body.setAttribute("data-footer", "hidden"); // Footer hidden by default

    return () => {
      document.body.style.overflow = prevOverflow || "";
      document.body.removeAttribute("data-page");
      document.body.removeAttribute("data-footer");
    };
  }, []);

  // Refs to control rail + footer behavior
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const moreRef = React.useRef<HTMLDivElement | null>(null);
  const ctaRef = React.useRef<HTMLDivElement | null>(null);

  const heroInView = useInView(heroRef, {
    margin: "-10% 0px -80% 0px",
    once: false,
  });

  const moreInView = useInView(moreRef, {
    margin: "-10% 0px -10% 0px",
    once: false,
  });

  const bottomInView = useInView(ctaRef, {
    margin: "-10% 0px -10% 0px",
    once: false,
  });

  // Show footer ONLY at the bottom (CTA in view)
  React.useEffect(() => {
    document.body.setAttribute("data-footer", bottomInView ? "show" : "hidden");
  }, [bottomInView]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Hide rail on hero AND on the last two slides
  const showCenterRail = !heroInView && !moreInView && !bottomInView;

  return (
    <Box
      position="fixed"
      inset={0}
      overflowY="auto"
      scrollSnapType="y mandatory"
      overscrollBehavior="contain"
      bg="transparent"
    >
      {/* Page-scoped CSS (footer control & rail fade on mobile) */}
      <Global
        styles={`
          body[data-page="about"][data-footer="hidden"] footer{display:none!important}
          body[data-page="about"][data-footer="show"] footer{display:block!important}
          .about-center-rail{}
          @media (max-width:768px){
            .about-center-rail{
              -webkit-mask-image:linear-gradient(to bottom, transparent 0, black 28px, black calc(100% - 28px), transparent 100%);
              mask-image:linear-gradient(to bottom, transparent 0, black 28px, black calc(100% - 28px), transparent 100%);
            }
          }
        `}
      />

      {/* Center rail — hidden on hero & last two slides */}
      {showCenterRail && (
        <Box
          aria-hidden
          className="about-center-rail"
          position="fixed"
          left="50%"
          top={0}
          transform="translateX(-50%)"
          h="100%"
          w="2px"
          bg={GOLD}
          opacity={0.7}
          pointerEvents="none"
          zIndex={0}
        />
      )}

      {/* HERO */}
      <Box
        ref={heroRef}
        minH="100svh"
        position="relative"
        scrollSnapAlign="start"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 10 }}
      >
        <Container maxW="7xl">
          <VStack align="start" gap={6}>
            <Heading size={{ base: "xl", md: "3xl" }} letterSpacing="-0.01em">
              {t("company.about.title")}
            </Heading>
            <Text color="text.muted" fontSize={{ base: "md", md: "xl" }} maxW="68ch">
              {t("company.about.body")}
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Button
                onClick={() => scrollTo("ch-2015")}
                bg={GOLD}
                color="black"
                _hover={{ opacity: 0.92, transform: "translateY(-1px)" }}
                transition="all .2s ease"
              >
                {t("home.cta.primary") || "Browse Courses"}
              </Button>
              <Button
                onClick={() => scrollTo("ch-2025")}
                variant="outline"
                borderColor={GOLD}
                color={GOLD}
                _hover={{ bg: `${GOLD}14` }}
                transition="all .2s ease"
              >
                {t("home.cta.secondary") || "Contact Us"}
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Timeline chapters */}
      <SnapSection
        k="ch-2015"
        heading={t("company.timeline.2015.title")}
        sub={t("company.timeline.2015.desc")}
        media={
          <Image
            src="/media/about/journal.jpg"
            alt="2015"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2016.title")}
        sub={t("company.timeline.2016.desc")}
        invert
        media={
          <Image
            src="/media/about/notes.jpg"
            alt="2016"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2017.title")}
        sub={t("company.timeline.2017.desc")}
        media={
          <Image
            src="/media/about/risk.jpg"
            alt="2017"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2018.title")}
        sub={t("company.timeline.2018.desc")}
        invert
        media={
          <Image
            src="/media/about/playbooks.jpg"
            alt="2018"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2019.title")}
        sub={t("company.timeline.2019.desc")}
        media={
          <Image
            src="/media/about/focus.jpg"
            alt="2019"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2020.title")}
        sub={t("company.timeline.2020.desc")}
        invert
        media={
          <Image
            src="/media/about/remote.jpg"
            alt="2020"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2021.title")}
        sub={t("company.timeline.2021.desc")}
        media={
          <Image
            src="/media/about/community.jpg"
            alt="2021"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2022.title")}
        sub={t("company.timeline.2022.desc")}
        invert
        media={
          <Image
            src="/media/about/curriculum.jpg"
            alt="2022"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2023.title")}
        sub={t("company.timeline.2023.desc")}
        media={
          <Image
            src="/media/about/signals.jpg"
            alt="2023"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        heading={t("company.timeline.2024.title")}
        sub={t("company.timeline.2024.desc")}
        invert
        media={
          <Image
            src="/media/about/platform.jpg"
            alt="2024"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />
      <SnapSection
        k="ch-2025"
        heading={t("company.timeline.2025.title")}
        sub={t("company.timeline.2025.desc")}
        media={
          <Image
            src="/media/about/mentorship.jpg"
            alt="2025"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      {/* "+ many more to come" */}
      <Box
        ref={moreRef}
        minH="100svh"
        position="relative"
        scrollSnapAlign="start"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 10 }}
      >
        <MotionBox
          aria-hidden
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          fontSize={{ base: "96px", md: "160px" }}
          lineHeight="1"
          color={GOLD}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.18, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          +
        </MotionBox>

        <Container maxW="5xl">
          <MotionVStack
            align="center"
            textAlign="center"
            gap={4}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <Heading size={{ base: "lg", md: "2xl" }} color={GOLD}>
              {t("company.about.more.title")}
            </Heading>
            <Text color="text.muted" fontSize={{ base: "md", md: "lg" }} maxW="60ch">
              {t("company.about.more.subtitle")}
            </Text>
          </MotionVStack>
        </Container>
      </Box>

      {/* Closing CTA (footer shows when this is in view) */}
      <Box
        ref={ctaRef}
        minH="75svh"
        scrollSnapAlign="start"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 10 }}
      >
        <Container maxW="5xl">
          <VStack align="center" textAlign="center" gap={4}>
            <Heading size={{ base: "lg", md: "2xl" }}>{t("company.about.cta.title")}</Heading>
            <Text color="text.muted" maxW="60ch">
              {t("company.about.cta.subtitle")}
            </Text>
            <HStack gap={3} flexWrap="wrap" justify="center">
              <Link href="/courses">
                <Button bg={GOLD} color="black" _hover={{ opacity: 0.92 }}>
                  {t("home.cta.primary") || "Browse Courses"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" borderColor={GOLD} color={GOLD}>
                  {t("home.cta.secondary") || "Contact Us"}
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
