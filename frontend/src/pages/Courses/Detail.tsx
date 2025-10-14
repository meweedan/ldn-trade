import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Spinner,
  Icon,
  Image,
  AspectRatio,
  chakra,
  Grid,
  GridItem,
  SimpleGrid,
} from "@chakra-ui/react";
import api from "../../api/client";
import RequireEnrollment from "../../components/RequireEnrollment";
import { Lock, Star, Award, Send, Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

type CourseTier = {
  id: string;
  name: string;
  description: string;
  price_usdt: number;
  price_stripe: number; // cents
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  purchases_count?: number;
  rating_avg?: number; // average rating 0-5
  rating_count?: number; // number of ratings
  reviews?: Array<{
    id: string;
    author?: string;
    rating?: number;
    comment?: string;
    created_at?: string;
  }>;
  resources?: Array<{ id: string; type: "pdf" | "video"; url: string }>;
  trailerUrl?: string;
  previewUrl?: string;

  instructorName?: string;
  instructorBio?: string;
  instructorAvatarUrl?: string;

  telegramEmbedUrl?: string;
  telegramUrl?: string;
  discordWidgetId?: string;
  discordInviteUrl?: string;
  twitterTimelineUrl?: string;
};

const levelKey = (lvl: CourseTier["level"]) =>
  ({
    BEGINNER: "levels.beginner",
    INTERMEDIATE: "levels.intermediate",
    ADVANCED: "levels.advanced",
  }[lvl]);

const GOLD = "#b7a27d";
const MotionBox = motion(Box);

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tier, setTier] = React.useState<CourseTier | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const isAdvancedTier = tier?.level === "ADVANCED";
  const { t, i18n } = useTranslation() as any;
  const [isEnrolled, setIsEnrolled] = React.useState(false);

  const fmtDate = React.useCallback(
    (d?: string) => {
      if (!d) return "";
      try {
        return new Date(d).toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return d;
      }
    },
    [i18n.language]
  );

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [resp, mine] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/purchase/mine').catch(() => ({ data: [] })),
        ]);
        setTier(resp.data || null);
        const list: any[] = Array.isArray(mine.data) ? mine.data : [];
        const enrolled = list.some((p: any) => String(p.status || '').toUpperCase() === 'CONFIRMED' && ((p.tier && p.tier.id === id) || p.tierId === id));
        setIsEnrolled(enrolled);
      } catch (e: any) {
        setError(e?.response?.data?.message || t("errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  // Resolve media/asset URLs to absolute URLs (supports /api/uploads and /uploads)
  const apiBase = (process.env.REACT_APP_API_BASE_URL as string) || "http://localhost:4000";
  const apiOrigin = React.useMemo(() => apiBase.replace(/\/?api\/?$/, ""), [apiBase]);
  const resolveUrl = React.useCallback(
    (u?: string) => {
      if (!u) return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      if (u.startsWith("/api/")) return `${apiOrigin}${u}`;
      if (u.startsWith("/uploads/"))
        return `${apiOrigin}${u.replace(/^\/uploads\//, "/api/uploads/")}`;
      if (!u.startsWith("/")) return `${window.location.origin}/${u.replace(/^\.\//, "")}`;
      return u;
    },
    [apiOrigin]
  );

  // Build media list (videos/images) from tier fields and resources
  const media = React.useMemo(() => {
    const items: Array<{ type: "video" | "image"; url: string; label?: string }> = [];
    const pushUrl = (url?: string, label?: string) => {
      if (!url) return;
      const ru = resolveUrl(url);
      const isVideo =
        /(\.mp4|\.webm|\.ogg|\.mov|\.m4v)$/i.test(ru) ||
        ru.includes("youtube.com") ||
        ru.includes("youtu.be");
      items.push({ type: isVideo ? "video" : "image", url: ru, label });
    };
    if (tier?.trailerUrl) pushUrl(tier.trailerUrl, "Trailer");
    if (tier?.previewUrl) pushUrl(tier.previewUrl, "Preview");
    (tier?.resources || []).forEach((r) => {
      const ru = resolveUrl(r.url);
      if (r.type === "video") items.push({ type: "video", url: ru, label: "Video" });
      else if (/(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)$/i.test(ru))
        items.push({ type: "image", url: ru, label: "Image" });
    });
    return items;
  }, [tier, resolveUrl]);

  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    setIdx(0);
  }, [tier?.id]);

  const next = () => setIdx((i) => (media.length ? (i + 1) % media.length : 0));
  const prev = () => setIdx((i) => (media.length ? (i - 1 + media.length) % media.length : 0));

  // --- UI helpers ---
  const StarsRow = ({ value, size = 18 }: { value: number; size?: number }) => {
    const full = Math.round(value || 0); // match your snippet style (no halves)
    return (
      <HStack gap={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon
            key={i}
            as={Star}
            boxSize={`${size}px`}
            color={i < full ? GOLD : "gray.400"}
            fill={i < full ? GOLD : "none"}
          />
        ))}
      </HStack>
    );
  };

  const FeatureChip = ({ children }: { children: React.ReactNode }) => (
    <HStack
      px={3}
      py={2}
      border="1px solid"
      borderColor="border.default"
      borderRadius="md"
      color="text.primary"
      minH="40px"
    >
      {children}
    </HStack>
  );

  return (
    <Box py={{ base: 8, md: 12 }} color="text.primary">
      <Container maxW="7xl">
        {loading && (
          <HStack>
            <Spinner size="sm" />
            <Text>{t("states.loading")}</Text>
          </HStack>
        )}
        {error && <Text color="red.500">{error}</Text>}

        {!loading && !error && tier && (
          <VStack align="stretch" gap={{ base: 8, md: 10 }}>
            {/* ===== Top Split Layout ===== */}
            <Grid templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }} gap={{ base: 6, lg: 8 }}>
              {/* LEFT: Media */}
              <GridItem>
                <VStack align="stretch" gap={3}>
                  <Box
                    borderColor={GOLD}
                    borderRadius="lg"
                    overflow="hidden"
                    borderWidth="1px"
                    position="relative"
                  >
                    <AspectRatio ratio={16 / 9} bg="black">
                      <MotionBox
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        {media[idx]?.type === "video" ? (
                          media[idx].url.includes("youtube") ||
                          media[idx].url.includes("youtu.be") ? (
                            <chakra.iframe
                              src={media[idx].url}
                              title={`media-${idx}`}
                              allowFullScreen
                              width="100%"
                              height="100%"
                            />
                          ) : (
                            <chakra.video
                              src={media[idx].url}
                              controls
                              width="100%"
                              height="100%"
                            />
                          )
                        ) : (
                          <Image
                            src={media[idx]?.url}
                            alt={`media-${idx}`}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        )}
                      </MotionBox>
                    </AspectRatio>

                    {media.length > 1 && (
                      <>
                        <Button
                          size="sm"
                          position="absolute"
                          top="50%"
                          left={2}
                          transform="translateY(-50%)"
                          onClick={prev}
                        >
                          {t("common.prev") || "Prev"}
                        </Button>
                        <Button
                          size="sm"
                          position="absolute"
                          top="50%"
                          right={2}
                          transform="translateY(-50%)"
                          onClick={next}
                        >
                          {t("common.next") || "Next"}
                        </Button>
                      </>
                    )}
                  </Box>

                  {media.length > 1 && (
                    <HStack p={1} overflowX="auto" gap={3}>
                      {media.map((m, i) => (
                        <Box
                          key={i}
                          onClick={() => setIdx(i)}
                          cursor="pointer"
                          borderWidth={i === idx ? "2px" : "1px"}
                          borderColor={i === idx ? GOLD : "border.default"}
                          borderRadius="md"
                          p={1}
                          minW="92px"
                        >
                          {m.type === "image" ? (
                            <Image
                              src={m.url}
                              alt={`thumb-${i}`}
                              height="60px"
                              width="90px"
                              objectFit="cover"
                            />
                          ) : (
                            <Box
                              height="60px"
                              width="90px"
                              bg="black"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                            >
                              {m.label || "Video"}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </GridItem>

              {/* RIGHT: Header, rating, price, CTA, instructor, meta */}
              <GridItem>
                <VStack align="stretch" gap={4}>
                  <VStack align="stretch" gap={2}>
                    <HStack flexWrap="wrap" gap={3}>
                      <Heading size={{ base: "lg", md: "xl" }}>{tier.name}</Heading>
                      <Badge colorScheme="yellow" borderRadius="full">
                        {t(levelKey(tier.level))}
                      </Badge>
                    </HStack>

                    {typeof tier.rating_avg === "number" && (
                      <HStack gap={3} align="center" flexWrap="wrap">
                        <StarsRow value={tier.rating_avg} />
                        <Text fontWeight="semibold">{(tier.rating_avg ?? 0).toFixed(1)}</Text>
                        <Text color="text.muted">
                          {t("meta.rating_summary", {
                            defaultValue: "{{avg}} ({{count}} reviews)",
                            avg: (tier.rating_avg ?? 0).toFixed(1),
                            count: tier.rating_count ?? 0,
                          })}
                        </Text>
                      </HStack>
                    )}

                    <Text color="text.muted">{tier.description}</Text>
                  </VStack>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                    <Box>
                      <Heading size="lg">
                        {(tier.price_usdt ?? 0) <= 0
                          ? t("price.free", { defaultValue: "Free" })
                          : t("price.usdt", { value: tier.price_usdt })}
                      </Heading>
                    </Box>
                  </SimpleGrid>

                  <HStack>
                    {isEnrolled ? (
                      <RouterLink to={`/learn/${tier.id}`}>
                        <Button
                          w="full"
                          size="lg"
                          bg={GOLD}
                          _hover={{ opacity: 0.9 }}
                          color="black"
                          borderRadius="xl"
                        >
                          {t("home.courses.view", { defaultValue: "View Course" })}
                        </Button>
                      </RouterLink>
                    ) : (
                      <RouterLink to={`/checkout?tierId=${tier.id}`}>
                        <Button
                          w="full"
                          size="lg"
                          bg={GOLD}
                          _hover={{ opacity: 0.9 }}
                          color="black"
                          borderRadius="xl"
                        >
                          {t("actions.enroll")}
                        </Button>
                      </RouterLink>
                    )}
                  </HStack>

                  {/* Benefits / What you get */}
                  <Box>
                    {/* Benefits / What you’ll get (compact, borderless) */}
                    <VStack align="stretch" gap={2} mt={2}>
                      <HStack align="start" gap={3}>
                        <Icon as={Award} boxSize={5} color={GOLD} mt="2px" />
                        <Text fontSize="sm" lineHeight="1.4">
                          {t("checkout.benefits.certificate", {
                            defaultValue: "You’ll receive a certificate of achievement",
                          })}
                        </Text>
                      </HStack>

                      <HStack align="start" gap={3}>
                        <Icon as={Headphones} boxSize={5} color={GOLD} mt="2px" />
                        <Text fontSize="sm" lineHeight="1.4">
                          {t("checkout.benefits.lifetime", {
                            defaultValue: "Lifetime access to all tiers",
                          })}
                        </Text>
                      </HStack>

                      {isAdvancedTier && (
                        <HStack align="start" gap={3}>
                          <Icon as={Send} boxSize={5} color={GOLD} mt="2px" />
                          <Text fontSize="sm" lineHeight="1.4">
                            {t("checkout.benefits.vipSignals", {
                              defaultValue: "+ our Telegram VIP signals group",
                            })}
                          </Text>
                        </HStack>
                      )}

                      <HStack align="start" gap={3}>
                        <Icon as={Send} boxSize={5} color={GOLD} mt="2px" />
                        <Text fontSize="sm" lineHeight="1.4">
                          {t("checkout.benefits.brokerBonus", {
                            defaultValue:
                              "Join our certified broker and enjoy a complimentary 50–100% bonus on your deposits",
                          })}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box borderTop="1px solid" borderColor="border.default" my={4} />

                  {(tier.instructorName || tier.instructorBio || tier.instructorAvatarUrl) && (
                    <HStack align="start" gap={4}>
                      {tier.instructorAvatarUrl ? (
                        <Image
                          src={resolveUrl(tier.instructorAvatarUrl)}
                          alt={tier.instructorName || "Instructor"}
                          boxSize="64px"
                          borderRadius="full"
                          objectFit="cover"
                        />
                      ) : (
                        <Box
                          boxSize="64px"
                          borderRadius="full"
                          bg="gray.300"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                        >
                          {(tier.instructorName || " ? ").slice(0, 1)}
                        </Box>
                      )}
                      <VStack align="start" gap={1}>
                        {tier.instructorName && <Heading size="sm">{tier.instructorName}</Heading>}
                        {tier.instructorBio && <Text color="text.muted">{tier.instructorBio}</Text>}
                      </VStack>
                    </HStack>
                  )}

                  <HStack gap={6} flexWrap="wrap">
                    {typeof tier.purchases_count === "number" && (
                      <Text>
                        {t("meta.purchased_by", {
                          defaultValue: "{{count}} students enrolled",
                          count: tier.purchases_count,
                        })}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </GridItem>
            </Grid>

            {/* ===== Features / Social Widgets (gated) ===== */}
            <Box>
              <Heading size="md" mb={3}>
                {t("socials.title", {
                  defaultValue: "Premium features (included after enrollment)",
                })}
              </Heading>

              {/* Locked preview */}
              <RequireEnrollment
                tierId={tier.id}
                fallback={
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    <FeatureChip>
                      <Icon as={Lock} />
                      <Text>{t("features.signals", { defaultValue: "Telegram Signals" })}</Text>
                    </FeatureChip>
                    <FeatureChip>
                      <Icon as={Lock} />
                      <Text>{t("features.discord", { defaultValue: "Private Discord" })}</Text>
                    </FeatureChip>
                    <FeatureChip>
                      <Icon as={Lock} />
                      <Text>
                        {t("features.twitter", { defaultValue: "Curated X/Twitter feed" })}
                      </Text>
                    </FeatureChip>
                  </SimpleGrid>
                }
              >
                <VStack align="stretch" gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    {/* Telegram */}
                    <Box>
                      <Heading size="sm" mb={2}>
                        Telegram
                      </Heading>
                      {tier.telegramEmbedUrl ? (
                        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                          <AspectRatio ratio={16 / 9}>
                            <chakra.iframe
                              src={tier.telegramEmbedUrl}
                              title="Telegram"
                              width="100%"
                              height="100%"
                            />
                          </AspectRatio>
                        </Box>
                      ) : tier.telegramUrl ? (
                        <chakra.a
                          href={tier.telegramUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: GOLD }}
                        >
                          {t("socials.join_telegram", { defaultValue: "Join our Telegram" })}
                        </chakra.a>
                      ) : (
                        <Text color="text.muted">
                          {t("socials.telegram_unavailable", {
                            defaultValue: "Telegram not available.",
                          })}
                        </Text>
                      )}
                    </Box>

                    {/* Discord */}
                    <Box>
                      <Heading size="sm" mb={2}>
                        Discord
                      </Heading>
                      {tier.discordWidgetId ? (
                        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                          <AspectRatio ratio={16 / 9}>
                            <chakra.iframe
                              src={`https://discord.com/widget?id=${tier.discordWidgetId}&theme=dark`}
                              title="Discord"
                              allowTransparency
                              allowFullScreen
                            />
                          </AspectRatio>
                        </Box>
                      ) : tier.discordInviteUrl ? (
                        <chakra.a
                          href={tier.discordInviteUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: GOLD }}
                        >
                          {t("socials.join_discord", { defaultValue: "Join our Discord" })}
                        </chakra.a>
                      ) : (
                        <Text color="text.muted">
                          {t("socials.discord_unavailable", {
                            defaultValue: "Discord not available.",
                          })}
                        </Text>
                      )}
                    </Box>

                    {/* X (Twitter) */}
                    <Box>
                      <Heading size="sm" mb={2}>
                        X (Twitter)
                      </Heading>
                      {tier.twitterTimelineUrl ? (
                        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                          <AspectRatio ratio={16 / 9}>
                            <chakra.iframe
                              src={`https://twitframe.com/show?url=${encodeURIComponent(
                                tier.twitterTimelineUrl
                              )}`}
                              title="X Timeline"
                            />
                          </AspectRatio>
                        </Box>
                      ) : (
                        <Text color="text.muted">
                          {t("socials.twitter_unavailable", {
                            defaultValue: "X feed not available.",
                          })}
                        </Text>
                      )}
                    </Box>
                  </SimpleGrid>
                </VStack>
              </RequireEnrollment>
            </Box>

            {/* ===== Materials (gated) ===== */}
            <Box>
              <Heading size="md" mt={2} mb={3}>
                {t("materials.title", { defaultValue: "Course materials" })}
              </Heading>
              <RequireEnrollment
                tierId={tier.id}
                fallback={
                  <HStack color="text.muted" gap={2}>
                    <Icon as={Lock} />
                    <Text>
                      {t("materials.locked", { defaultValue: "Enroll to unlock materials." })}
                    </Text>
                  </HStack>
                }
              >
                {Array.isArray(tier.resources) && tier.resources.length > 0 ? (
                  <Box as="ul" pl={4} style={{ listStyle: "disc" }}>
                    {tier.resources.map((r) => (
                      <Box as="li" key={r.id} mb={1}>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          {r.type.toUpperCase()} — {r.url}
                        </a>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text color="text.muted">
                    {t("materials.empty", { defaultValue: "No materials published yet." })}
                  </Text>
                )}
              </RequireEnrollment>
            </Box>

            {/* ===== Reviews ===== */}
            <Box>
              <Box borderTop="1px solid" borderColor="border.default" my={4} />
              <Heading size="md" mb={3}>
                {t("reviews.title", { defaultValue: "Reviews" })}
              </Heading>
              {Array.isArray(tier.reviews) && tier.reviews.length > 0 ? (
                <Box position="relative">
                  <HStack justify="space-between" mb={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById("reviews-rail");
                        if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                      }}
                    >
                      {t("common.prev") || "Prev"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById("reviews-rail");
                        if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                      }}
                    >
                      {t("common.next") || "Next"}
                    </Button>
                  </HStack>
                  <Box
                    id="reviews-rail"
                    display="flex"
                    gap={4}
                    overflowX="auto"
                    py={2}
                    px={1}
                    scrollSnapType="x mandatory"
                  >
                    {tier.reviews.map((rv) => (
                      <Box
                        key={rv.id}
                        minW={{ base: "260px", md: "360px" }}
                        maxW={{ base: "260px", md: "360px" }}
                        p={3}
                        border="1px solid"
                        borderColor="border.default"
                        borderRadius="md"
                        scrollSnapAlign="start"
                        bg="transparent"
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" gap={1}>
                            <HStack>
                              <Text fontWeight={600}>
                                {(rv as any).author ||
                                  (rv as any).user?.name ||
                                  t("reviews.anonymous", { defaultValue: "Anonymous" })}
                              </Text>
                              <HStack>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Icon
                                    key={i}
                                    as={Star}
                                    color={i < Math.round(rv.rating ?? 0) ? GOLD : "gray.400"}
                                    fill={i < Math.round(rv.rating ?? 0) ? GOLD : "none"}
                                  />
                                ))}
                              </HStack>
                            </HStack>
                            {rv.comment && <Text>{rv.comment}</Text>}
                          </VStack>
                          <Text fontSize="sm" color="text.muted">
                            {fmtDate(rv.created_at)}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Text color="text.muted">
                  {t("reviews.empty", { defaultValue: "No reviews yet." })}
                </Text>
              )}
            </Box>
          </VStack>
        )}

        {!loading && !error && !tier && <Text>{t("errors.load_failed")}</Text>}
      </Container>
    </Box>
  );
};

export default CourseDetail;
