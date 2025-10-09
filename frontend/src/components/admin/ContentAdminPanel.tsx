import React from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  Text,
  Icon,
  chakra,
  Image,
  Badge,
} from "@chakra-ui/react";
import { FilePlus2, Save, Upload, Trash2 } from "lucide-react";
import api from "../../api/client"; // kept as fallback
import GlassCard from "../../components/GlassCard";
import { useTranslation } from "react-i18next";

const CInput = chakra(Input);
const CSelect = chakra("select");

export type ContentAdminPanelProps = {
  /** Gate the panel; if false, shows a Forbidden notice */
  isAdmin?: boolean;
  /** Inject a custom API client; falls back to ../../api/client */
  apiClient?: typeof api;
  /** Auto-load tiers/banners on mount (default: true) */
  autoLoad?: boolean;
  /** Initial data (useful when server-side fetching or lifting state up) */
  initialTiers?: Tier[];
  initialBanners?: Banner[];
  /** Notify parent when collections change */
  onTiersChange?: (tiers: Tier[]) => void;
  onBannersChange?: (banners: Banner[]) => void;
  /** Start tab: "content" | "banners" (default: "content") */
  initialTab?: "content" | "banners";
};

type Tier = {
  id?: string;
  name: string;
  description: string;
  price_usdt: number | string;
  price_stripe: number | string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  trailerUrl?: string;
  previewUrl?: string;
  // Optional fields
  instructorName?: string;
  instructorBio?: string;
  instructorAvatarUrl?: string;
  telegramEmbedUrl?: string;
  telegramUrl?: string;
  discordWidgetId?: string;
  discordInviteUrl?: string;
  twitterTimelineUrl?: string;
};

type Banner = {
  id?: string | number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  href?: string;
};

