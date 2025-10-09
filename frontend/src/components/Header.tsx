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
import { Link as RouterLink } from "react-router-dom";
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
  Settings,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { useThemeMode } from "../themeProvider";
import { useAuth } from "../auth/AuthContext";
// Removed MUI icons to avoid Emotion theme conflicts

const Header: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { mode, toggle } = useThemeMode();
  const { user, logout } = useAuth();

  const isDesktop = useBreakpointValue({ base: false, md: true });
  const MotionBox = motion(Box);
  const MotionButton = motion(Button);
  const isAR = (i18n.language || "en").startsWith("ar");

  // SOLID colors (no translucency/blur)
  const gold = "#b7a27d";
  const headerBg = mode === "dark" ? "#000000" : "#f9f6f2";
  const headerFg = "#b7a27d";

  // ---- measure header height to place mobile dropdown flush to it ----
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [headerBottom, setHeaderBottom] = React.useState<number>(0);
  const recalcHeaderBottom = React.useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // rect.bottom is viewport pixels from top; perfect for fixed-position top
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

  const SettingsMenu: React.FC = () => {
    const isDark = mode === "dark";
    const [open, setOpen] = React.useState(false);
    const [openTop, setOpenTop] = React.useState<number | null>(null); // snapshot top when opening
    const ref = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!ref.current) return;
        if (!ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    // Prevent body scroll when settings is open (mobile/desktop both fine)
    React.useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = open ? "hidden" : prev || "";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);

    const onToggleOpen = () => {
      // snapshot the header bottom ONCE so the dropdown doesn't mutate position while animating
      if (!open) setOpenTop(headerBottom);
      setOpen((v) => !v);
    };

    return (
      <Box position="relative" ref={ref}>
        <Button
          aria-label={t("dashboard.settings") || "Settings"}
          variant="ghost"
          color={headerFg}
          borderRadius="full"
          size="lg"
          p={2}
          onClick={onToggleOpen}
        >
          <Icon as={Settings} />
        </Button>

        <AnimatePresence initial={false}>
          {open && (
            <MotionBox
              key="settings-dd"
              initial={{ opacity: 0, scaleY: 0.92 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
              /* ALWAYS centered, independent of LTR/RTL */
              position="fixed"
              left={0}
              right={0}
              mx="auto"
              /* Use the snapped header bottom so it won't shift while animating */
              top={`${openTop ?? headerBottom}px`}
              zIndex={1200}
              bg={headerBg}
              color={headerFg}
              border="1px solid"
              borderColor={mode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
              borderRadius="xl"
              p={3}
              /* Keep it neatly centered within the viewport */
              w="min(92vw, 320px)"
              maxW="420px"
              textAlign="center"
              boxShadow="xl"
              /* Prevent overflow on short screens */
              maxH="70vh"
              overflowY="auto"
            >
              <VStack align="center" gap={2}>
                <Box fontWeight="bold">{t("dashboard.settings") || "Settings"}</Box>

                {/* Buttons always fit the frame; wrap if needed */}
                <HStack justify="center" flexWrap="wrap" gap={2}>
                  <Button
                    size="sm"
                    color="white"
                    bg="#b7a27d"
                    borderRadius="full"
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setOpen(false);
                    }}
                  >
                    English
                  </Button>
                  <Button
                    size="sm"
                    color="white"
                    bg="#b7a27d"
                    borderRadius="full"
                    onClick={() => {
                      i18n.changeLanguage("ar");
                      setOpen(false);
                    }}
                  >
                    العربية
                  </Button>
                  <Button
                    size="sm"
                    color="white"
                    bg="#b7a27d"
                    borderRadius="full"
                    onClick={() => {
                      i18n.changeLanguage("fr");
                      setOpen(false);
                    }}
                  >
                    Français
                  </Button>
                </HStack>

                <Box
                  borderTop="1px solid"
                  w="100%"
                  borderColor={mode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
                  my={1}
                />

                <Button
                  onClick={() => {
                    toggle();
                    setOpen(false);
                  }}
                  variant="solid"
                  borderRadius="full"
                  color={mode === "dark" ? "black" : "white"}
                  bg={mode === "dark" ? "white" : "black"}
                >
                  <HStack>
                    <Icon as={isDark ? Sun : Moon} />
                    <Box as="span">
                      {isDark
                        ? t("tooltip.lightMode") || "Light mode"
                        : t("tooltip.darkMode") || "Dark mode"}
                    </Box>
                  </HStack>
                </Button>
              </VStack>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    );
  };

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
              <Logo h={12} />
            </HStack>
          </RouterLink>

          <Spacer />

          {/* Desktop nav */}
          <HStack gap={1} as="nav" display={{ base: "none", md: "flex" }}>
            <RouterLink to="/contact">
              <Button {...navButtonProps}>
                <Icon as={MessageSquare} mr={2} />
                {t("nav.contact") || (isAR ? "اتصل بنا" : "Contact")}
              </Button>
            </RouterLink>
            <RouterLink to={user ? "/enrolled" : "/courses"}>
              <Button {...navButtonProps}>
                <Icon as={BookOpen} mr={2} />
                {user
                  ? t("nav.enrolled") || (isAR ? "كورساتي" : "My Enrollments")
                  : t("footer.courses") || (isAR ? "الكورسات" : "Courses")}
              </Button>
            </RouterLink>

            {!user && (
              <>
                <RouterLink to="/auth/register">
                  <Button {...navButtonProps}>
                    <Icon as={Users} mr={2} />
                    {t("auth.register")}
                  </Button>
                </RouterLink>
                <RouterLink to="/auth/login">
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

          {/* Desktop controls: unified Settings */}
          <HStack gap={2} ms={3} display={{ base: "none", md: "flex" }}>
            <SettingsMenu />
          </HStack>

          {/* Mobile controls */}
          <Box display={{ base: "block", md: "none" }} ps={{ base: 2, md: 0 }}>
            <HStack gap={2}>
              {/* Settings (language + theme) */}
              <SettingsMenu />

              {/* Hamburger */}
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
        </Flex>
      </Container>

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
              // flush to the bottom of the header
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
                      <RouterLink to="/auth/login" onClick={() => setMenuOpen(false)}>
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
                      <RouterLink to="/auth/register" onClick={() => setMenuOpen(false)}>
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

                  <RouterLink
                    to={user ? "/enrolled" : "/courses"}
                    onClick={() => setMenuOpen(false)}
                  >
                    <MotionButton variant="ghost" w="full" justifyContent="center" color="inherit">
                      <Icon as={BookOpen} mr={2} color="inherit" />
                      {user
                        ? t("dashboard.courses") || "My Enrollments"
                        : t("footer.courses") || "Courses"}
                    </MotionButton>
                  </RouterLink>

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
