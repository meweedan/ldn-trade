import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Stack,
  Icon,
  Alert,
  AlertIcon,
  Spacer,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/client";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { TokenUSDT } from "@web3icons/react";

type Review = { rating: number };

type CourseTier = {
  id: string;
  name: string;
  description: string;
  price_usdt: number;
  price_stripe: number; // cents
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating?: number; // explicit avg (optional)
  latestReviews?: Review[]; // reviews to derive avg from (optional)
  reviewsCount?: number; // optional total count
};

const levelKey = (lvl: CourseTier["level"]) =>
  ({
    BEGINNER: "levels.beginner",
    INTERMEDIATE: "levels.intermediate",
    ADVANCED: "levels.advanced",
  }[lvl]);

const GOLD = "#b7a27d";

const CoursesList: React.FC = () => {
  const { t } = useTranslation() as any;
  const [tiers, setTiers] = React.useState<CourseTier[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const resp = await api.get("/courses");
        setTiers(resp.data || []);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || t("errors.load_failed", { defaultValue: "Failed to load." })
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const renderSnippetStyleStars = (tier: CourseTier) => {
    const explicit = Number((tier as any)?.rating);
    const arr = Array.isArray((tier as any)?.latestReviews) ? (tier as any).latestReviews : [];
    const fromReviews =
      arr.length > 0
        ? arr.reduce((s: number, r: any) => s + (Number(r?.rating) || 0), 0) / arr.length
        : 0;
    const avg = explicit > 0 ? explicit : fromReviews;

    if (!avg || Number.isNaN(avg)) return null;

    const full = Math.round(avg); // round to nearest integer
    return (
      <HStack justify="center" gap={1}>
        {Array.from({ length: 5 }).map((_, k) => (
          <Icon
            key={k}
            as={Star}
            boxSize={4}
            color={k < full ? GOLD : "gray.400"}
            fill={k < full ? GOLD : "none"}
          />
        ))}
      </HStack>
    );
  };

  return (
    <Box py={{ base: 4, md: 10 }}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={6}>
          <HStack align="center">
            <Heading mb={2} fontSize="2xl" fontWeight="bold" textAlign="center" w="full">
              {t("title", { defaultValue: "Courses" })}
            </Heading>
          </HStack>

          {/* Global crypto note + CTA */}
          <Alert status="info" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <HStack w="full" gap={3} flexWrap="wrap">
              <Text>
                {t("notes.usdt_trc20", {
                  defaultValue: "All USDT deposits must be sent via the TRC20 (TRON) network.",
                })}
              </Text>
              <Spacer />
              <Button
                as={RouterLink}
                to="/guide/crypto"
                size="sm"
                variant="outline"
                borderColor={GOLD}
                color={GOLD}
              >
                {t("actions.crypto_guide", { defaultValue: "Guide to crypto" })}
              </Button>
            </HStack>
          </Alert>

          {loading && <Text>{t("states.loading", { defaultValue: "Loading..." })}</Text>}
          {error && <Text color="red.500">{error}</Text>}
          {!loading && !error && tiers.length === 0 && (
            <Text>{t("states.empty", { defaultValue: "No courses available yet." })}</Text>
          )}

          {!loading && !error && tiers.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 2 }} gap={{ base: 4, md: 6 }}>
              {tiers.map((tier) => (
                <Box
                  key={tier.id}
                  border="1px solid"
                  borderColor={GOLD}
                  borderRadius="lg"
                  p={{ base: 4, md: 5 }}
                  _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 200ms ease"
                  bg="bg.surface"
                >
                  <Stack gap={4}>
                    {/* Header: Title + Level */}
                    <HStack justify="space-between" align="start">
                      <Heading size={{ base: "md", md: "lg" }} noOfLines={2}>
                        {tier.name}
                      </Heading>
                      <Badge
                        color={GOLD}
                        variant="subtle"
                        borderRadius="md"
                        border={`1px solid ${GOLD}`}
                      >
                        {t(levelKey(tier.level))}
                      </Badge>
                    </HStack>

                    {/* Description */}
                    <Text noOfLines={{ base: 3, md: 4 }} opacity={0.85}>
                      {tier.description}
                    </Text>

                    {/* Reviews (snippet style) */}
                    {renderSnippetStyleStars(tier)}

                    {/* Prices + Actions */}
                    <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                      {/* USDT pill with icon + amount */}
                      <HStack
                        px={3}
                        py={1}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={GOLD}
                        bg="transparent"
                        gap={2}
                      >
                        <Icon as={TokenUSDT} boxSize={5} />
                        <Text fontWeight="bold">
                          {(tier.price_usdt ?? 0) <= 0
                            ? t("price.free", { defaultValue: "Free" })
                            : t("price.usdt", {
                                value: tier.price_usdt,
                                defaultValue: `${tier.price_usdt} USDT`,
                              })}
                        </Text>
                      </HStack>

                      {/* Actions */}
                      <HStack gap={3}>
                        <Button
                          as={RouterLink}
                          to={`/courses/${tier.id}`}
                          variant="outline"
                          borderColor={GOLD}
                          color={GOLD}
                        >
                          {t("actions.view_details", { defaultValue: "View details" })}
                        </Button>
                        <Button
                          as={RouterLink}
                          to={`/checkout?tierId=${tier.id}`}
                          bg={GOLD}
                          _hover={{ opacity: 0.9 }}
                          color="black"
                        >
                          {t("actions.enroll", { defaultValue: "Enroll" })}
                        </Button>
                      </HStack>
                    </HStack>

                    {/* Per-card network reminder (subtle) */}
                    <Text fontSize="xs" opacity={0.7} textAlign="center">
                      {t("notes.network_reminder", {
                        defaultValue: "Use TRC20 network for USDT payments.",
                      })}
                    </Text>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default CoursesList;
