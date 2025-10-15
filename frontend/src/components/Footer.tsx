import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  HStack,
  Heading,
  Text,
  Icon,
  Button,
  Link,
  VStack,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  Twitter,
  Send,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Disc,
  HeadsetIcon,
} from "lucide-react";
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { Link as RouterLink, LinkProps as RouterLinkProps, useLocation } from "react-router-dom";

/* ---------- Payment chip used in the strip ---------- */
const PaymentPill: React.FC<{
  src?: string; // /images/payments/*.svg
}> = ({ src }) => (
  <HStack
    as="li"
    gap={2}
    px={3}
    py={2}
    rounded="full"
  >
      <Image
        src={src}
        boxSize="56px"
        objectFit="contain"
      />
  </HStack>
);

/* ---------- Inner footer with all hooks ---------- */
const FooterInner: React.FC = () => {
  const { t } = useTranslation() as any;

  // Mobile micro-bar (contact) disclosure
  const { isOpen: contactOpen, onToggle: toggleContact, onClose: closeContact } = useDisclosure();
  // Desktop/mobile help FAB disclosure
  const [helpOpen, setHelpOpen] = React.useState(false);

  const [footerVisible, setFooterVisible] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setFooterVisible(entries[0]?.isIntersecting ?? false),
      { root: null, threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const accent = "#b7a27d";

  const sections = [
    {
      title: t("footer.learn") || "Learn",
      links: [
        { label: t("footer.resources") || "Resources", to: "/learn/resources" },
        { label: t("footer.faq") || "FAQ", to: "/learn/faq" },
        { label: t("footer.policy") || "Privacy Policy", to: "/legal/policy" },
      ],
    },
    {
      title: t("footer.company") || "Company",
      links: [
        { label: t("footer.about") || "About", to: "/company/about" },
        { label: t("footer.careers") || "Careers", to: "/company/careers" },
        { label: t("footer.terms") || "Terms", to: "/legal/terms" },
      ],
    },
  ];

  // --- Router + Chakra link bridge ---
  type RouterChakraLinkProps = ChakraLinkProps & RouterLinkProps;
  const RouterChakraLink = React.forwardRef<HTMLAnchorElement, RouterChakraLinkProps>(
    (props, ref) => <ChakraLink ref={ref} as={RouterLink} {...props} />
  );
  RouterChakraLink.displayName = "RouterChakraLink";

  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const toggleSection = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx));

  const IconCircle: React.FC<{
    ariaLabel: string;
    href: string;
    bg?: string;
    color?: string;
    icon: any;
    w?: number;
    h?: number;
  }> = ({ ariaLabel, href, bg, color, icon, w = 44, h = 44 }) => (
    <Link as={ChakraLink} href={href} target="_blank" rel="noopener noreferrer">
      <Button
        aria-label={ariaLabel}
        rounded="full"
        w={`${w}px`}
        h={`${h}px`}
        p={0}
        bg={bg}
        color={color}
        _hover={{ opacity: 0.9 }}
      >
        <Icon as={icon} boxSize={w >= 44 ? 5 : 4} />
      </Button>
    </Link>
  );

  const SmallCollapse: React.FC<{ in: boolean; children: React.ReactNode }> = ({
    in: open,
    children,
  }) => (
    <Box overflow="hidden" maxHeight={open ? "500px" : "0px"} transition="max-height 0.25s ease">
      {children}
    </Box>
  );

  // --- Payment methods list ---
  const paymentMethods = [
    { label: "USDT", src: "/images/payments/usdt.png" },
    { label: "Bank Cards", src: "/images/payments/bank-transfer.png" },
    { label: "Visa", src: "/images/payments/visa.png" },
    { label: "Mastercard", src: "/images/payments/mastercard.png" },
    { label: "Neteller", src: "/images/payments/neteller.png" },
    { label: "Skrill", src: "/images/payments/skrill.png" },
  ];

  return (
    <>
      {/* Help FAB (desktop only) */}
      <Box
        position="fixed"
        right="6px"
        bottom="16px"
        zIndex={1100}
        display={{ base: "none", md: "block" }}
      >
        <Button
          aria-label={t("footer.help") || "Help"}
          rounded="full"
          w="54px"
          h="54px"
          p={0}
          bg={accent}
          color="black"
          _hover={{ opacity: 0.95 }}
          onClick={() => setHelpOpen((v) => !v)}
        >
          <Icon as={HeadsetIcon} boxSize={5} />
        </Button>

        <SmallCollapse in={helpOpen}>
          <Box
            mt={2}
            px={3}
            py={3}
            bg="rgba(0,0,0,0.82)"
            color="white"
            rounded="lg"
            backdropFilter="blur(10px)"
            boxShadow="xl"
          >
            <HStack gap={2}>
              <IconCircle
                ariaLabel="WhatsApp"
                href="https://wa.me/0000000000"
                bg="#25D366"
                color="white"
                icon={MessageCircle}
              />
              <IconCircle
                ariaLabel="Telegram"
                href="https://t.me/your_channel"
                bg="#0088CC"
                color="white"
                icon={Send}
              />
              <IconCircle
                ariaLabel="Twitter"
                href="https://twitter.com/your_handle"
                bg="black"
                color="white"
                icon={Twitter}
              />
              <IconCircle
                ariaLabel="Discord"
                href="https://discord.gg/your_invite"
                bg="#5865F2"
                color="white"
                icon={Disc}
              />
            </HStack>
          </Box>
        </SmallCollapse>
      </Box>

      {/* Real footer */}
      <Box ref={sentinelRef}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} >
            {/* Brand */}
            <VStack align={{ base: "center", md: "flex-start" }}>
              <Image src="/logo.png" alt="Logo" w="160px" h="160px" objectFit="contain" />
            </VStack>

            {/* Sections */}
            {sections.map((section, idx) => {
              const isOpen = openIdx === idx;
              return (
                <Box key={idx}>
                  {/* Mobile header toggle */}
                  <Button
                    w="full"
                    variant="ghost"
                    justifyContent="space-between"
                    px={0}
                    color={accent}
                    onClick={() => toggleSection(idx)}
                    display={{ base: "flex", md: "none" }}
                    _hover={{ bg: "transparent", opacity: 0.9 }}
                    _active={{ bg: "transparent" }}
                    aria-expanded={isOpen}
                  >
                    <Heading
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight={700}
                      letterSpacing="-0.01em"
                    >
                      {section.title}
                    </Heading>
                    <Icon as={isOpen ? ChevronUp : ChevronDown} />
                  </Button>

                  {/* Desktop header */}
                  <Heading size="lg" color={accent} display={{ base: "none", md: "block" }} mb={3}>
                    {section.title}
                  </Heading>

                  {/* Mobile links */}
                  <SmallCollapse in={isOpen}>
                    <Box display={{ base: "block", md: "none" }} pt={2} pb={1} pl={1}>
                      <VStack align="stretch" gap={2.5}>
                        {section.links.map((item, i) => (
                          <RouterChakraLink
                            key={i}
                            to={item.to}
                            color={accent}
                            fontSize={{ base: "sm", md: "sm" }}
                            lineHeight="1.4"
                            _hover={{ color: accent, opacity: 0.9 }}
                            transition="opacity 0.18s ease"
                            sx={{ paddingBlock: "6px" }}
                          >
                            {item.label}
                          </RouterChakraLink>
                        ))}
                      </VStack>
                    </Box>
                  </SmallCollapse>

                  {/* Desktop links */}
                  <VStack align="flex-start" gap={2.5} display={{ base: "none", md: "flex" }}>
                    {section.links.map((item, i) => (
                      <RouterChakraLink
                        key={i}
                        to={item.to}
                        color={accent}
                        _hover={{ opacity: 0.9 }}
                        transition="opacity 0.18s ease"
                        fontSize="md"
                      >
                        {item.label}
                      </RouterChakraLink>
                    ))}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>

          {/* Payment methods strip */}
          <Box py={{ base: 4, md: 5 }}>
            <Box
              as="ul"
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              gap={{ base: 2, md: 3 }}
              px={{ base: 2, md: 0 }}
            >
              {paymentMethods.map((m, i) => (
                <PaymentPill key={i} src={m.src} />
              ))}
            </Box>
          </Box>

          {/* Bottom row */}
          <HStack justify="center" pb={6}>
            <Text fontSize={{ base: "sm", md: "sm" }} textAlign="center" opacity={0.8}>
              © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
            </Text>
          </HStack>
        </Container>
      </Box>

      {/* Mobile sticky micro-bar (only while real footer NOT visible) */}
      {!footerVisible && (
        <Box display={{ base: "block", md: "none" }} zIndex={1000}>
          {/* Contact sheet */}
          {contactOpen && (
            <Box
              position="fixed"
              right="12px"
              bottom={`calc(78px + env(safe-area-inset-bottom))`}
              bg="rgba(0,0,0,0.85)"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.12)"
              rounded="xl"
              px={4}
              pt={3}
              pb={3}
              width="min(92vw, 380px)"
              boxShadow="xl"
            >
              <HStack justify="space-between" mb={2}>
                <Text color="white" fontWeight={600} fontSize="sm">
                  {t("footer.contact_us") || "Contact us"}
                </Text>
                <Button onClick={closeContact} variant="ghost" color="white" size="xs">
                  {t("common.close") || "Close"}
                </Button>
              </HStack>

              <SimpleGrid columns={4} gap={3}>
                <Link
                  as="a"
                  href="https://wa.me/0000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#25D366"
                      color="white"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={MessageCircle} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="white">
                      WhatsApp
                    </Text>
                  </VStack>
                </Link>

                <Link
                  as="a"
                  href="https://t.me/your_channel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#0088CC"
                      color="white"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={Send} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="white">
                      Telegram
                    </Text>
                  </VStack>
                </Link>

                <Link
                  as="a"
                  href="https://twitter.com/your_handle"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="black"
                      color="white"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={Twitter} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="white">
                      Twitter
                    </Text>
                  </VStack>
                </Link>

                <Link
                  as="a"
                  href="https://discord.gg/your_invite"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#5865F2"
                      color="white"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={Disc} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="white">
                      Discord
                    </Text>
                  </VStack>
                </Link>
              </SimpleGrid>
            </Box>
          )}

          {/* Floating FAB */}
          <Button
            aria-label={t("footer.help") || "Help"}
            onClick={toggleContact}
            position="fixed"
            right="16px"
            bottom={`calc(16px + env(safe-area-inset-bottom))`}
            rounded="full"
            w="56px"
            h="56px"
            p={0}
            bg={accent}
            color="black"
            boxShadow="0 8px 24px rgba(0,0,0,0.28)"
            _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
            _active={{ transform: "translateY(0)" }}
          >
            <Icon as={HeadsetIcon} boxSize={6} />
          </Button>
        </Box>
      )}
    </>
  );
};

/* ---------- Wrapper that decides visibility (no conditional hooks here) ---------- */
const Footer: React.FC = () => {
  const { pathname } = useLocation();
  const showFooter = pathname !== "/company/about";
  return showFooter ? <FooterInner /> : null;
};

export default Footer;
