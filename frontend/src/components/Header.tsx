/* eslint-disable */
import React from "react";
import {
  Box,
  Container,
  Flex,
  HStack,
  Spacer,
  Button,
  Icon,
  Portal,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Menu as MenuIcon,
  X,
  Users,
  FormInput,
  LogOut,
  LogInIcon,
  UserPlus,
  MessageSquare,
  BookOpen,
  Globe,
  LayoutDashboard,
  Book,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { useThemeMode } from "../themeProvider";
import { useAuth } from "../auth/AuthContext";
import { TickerTape } from "react-ts-tradingview-widgets";

const TickerTapeSafe: React.FC<React.ComponentProps<typeof TickerTape>> = (props) => {
  const [mounted, setMounted] = React.useState(false);
  const once = React.useRef(false);
  React.useEffect(() => {
    if (!once.current) {
      once.current = true;
      setMounted(true);
    }
  }, []);
  if (!mounted) return null;
  return <TickerTape {...props} />;
};

const Header: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { mode, toggle } = useThemeMode();
  const { user, logout } = useAuth();

  const isDesktop = useBreakpointValue({ base: false, md: true });
  const MotionBox = motion(Box);
  const MotionButton = motion(Button);
  const isAR = (i18n.language || "en").startsWith("ar");
  const [langOpen, setLangOpen] = React.useState(false);
  const langRef = React.useRef<HTMLDivElement | null>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!langOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMenu = !!langRef.current && langRef.current.contains(target);
      const inTrigger = !!triggerRef.current && triggerRef.current.contains(target);
      if (!inMenu && !inTrigger) setLangOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [langOpen]);

  // Close language sheet if the hamburger menu opens (avoid overlap)
  React.useEffect(() => {
    if (menuOpen) setLangOpen(false);
  }, [menuOpen]);

  React.useEffect(() => {
    if (!langOpen) return;
    const onScroll = () => setLangOpen(false);
    const onResize = () => setLangOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [langOpen]);

  // SOLID colors (no translucency/blur)
  const gold = "#b7a27d";
  const headerBg = mode === "dark" ? "#000000" : "#f9f6f2";
  const headerFg = "#b7a27d";
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Measure header height to place the ticker tape flush under it
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [headerBottom, setHeaderBottom] = React.useState<number>(0);
  const recalcHeaderBottom = React.useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHeaderBottom(rect.bottom);
  }, []);
  React.useLayoutEffect(() => {
    recalcHeaderBottom();
    const ro = new ResizeObserver(recalcHeaderBottom);
    if (headerRef.current) ro.observe(headerRef.current);
    const onScroll = () => recalcHeaderBottom();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recalcHeaderBottom);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recalcHeaderBottom);
    };
  }, [recalcHeaderBottom]);

  const navButtonProps = {
    variant: "ghost" as const,
    color: headerFg,
    position: "relative" as const,
    fontSize: "lg",
    _after: {
      content: '""',
      position: "absolute",
      left: 2,
      right: 2,
      bottom: 1,
      height: "2px",
      bg: gold,
      opacity: 0,
      transition: "opacity 200ms",
    },
    _hover: { bg: "transparent", _after: { opacity: 1 } },
  };

  // ----- TickerTape config (only when logged in) -----
  const tickerSymbols = React.useMemo(
    () => [
      { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
      { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
      { proName: "OANDA:XAUUSD", title: "XAU/USD" },
      { proName: "FX:EURUSD", title: "EUR/USD" },
      { proName: "FX:GBPUSD", title: "GBP/USD" },
      { proName: "FX:USDJPY", title: "USD/JPY" },
      { proName: "FX:USDCHF", title: "USD/CHF" },
      { proName: "FX:NZDUSD", title: "NZD/USD" },
      { proName: "FX:USDCAD", title: "USD/CAD" },
      { proName: "FX:EURAUD", title: "EUR/AUD" },
      { proName: "FX:EURNZD", title: "EUR/NZD" },
      { proName: "FX:EURGBP", title: "EUR/GBP" },
      { proName: "FX:EURCHF", title: "EUR/CHF" },
      { proName: "FX:EURCAD", title: "EUR/CAD" },
      { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
      { proName: "BITSTAMP:ETHUSD", title: "ETH/USD" },
    ],
    []
  );
  const tickerTheme = mode === "dark" ? "dark" : "light";
  const { pathname } = useLocation();

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
      bg={headerBg}
      color={headerFg}
      boxShadow="0 6px 24px rgba(0,0,0,0.08)"
      dir={isDesktop ? "ltr" : undefined}
    >
      <Container maxW="8xl">
        {/* ref is on the actual header row so measuring is accurate */}
        <Flex as="header" py={3} minH="64px" align="center" ref={headerRef}>
          <RouterLink to="/">
            <HStack gap={3} ps={{ base: 2, md: 0 }}>
              <Logo h={14} />
            </HStack>
          </RouterLink>

          <Spacer />

          <HStack gap={1} as="nav" display={{ base: "none", md: "flex" }}>
            <RouterLink to="/contact">
              <Button {...navButtonProps}>
                <Icon as={MessageSquare} mr={2} />
                {t("nav.contact") || (isAR ? "اتصل بنا" : "Contact")}
              </Button>
            </RouterLink>
            <RouterLink to="/courses">
              <Button {...navButtonProps}>
                <Icon as={BookOpen} mr={2} />
                {t("footer.courses") || (isAR ? "الكورسات" : "Courses")}
              </Button>
            </RouterLink>
            {user && (
              <RouterLink to={"/enrolled"}>
                <Button {...navButtonProps}>
                  <Icon as={Book} mr={2} />
                  {t("nav.enrolled") || (isAR ? "كورساتي" : "My Enrollments")}
                </Button>
              </RouterLink>
            )}
            {!user && (
              <>
                <RouterLink to="/register">
                  <Button {...navButtonProps}>
                    <Icon as={Users} mr={2} />
                    {t("auth.register")}
                  </Button>
                </RouterLink>
                <RouterLink to="/login">
                  <Button {...navButtonProps}>
                    <Icon as={FormInput} mr={2} />
                    {t("auth.login")}
                  </Button>
                </RouterLink>
              </>
            )}

            {user && (
              <>
                <RouterLink to="/dashboard">
                  <Button {...navButtonProps}>
                    <Icon as={LayoutDashboard} mr={2} />
                    {t("header.dashboard")}
                  </Button>
                </RouterLink>
                <Button variant="solid" bg="red" borderRadius="full" color="white" onClick={logout}>
                  {t("aria.logout") || "Logout"}
                </Button>
              </>
            )}
          </HStack>

          <Spacer display={{ base: "none", md: "block" }} />

          <HStack gap={2} ms={3} display={{ base: "none", md: "flex" }}>
            <Button
              aria-label={
                mode === "dark"
                  ? t("tooltip.lightMode") || "Light mode"
                  : t("tooltip.darkMode") || "Dark mode"
              }
              variant="ghost"
              color={headerFg}
              borderRadius="full"
              onClick={toggle}
            >
              <Icon as={mode === "dark" ? Sun : Moon} />
            </Button>
            <Button
              ref={triggerRef}
              aria-label={t("dashboard.language") || "Language"}
              variant="ghost"
              color={headerFg}
              borderRadius="full"
              onClick={() => setLangOpen((v) => !v)}
            >
              <Icon as={Globe} />
            </Button>
          </HStack>

          {/* Mobile controls */}
          <Box display={{ base: "block", md: "none" }} ps={{ base: 2, md: 0 }}>
            <HStack gap={2}>
              {/* Theme toggle (quick) */}
              <Button
                aria-label={
                  mode === "dark"
                    ? t("tooltip.lightMode") || "Light mode"
                    : t("tooltip.darkMode") || "Dark mode"
                }
                variant="ghost"
                color={headerFg}
                borderRadius="full"
                onClick={toggle}
              >
                <Icon as={mode === "dark" ? Sun : Moon} />
              </Button>

              {/* Language sheet trigger (mobile) */}
              <Button
                ref={triggerRef}
                aria-label={t("dashboard.language") || "Language"}
                variant="ghost"
                color={headerFg}
                borderRadius="full"
                onClick={() => setLangOpen((v) => !v)}
              >
                <Icon as={Globe} />
              </Button>

              {/* Hamburger Icon */}
              <Button
                size="lg"
                variant="ghost"
                color={headerFg}
                borderRadius="full"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open menu"
              >
                <Icon as={menuOpen ? X : MenuIcon} />
              </Button>
            </HStack>
          </Box>

          {/* Mobile language sheet */}
          <AnimatePresence initial={false}>
            {langOpen && (
              <Portal>
                <MotionBox
                  key="mobile-lang"
                  ref={langRef}
                  initial={{ opacity: 0, y: -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  position="fixed"
                  top={`${headerBottom}px`}
                  left={0}
                  right={0}
                  zIndex={1300}
                  bg={headerBg}
                  color={gold}
                  borderTop="1px solid"
                  borderBottom="1px solid"
                  borderColor={mode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
                  px={3}
                  py={2}
                >
                  <Box position="relative" zIndex={1}>
                    <HStack justify="center" gap={2} wrap="wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        color="inherit"
                        onClick={() => {
                          i18n.changeLanguage("en");
                          setLangOpen(false);
                        }}
                      >
                        English
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="inherit"
                        onClick={() => {
                          i18n.changeLanguage("ar");
                          setLangOpen(false);
                        }}
                      >
                        العربية
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="inherit"
                        onClick={() => {
                          i18n.changeLanguage("fr");
                          setLangOpen(false);
                        }}
                      >
                        Français
                      </Button>
                    </HStack>
                  </Box>
                </MotionBox>
              </Portal>
            )}
          </AnimatePresence>
        </Flex>
      </Container>

      {/* ======= FIXED TICKER UNDER HEADER (only on Home and when logged in) ======= */}
      {user && pathname === "/" && (
        <Portal>
          <Box
            position="fixed"
            left={0}
            right={0}
            top={`${headerBottom}px`}
            zIndex={1100} // below mobile drawers (1300), above content
            bg={headerBg}
            // contain the tape visually with some padding
            px={{ base: 2, md: 4 }}
            py={{ base: 1, md: 1 }}
          >
            <TickerTapeSafe
              key={tickerTheme}
              colorTheme={tickerTheme as any}
              isTransparent={true}
              displayMode="adaptive"
              locale={(i18n.language || "en") as any}
              showSymbolLogo
              symbols={tickerSymbols}
            />
          </Box>
        </Portal>
      )}

      {/* Mobile dropdown — solid bg, gold menu text */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <Portal>
            <MotionBox
              key="mobile-menu"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              position="fixed"
              top={`${headerBottom}px`}
              left={0}
              right={0}
              zIndex={1300}
              overflow="visible"
              bg={headerBg}
              color={gold}
              borderTop="1px solid"
              borderBottom="1px solid"
              borderColor={mode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
              px={3}
              py={2}
            >
              <Box position="relative" zIndex={1}>
                <VStack align="stretch" gap={2}>
                  {user ? (
                    <>
                      <MotionButton
                        variant="ghost"
                        color="inherit"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon as={Users} mr={2} color="inherit" />
                        {t("header.hi", { name: user?.name || user?.email })}
                      </MotionButton>
                      <RouterLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                        <MotionButton
                          variant="ghost"
                          w="full"
                          justifyContent="center"
                          color="inherit"
                        >
                          <Icon as={LayoutDashboard} mr={2} color="inherit" />
                          {t("header.dashboard")}
                        </MotionButton>
                      </RouterLink>
                    </>
                  ) : (
                    <>
                      <RouterLink to="/login" onClick={() => setMenuOpen(false)}>
                        <MotionButton
                          variant="ghost"
                          w="full"
                          justifyContent="center"
                          color="inherit"
                        >
                          <Icon as={LogInIcon} mr={2} color="inherit" />
                          {t("auth.login") || t("nav.signIn")}
                        </MotionButton>
                      </RouterLink>
                      <RouterLink to="/register" onClick={() => setMenuOpen(false)}>
                        <MotionButton
                          variant="ghost"
                          w="full"
                          justifyContent="center"
                          color="inherit"
                        >
                          <Icon as={UserPlus} mr={2} color="inherit" />
                          {t("auth.register")}
                        </MotionButton>
                      </RouterLink>
                    </>
                  )}

                  <RouterLink to="/contact" onClick={() => setMenuOpen(false)}>
                    <MotionButton variant="ghost" w="full" justifyContent="center" color="inherit">
                      <Icon as={MessageSquare} mr={2} color="inherit" />
                      {t("footer.contact")}
                    </MotionButton>
                  </RouterLink>

                  {/* Always show Courses */}
                  <RouterLink to="/courses" onClick={() => setMenuOpen(false)}>
                    <MotionButton variant="ghost" w="full" justifyContent="center" color="inherit">
                      <Icon as={BookOpen} mr={2} color="inherit" />
                      {t("footer.courses") || "Courses"}
                    </MotionButton>
                  </RouterLink>

                  {/* Show Enrolled only when logged in */}
                  {user && (
                    <RouterLink to="/enrolled" onClick={() => setMenuOpen(false)}>
                      <MotionButton variant="ghost" w="full" justifyContent="center" color="inherit">
                        <Icon as={Book} mr={2} color="inherit" />
                        {t("nav.enrolled") || "My Enrollments"}
                      </MotionButton>
                    </RouterLink>
                  )}

                  {user && (
                    <MotionButton
                      variant="solid"
                      bg="red"
                      color="white"
                      borderRadius="full"
                      w="full"
                      justifyContent="center"
                      _hover={{ bg: "rgba(183,162,125,0.10)" }}
                      onClick={async () => {
                        try {
                          await logout();
                        } finally {
                          setMenuOpen(false);
                        }
                      }}
                    >
                      <Icon as={LogOut} mr={2} color="white" />
                      {t("aria.logout") || "Log out"}
                    </MotionButton>
                  )}
                </VStack>
              </Box>
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Header;
