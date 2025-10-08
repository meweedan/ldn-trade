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
  HelpCircle,
} from "lucide-react";
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { Link as RouterLink, LinkProps as RouterLinkProps, useLocation } from "react-router-dom";

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

  return (
    <>
      {/* Help FAB (desktop only) */}
      <Box
        position="fixed"
        right="16px"
        bottom="16px"
        zIndex={1100}
        display={{ base: "none", md: "block" }}
      >
        <Button
          aria-label={t("footer.help") || "Help"}
          rounded="full"
          w="44px"
          h="44px"
          p={0}
          bg={accent}
          color="black"
          _hover={{ opacity: 0.95 }}
          onClick={() => setHelpOpen((v) => !v)}
        >
          <Icon as={HelpCircle} boxSize={5} />
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
      <Box py={{ base: 6, md: 12 }} ref={sentinelRef}>
        <Container px={{ base: 5, md: 8 }} maxW="container.xl">
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={{ base: 6, md: 12 }}
            mb={{ base: 6, md: 12 }}
          >
            {/* Brand */}
            <VStack align={{ base: "center", md: "flex-start" }} gap={3}>
              <Image src="/logo.png" alt="Logo" w="94px" h="94px" objectFit="contain" />
              <Text
                fontSize={{ base: "sm", md: "md" }}
                opacity={0.8}
                textAlign={{ base: "center", md: "left" }}
                maxW="sm"
              >
                {t("footer.tagline") || "Premium education for traders & investors."}
              </Text>
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
                    py={2}
                    color={accent}
                    onClick={() => toggleSection(idx)}
                    display={{ base: "flex", md: "none" }}
                  >
                    <Heading size="lg">{section.title}</Heading>
                    <Icon as={isOpen ? ChevronUp : ChevronDown} />
                  </Button>

                  {/* Desktop header */}
                  <Heading size="lg" color={accent} display={{ base: "none", md: "block" }} mb={3}>
                    {section.title}
                  </Heading>

                  {/* Mobile links */}
                  <SmallCollapse in={isOpen}>
                    <HStack
                      align={{ base: "center", md: "flex-start" }}
                      gap={8}
                      display={{ base: "flex", md: "none" }}
                      pb={2}
                    >
                      {section.links.map((item, i) => (
                        <RouterChakraLink
                          key={i}
                          to={item.to}
                          color={accent}
                          _hover={{ color: accent }}
                          transition="color 0.2s"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          {item.label}
                        </RouterChakraLink>
                      ))}
                    </HStack>
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

          {/* Bottom row */}
          <HStack justify="center">
            <Text fontSize={{ base: "sm", md: "sm" }} textAlign="center" opacity={0.8}>
              © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
            </Text>
          </HStack>
        </Container>
      </Box>

      {/* Mobile sticky micro-bar (only while real footer NOT visible) */}
      {!footerVisible && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          left={0}
          right={0}
          bottom={0}
          zIndex={1000}
        >
          {!contactOpen && (
            <HStack
              onClick={toggleContact}
              justify="center"
              h="38px"
              bg={accent}
              color="black"
              cursor="pointer"
              userSelect="none"
              px={3}
              pb="calc(env(safe-area-inset-bottom) / 2)"
              fontWeight={600}
            >
              <Icon as={ChevronUp} />
              <Text fontSize="sm">{t("footer.contact_us") || "Contact us"}</Text>
            </HStack>
          )}

          {contactOpen && (
            <Box
              bg="rgba(0,0,0,0.85)"
              backdropFilter="blur(10px)"
              borderTop="1px solid rgba(255,255,255,0.15)"
              pt={3}
              pb={`calc(12px + env(safe-area-inset-bottom))`}
              px={4}
            >
              <HStack justify="center" mb={2}>
                <Button onClick={closeContact} variant="ghost" color="white" size="xs">
                  <HStack gap={1}>
                    <Icon as={ChevronDown} />
                    <Text>{t("common.close") || "Close"}</Text>
                  </HStack>
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