const ContentAdminPanel: React.FC<ContentAdminPanelProps> = ({
  isAdmin = false,
  apiClient = api,
  autoLoad = true,
  initialTiers = [],
  initialBanners = [],
  onTiersChange,
  onBannersChange,
  initialTab = "content",
}) => {
  const { t } = useTranslation() as any;
  const [saving, setSaving] = React.useState(false);

  const [tiers, setTiers] = React.useState<Tier[]>(initialTiers);
  const [newTier, setNewTier] = React.useState<Tier>({
    name: "",
    description: "",
    price_usdt: "",
    price_stripe: "",
    level: "BEGINNER",
    trailerUrl: "",
    previewUrl: "",
  });

  const [resourcesByTier, setResourcesByTier] = React.useState<Record<string, any[]>>({});
  const [showNewTier, setShowNewTier] = React.useState(false);
  // Staged files for new tier creation
  const [newPdfFiles, setNewPdfFiles] = React.useState<File[]>([]);
  const [newVideoFiles, setNewVideoFiles] = React.useState<File[]>([]);

  const [banners, setBanners] = React.useState<Banner[]>(initialBanners);
  const [newBanner, setNewBanner] = React.useState<Banner>({
    imageUrl: "",
    title: "",
    subtitle: "",
    badge: "",
    href: "",
  });
  const [showNewBanner, setShowNewBanner] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"content" | "banners">(initialTab);

  // Load initial data (optional)
  React.useEffect(() => {
    if (!autoLoad) return;
    (async () => {
      try {
        const tRes = await apiClient.get("/courses");
        if (Array.isArray(tRes?.data)) {
          setTiers(tRes.data);
          onTiersChange?.(tRes.data);
        }
      } catch {}
      try {
        const bRes = await apiClient.get("/content/banners");
        const data = (bRes?.data?.data || []) as any[];
        const mapped = data.map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl || r.image_url,
          title: r.title,
          subtitle: r.subtitle,
          badge: r.badge,
          href: r.href,
        }));
        setBanners(mapped);
        onBannersChange?.(mapped);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, apiClient]);

  // API helpers (kept same, but use apiClient prop)
  const onUpload = async (file: File) => {
    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
    const dataUrl = await toDataUrl(file);
    const { data } = await apiClient.post("/admin/upload", { data: dataUrl, filename: file.name });
    return data?.url as string;
  };

  const loadResources = async (tierId: string) => {
    if (!tierId) return;
    try {
      const { data } = await apiClient.get(`/courses/${tierId}`);
      const items = Array.isArray(data?.resources) ? data.resources : [];
      setResourcesByTier((prev) => ({ ...prev, [tierId]: items }));
    } catch {}
  };

  const addResource = async (tierId: string, file: File, forcedType?: "pdf" | "video") => {
    if (!tierId || !file) return;
    const url = await onUpload(file);
    const type: "pdf" | "video" = forcedType || (file.type.includes("pdf") ? "pdf" : "video");
    const { data } = await apiClient.post(`/courses/${tierId}/resources`, { type, url });
    const next = { ...resourcesByTier, [tierId]: [...(resourcesByTier[tierId] || []), data] };
    setResourcesByTier(next);
  };

  const removeResource = async (rid: string, tierId: string) => {
    if (!rid) return;
    await apiClient.delete(`/courses/resources/${rid}`);
    setResourcesByTier((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || []).filter((r) => r.id !== rid),
    }));
  };

  // Course tier CRUD (componentized)
  const createTier = async () => {
    setSaving(true);
    try {
      const payload = {
        ...newTier,
        price_usdt: Number(newTier.price_usdt || 0),
        price_stripe: Number(newTier.price_stripe || 0),
      };
      const { data } = await apiClient.post("/courses", payload);
      const created = data;
      const next = [...tiers, created];
      setTiers(next);
      onTiersChange?.(next);

      // Attach staged materials if any
      if (created?.id) {
        for (const f of newPdfFiles) {
          const url = await onUpload(f);
          await apiClient.post(`/courses/${created.id}/resources`, { type: "pdf", url });
        }
        for (const f of newVideoFiles) {
          const url = await onUpload(f);
          await apiClient.post(`/courses/${created.id}/resources`, { type: "video", url });
        }
      }

      // Reset form and staged files
      setNewTier({
        name: "",
        description: "",
        price_usdt: "",
        price_stripe: "",
        level: "BEGINNER",
        trailerUrl: "",
        previewUrl: "",
      });
      setNewPdfFiles([]);
      setNewVideoFiles([]);
    } finally {
      setSaving(false);
    }
  };

  const updateTierRow = async (tier: Tier) => {
    if (!tier.id) return;
    setSaving(true);
    try {
      const payload = {
        ...tier,
        price_usdt: Number(tier.price_usdt || 0),
        price_stripe: Number(tier.price_stripe || 0),
      };
      const { data } = await apiClient.put(`/courses/${tier.id}`, payload);
      const next = tiers.map((t) => (t.id === tier.id ? data : t));
      setTiers(next);
      onTiersChange?.(next);
    } finally {
      setSaving(false);
    }
  };

  const deleteTierRow = async (id?: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await apiClient.delete(`/courses/${id}`);
      const next = tiers.filter((t) => t.id !== id);
      setTiers(next);
      onTiersChange?.(next);
    } finally {
      setSaving(false);
    }
  };

  // Banner CRUD (componentized)
  const createBanner = async () => {
    setSaving(true);
    try {
      const { data } = await apiClient.post("/admin/content/banner", newBanner);
      const created = data?.data || null;
      if (created) {
        const mapped = { ...created, imageUrl: created.imageUrl };
        const next = [mapped, ...banners];
        setBanners(next);
        onBannersChange?.(next);
        setNewBanner({ imageUrl: "", title: "", subtitle: "", badge: "", href: "" });
      }
    } finally {
      setSaving(false);
    }
  };

  const updateBannerRow = async (b: Banner) => {
    if (!b.id) return;
    setSaving(true);
    try {
      const { data } = await apiClient.put(`/admin/content/banner/${b.id}` as string, b as any);
      const updated = data?.data || null;
      if (updated) {
        const next = banners.map((x) => (x.id === b.id ? { ...x, ...updated } : x));
        setBanners(next);
        onBannersChange?.(next);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteBannerRow = async (id?: string | number) => {
    if (!id) return;
    setSaving(true);
    try {
      await apiClient.delete(`/admin/content/banner/${id}` as string);
      const next = banners.filter((x) => x.id !== id);
      setBanners(next);
      onBannersChange?.(next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box py={6} color="text.primary">
      {!isAdmin ? (
        <>
          <Heading size="md" mb={2}>
            {t("common.forbidden", "Forbidden")}
          </Heading>
          <Text>{t("admin.must_be_admin", "You must be an admin to view this section.")}</Text>
        </>
      ) : (
        <>
          <HStack justify="center" mb={4}>
            <Heading size="lg">{t("admin.create_content", "Create Content")}</Heading>
            <Icon as={FilePlus2} />
          </HStack>

          <HStack justify="center" mb={4} gap={3}>
            <Button
              variant={activeTab === "content" ? "solid" : "ghost"}
              onClick={() => setActiveTab("content")}
            >
              {t("admin.content", "Content")}
            </Button>
            <Button
              variant={activeTab === "banners" ? "solid" : "ghost"}
              onClick={() => setActiveTab("banners")}
            >
              {t("admin.banners", "Banners")}
            </Button>
          </HStack>

          {activeTab === "content" && (
            <VStack align="center" gap={8}>
              <GlassCard>
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">{t("admin.course_tiers", "Course Tiers")}</Heading>
                  <Button onClick={() => setShowNewTier((v) => !v)}>
                    <Icon as={FilePlus2} mr={2} />
                    {showNewTier
                      ? t("common.hide", "Hide")
                      : t("admin.create_content", "Create New")}
                  </Button>
                </HStack>

                {/* Create new tier */}
                {showNewTier && (
                  <VStack align="stretch" gap={3} mb={4}>
                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("common.name", "Name")}
                        value={newTier.name}
                        onChange={(e: any) => setNewTier({ ...newTier, name: e.target.value })}
                      />
                      <CSelect
                        value={newTier.level}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setNewTier({ ...newTier, level: e.target.value as any })
                        }
                      >
                        <option value="BEGINNER">{t("course.level.beginner", "BEGINNER")}</option>
                        <option value="INTERMEDIATE">
                          {t("course.level.intermediate", "INTERMEDIATE")}
                        </option>
                        <option value="ADVANCED">{t("course.level.advanced", "ADVANCED")}</option>
                      </CSelect>
                      <CInput
                        placeholder={t("common.price_usdt", "Price (USDT)")}
                        value={newTier.price_usdt}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, price_usdt: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("common.price_stripe", "Price (Stripe cents)")}
                        value={newTier.price_stripe}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, price_stripe: e.target.value })
                        }
                      />
                    </HStack>

                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("admin.trailer_url", "Trailer URL (optional)")}
                        value={newTier.trailerUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, trailerUrl: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("admin.preview_url", "Preview URL (optional)")}
                        value={newTier.previewUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, previewUrl: e.target.value })
                        }
                      />
                    </HStack>

                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("instructor.name", "Instructor Name")}
                        value={newTier.instructorName || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, instructorName: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("instructor.avatar_url", "Instructor Avatar URL")}
                        value={newTier.instructorAvatarUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, instructorAvatarUrl: e.target.value })
                        }
                      />
                    </HStack>

                    <HStack gap={3} align="center" flexWrap="wrap">
                      <Box>
                        <Text fontSize="sm" mb={1}>
                          {t("instructor.upload_photo", "Upload Instructor Photo")}
                        </Text>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await onUpload(file);
                            setNewTier((prev) => ({ ...prev, instructorAvatarUrl: url }));
                          }}
                        />
                      </Box>
                    </HStack>

                    <Textarea
                      placeholder={t("instructor.bio", "Instructor Bio")}
                      value={newTier.instructorBio || ""}
                      onChange={(e) =>
                        setNewTier({ ...newTier, instructorBio: (e.target as any).value })
                      }
                    />

                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("social.telegram_embed", "Telegram embed URL")}
                        value={newTier.telegramEmbedUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, telegramEmbedUrl: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("social.telegram_join", "Telegram join URL")}
                        value={newTier.telegramUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, telegramUrl: e.target.value })
                        }
                      />
                    </HStack>

                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("social.discord_widget", "Discord widget ID")}
                        value={newTier.discordWidgetId || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, discordWidgetId: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("social.discord_invite", "Discord invite URL")}
                        value={newTier.discordInviteUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, discordInviteUrl: e.target.value })
                        }
                      />
                    </HStack>

                    <CInput
                      placeholder={t("social.twitter_timeline", "X/Twitter timeline URL")}
                      value={newTier.twitterTimelineUrl || ""}
                      onChange={(e: any) =>
                        setNewTier({ ...newTier, twitterTimelineUrl: e.target.value })
                      }
                    />

                    <Textarea
                      placeholder={t("common.description", "Description")}
                      value={newTier.description}
                      onChange={(e) =>
                        setNewTier({ ...newTier, description: (e.target as any).value })
                      }
                    />

                    {/* Upload trailer/preview videos */}
                    <HStack gap={3} align="center" flexWrap="wrap">
                      <Box>
                        <Text fontSize="sm" mb={1}>
                          {t("admin.upload_trailer", "Upload Trailer (video)")}
                        </Text>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await onUpload(file);
                            setNewTier((prev) => ({ ...prev, trailerUrl: url }));
                          }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" mb={1}>
                          {t("admin.upload_preview", "Upload Preview (video)")}
                        </Text>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await onUpload(file);
                            setNewTier((prev) => ({ ...prev, previewUrl: url }));
                          }}
                        />
                      </Box>
                    </HStack>

                    {/* Staged Materials for new tier */}
                    <Box borderWidth="1px" borderRadius="md" p={3}>
                      <Heading size="sm" mb={2}>
                        {t("materials.staged_title", "Materials (staged)")}
                      </Heading>
                      <HStack gap={4} flexWrap="wrap" mb={3}>
                        <Box>
                          <Text fontSize="sm" mb={1}>
                            {t("materials.add_pdfs", "Add PDFs")}
                          </Text>
                          <Input
                            type="file"
                            accept="application/pdf"
                            multiple
                            onChange={(e: any) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (files.length) setNewPdfFiles(files);
                            }}
                          />
                          {newPdfFiles.length > 0 && (
                            <Text fontSize="xs" color="text.muted">
                              {t("materials.files_selected", {
                                defaultValue: "{{count}} file(s) selected",
                                count: newPdfFiles.length,
                              })}
                            </Text>
                          )}
                        </Box>
                        <Box>
                          <Text fontSize="sm" mb={1}>
                            {t("materials.add_videos", "Add Videos")}
                          </Text>
                          <Input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={(e: any) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (files.length) setNewVideoFiles(files);
                            }}
                          />
                          {newVideoFiles.length > 0 && (
                            <Text fontSize="xs" color="text.muted">
                              {t("materials.files_selected", {
                                defaultValue: "{{count}} file(s) selected",
                                count: newVideoFiles.length,
                              })}
                            </Text>
                          )}
                        </Box>
                      </HStack>
                      <Text fontSize="xs" color="text.muted">
                        {t(
                          "materials.staged_note",
                          "These will be uploaded and attached after you click Create."
                        )}
                      </Text>
                    </Box>

                    <Button mt={1} disabled={saving} onClick={createTier}>
                      <Icon as={Save} mr={2} /> {t("common.create", "Create")}
                    </Button>
                  </VStack>
                )}

                {/* List & edit existing tiers */}
                <VStack align="stretch" gap={4}>
                  {tiers.map((tier, idx) => (
                    <Box key={tier.id || idx} p={3} borderWidth="1px" borderRadius="md">
                      <VStack align="stretch" gap={2}>
                        <HStack gap={3} flexWrap="wrap">
                          <CInput
                            placeholder={t("common.name", "Name")}
                            value={tier.name}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) => (i === idx ? { ...t, name: e.target.value } : t))
                              )
                            }
                          />
                          <CSelect
                            value={tier.level}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, level: e.target.value as any } : t
                                )
                              )
                            }
                          >
                            <option value="BEGINNER">
                              {t("course.level.beginner", "BEGINNER")}
                            </option>
                            <option value="INTERMEDIATE">
                              {t("course.level.intermediate", "INTERMEDIATE")}
                            </option>
                            <option value="ADVANCED">
                              {t("course.level.advanced", "ADVANCED")}
                            </option>
                          </CSelect>
                          <CInput
                            placeholder={t("common.price_usdt", "USDT")}
                            value={tier.price_usdt}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, price_usdt: e.target.value } : t
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("common.price_stripe", "Stripe cents")}
                            value={tier.price_stripe}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, price_stripe: e.target.value } : t
                                )
                              )
                            }
                          />
                        </HStack>

                        {/* Instructor & Socials */}
                        <HStack gap={3} flexWrap="wrap">
                          <CInput
                            placeholder={t("instructor.name", "Instructor Name")}
                            value={tier.instructorName || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, instructorName: e.target.value } : t
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("instructor.avatar_url", "Instructor Avatar URL")}
                            value={tier.instructorAvatarUrl || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, instructorAvatarUrl: e.target.value } : t
                                )
                              )
                            }
                          />
                        </HStack>

                        <HStack gap={3} align="center" flexWrap="wrap">
                          <Box>
                            <Text fontSize="sm" mb={1}>
                              {t("instructor.upload_photo", "Upload Instructor Photo")}
                            </Text>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e: any) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await onUpload(file);
                                setTiers((prev) =>
                                  prev.map((t, i) =>
                                    i === idx ? { ...t, instructorAvatarUrl: url } : t
                                  )
                                );
                              }}
                            />
                          </Box>
                        </HStack>

                        <Textarea
                          placeholder={t("instructor.bio", "Instructor Bio")}
                          value={tier.instructorBio || ""}
                          onChange={(e) =>
                            setTiers((prev) =>
                              prev.map((t, i) =>
                                i === idx ? { ...t, instructorBio: (e.target as any).value } : t
                              )
                            )
                          }
                        />

                        <HStack gap={3} flexWrap="wrap">
                          <CInput
                            placeholder={t("social.telegram_embed", "Telegram embed URL")}
                            value={tier.telegramEmbedUrl || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, telegramEmbedUrl: e.target.value } : t
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("social.telegram_join", "Telegram join URL")}
                            value={tier.telegramUrl || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, telegramUrl: e.target.value } : t
                                )
                              )
                            }
                          />
                        </HStack>

                        <HStack gap={3} flexWrap="wrap">
                          <CInput
                            placeholder={t("social.discord_widget", "Discord widget ID")}
                            value={tier.discordWidgetId || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, discordWidgetId: e.target.value } : t
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("social.discord_invite", "Discord invite URL")}
                            value={tier.discordInviteUrl || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, discordInviteUrl: e.target.value } : t
                                )
                              )
                            }
                          />
                        </HStack>

                        <CInput
                          placeholder={t("social.twitter_timeline", "X/Twitter timeline URL")}
                          value={tier.twitterTimelineUrl || ""}
                          onChange={(e: any) =>
                            setTiers((prev) =>
                              prev.map((t, i) =>
                                i === idx ? { ...t, twitterTimelineUrl: e.target.value } : t
                              )
                            )
                          }
                        />

                        {/* Upload trailer/preview videos */}
                        <HStack gap={3} align="center" flexWrap="wrap">
                          <Box>
                            <Text fontSize="sm" mb={1}>
                              {t("admin.upload_trailer", "Upload Trailer (video)")}
                            </Text>
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={async (e: any) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await onUpload(file);
                                setTiers((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, trailerUrl: url } : t))
                                );
                              }}
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" mb={1}>
                              {t("admin.upload_preview", "Upload Preview (video)")}
                            </Text>
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={async (e: any) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await onUpload(file);
                                setTiers((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, previewUrl: url } : t))
                                );
                              }}
                            />
                          </Box>
                        </HStack>

                        <HStack gap={3} flexWrap="wrap">
                          <CInput
                            placeholder={t("admin.trailer_url", "Trailer URL")}
                            value={tier.trailerUrl || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, trailerUrl: e.target.value } : t
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("admin.preview_url", "Preview URL")}
                            value={tier.previewUrl || ""}
                            onChange={(e: any) =>
                              setTiers((prev) =>
                                prev.map((t, i) =>
                                  i === idx ? { ...t, previewUrl: e.target.value } : t
                                )
                              )
                            }
                          />
                        </HStack>

                        <Textarea
                          placeholder={t("common.description", "Description")}
                          value={tier.description}
                          onChange={(e) =>
                            setTiers((prev) =>
                              prev.map((t, i) =>
                                i === idx ? { ...t, description: (e.target as any).value } : t
                              )
                            )
                          }
                        />

                        {/* Materials for existing tier */}
                        <Box borderWidth="1px" borderRadius="md" p={3}>
                          <HStack justify="space-between" mb={2}>
                            <Heading size="sm">{t("materials.title", "Materials")}</Heading>
                            {tier.id && (
                              <Button size="xs" onClick={() => loadResources(tier.id!)}>
                                {t("materials.load", "Load Materials")}
                              </Button>
                            )}
                          </HStack>

                          <HStack gap={4} flexWrap="wrap" mb={3}>
                            <Box>
                              <Text fontSize="sm" mb={1}>
                                {t("materials.upload_pdf", "Upload PDF")}
                              </Text>
                              <Input
                                type="file"
                                accept="application/pdf"
                                onChange={async (e: any) => {
                                  const f = e.target.files?.[0];
                                  if (!f || !tier.id) return;
                                  await addResource(tier.id, f, "pdf");
                                }}
                              />
                            </Box>
                            <Box>
                              <Text fontSize="sm" mb={1}>
                                {t("materials.upload_video", "Upload Video")}
                              </Text>
                              <Input
                                type="file"
                                accept="video/*"
                                onChange={async (e: any) => {
                                  const f = e.target.files?.[0];
                                  if (!f || !tier.id) return;
                                  await addResource(tier.id, f, "video");
                                }}
                              />
                            </Box>
                          </HStack>

                          <VStack align="stretch" gap={2}>
                            {tier.id && resourcesByTier[tier.id] ? (
                              resourcesByTier[tier.id].map((r) => (
                                <HStack
                                  key={r.id}
                                  justify="space-between"
                                  borderWidth="1px"
                                  borderRadius="md"
                                  p={2}
                                >
                                  <HStack>
                                    <Badge>{String(r.type).toUpperCase()}</Badge>
                                    <Text fontSize="sm" maxW="400px">
                                      {r.url}
                                    </Text>
                                  </HStack>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    colorScheme="red"
                                    onClick={() => removeResource(r.id, tier.id!)}
                                  >
                                    {t("common.delete", "Delete")}
                                  </Button>
                                </HStack>
                              ))
                            ) : (
                              <Text fontSize="sm" color="text.muted">
                                {t(
                                  "materials.none",
                                  'No materials loaded. Click "Load Materials".'
                                )}
                              </Text>
                            )}
                          </VStack>
                        </Box>

                        <HStack>
                          <Button size="sm" disabled={saving} onClick={() => updateTierRow(tier)}>
                            <Icon as={Save} mr={2} /> {t("common.save", "Save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            disabled={saving}
                            onClick={() => deleteTierRow(tier.id)}
                          >
                            <Icon as={Trash2} mr={2} /> {t("common.delete", "Delete")}
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                  {!tiers.length && (
                    <Text fontSize="sm" color="text.muted">
                      {t("admin.no_tiers", "No tiers yet.")}
                    </Text>
                  )}
                </VStack>
              </GlassCard>
            </VStack>
          )}

          {activeTab === "banners" && (
            <VStack align="center" gap={8}>
              <GlassCard>
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">{t("admin.banners", "Banners")}</Heading>
                  <Button onClick={() => setShowNewBanner((v) => !v)}>
                    <Icon as={FilePlus2} mr={2} />
                    {showNewBanner
                      ? t("common.hide", "Hide")
                      : t("admin.create_banner", "Create New")}
                  </Button>
                </HStack>

                {showNewBanner && (
                  <VStack align="stretch" gap={3} mb={4}>
                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("common.title", "Title")}
                        value={newBanner.title}
                        onChange={(e: any) => setNewBanner({ ...newBanner, title: e.target.value })}
                      />
                      <CInput
                        placeholder={t("common.subtitle", "Subtitle")}
                        value={newBanner.subtitle}
                        onChange={(e: any) =>
                          setNewBanner({ ...newBanner, subtitle: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("common.badge", "Badge")}
                        value={newBanner.badge}
                        onChange={(e: any) => setNewBanner({ ...newBanner, badge: e.target.value })}
                      />
                      <CInput
                        placeholder={t("common.href", "Href (link)")}
                        value={newBanner.href}
                        onChange={(e: any) => setNewBanner({ ...newBanner, href: e.target.value })}
                      />
                    </HStack>

                    <HStack gap={3} align="center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e: any) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await onUpload(file);
                          setNewBanner((b) => ({ ...b, imageUrl: url }));
                        }}
                      />
                      {newBanner.imageUrl ? (
                        <HStack>
                          <Image
                            src={newBanner.imageUrl}
                            alt={t("common.preview", "preview")}
                            boxSize="56px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <Text
                            fontSize="xs"
                            maxW="240px"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {newBanner.imageUrl}
                          </Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="text.muted">
                          <Icon as={Upload} mr={2} />
                          {t("common.select_image", "Select image…")}
                        </Text>
                      )}
                    </HStack>

                    <Button mt={1} disabled={saving} onClick={createBanner}>
                      <Icon as={Save} mr={2} /> {t("common.create", "Create")}
                    </Button>
                  </VStack>
                )}

                {/* List & edit existing banners */}
                <VStack align="stretch" gap={4}>
                  {banners.map((b, idx) => (
                    <Box key={b.id || idx} p={3} borderWidth="1px" borderRadius="md">
                      <VStack align="stretch" gap={2}>
                        <HStack gap={3} flexWrap="wrap">
                          <CInput
                            placeholder={t("common.title", "Title")}
                            value={b.title || ""}
                            onChange={(e: any) =>
                              setBanners((prev) =>
                                prev.map((x, i) =>
                                  i === idx ? { ...x, title: e.target.value } : x
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("common.subtitle", "Subtitle")}
                            value={b.subtitle || ""}
                            onChange={(e: any) =>
                              setBanners((prev) =>
                                prev.map((x, i) =>
                                  i === idx ? { ...x, subtitle: e.target.value } : x
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("common.badge", "Badge")}
                            value={b.badge || ""}
                            onChange={(e: any) =>
                              setBanners((prev) =>
                                prev.map((x, i) =>
                                  i === idx ? { ...x, badge: e.target.value } : x
                                )
                              )
                            }
                          />
                          <CInput
                            placeholder={t("common.href", "Href")}
                            value={b.href || ""}
                            onChange={(e: any) =>
                              setBanners((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, href: e.target.value } : x))
                              )
                            }
                          />
                        </HStack>

                        <HStack gap={3} align="center">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await onUpload(file);
                              setBanners((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, imageUrl: url } : x))
                              );
                            }}
                          />
                          {b.imageUrl ? (
                            <HStack>
                              <Image
                                src={b.imageUrl}
                                alt={t("common.preview", "preview")}
                                boxSize="56px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                              <Text
                                fontSize="xs"
                                maxW="240px"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {b.imageUrl}
                              </Text>
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color="text.muted">
                              <Icon as={Upload} mr={2} />
                              {t("common.select_image", "Select image…")}
                            </Text>
                          )}
                        </HStack>

                        <HStack>
                          <Button
                            size="sm"
                            disabled={saving || !b.id}
                            onClick={() => updateBannerRow(b)}
                          >
                            <Icon as={Save} mr={2} /> {t("common.save", "Save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            disabled={saving || !b.id}
                            onClick={() => deleteBannerRow(b.id)}
                          >
                            <Icon as={Trash2} mr={2} /> {t("common.delete", "Delete")}
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                  {!banners.length && (
                    <Text fontSize="sm" color="text.muted">
                      {t("admin.no_banners", "No banners yet.")}
                    </Text>
                  )}
                </VStack>
              </GlassCard>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export default ContentAdminPanel;