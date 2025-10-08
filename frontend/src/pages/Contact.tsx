import React from "react";
import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import { MessageSquare, Send, PhoneCall } from "lucide-react";
import { chakra } from "@chakra-ui/system";

type CourseTier = { id: string; name: string };

type MyTicket = {
  id: string;
  ticketId: string; // backend field
  status: "OPEN" | "READ" | "ESCALATED" | "RESOLVED";
  read: boolean;
  createdAt: string;
  courseId?: string | null;
  courseName?: string | null;
  preview: string;
};

const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "";
const telegramHandle = process.env.REACT_APP_TELEGRAM_HANDLE || "";

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const loc = useLocation();
  const params = React.useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const brand = "#b7a27d";
  const CSelect = chakra("select"); 

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [courseId, setCourseId] = React.useState<string>("");
  const [courses, setCourses] = React.useState<CourseTier[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Removed inline post-submit ticket ID tracker; rely on history section
  const [ticketId, setTicketId] = React.useState<string | null>(null);
  const [me, setMe] = React.useState<any>(null);
  const [myTickets, setMyTickets] = React.useState<MyTicket[]>([]);
  const [myTicketsLoading, setMyTicketsLoading] = React.useState(false);
  const [myTicketsErr, setMyTicketsErr] = React.useState<string | null>(null);

  // Track ticket UI state
  const [trackOpen, setTrackOpen] = React.useState(false);
  const [trackId, setTrackId] = React.useState("");
  const [trackLoading, setTrackLoading] = React.useState(false);
  const [trackError, setTrackError] = React.useState<string | null>(null);
  const [trackResult, setTrackResult] = React.useState<any | null>(null);

  React.useEffect(() => {
    const preselect = params.get("courseId") || "";
    if (preselect) setCourseId(preselect);
  }, [params]);

  React.useEffect(() => {
    (async () => {
      try {
        const resp = await api.get("/courses");
        const tiers: any[] = Array.isArray(resp.data) ? resp.data : resp.data?.items || [];
        setCourses(
          tiers.map((t: any) => ({
            id: String(t.id),
            name: String(
              t.name || t.title || t("contact.course_fallback", { defaultValue: "Course" }) // i18n fallback
            ),
          }))
        );
      } catch {
        // ignore
      }
    })();
  }, [t]);

  // Prefill from logged-in user
  React.useEffect(() => {
    (async () => {
      try {
        const meResp = await api.get("/users/me");
        const u = meResp.data || {};
        setMe(u);
        if (u?.name && !name) setName(String(u.name));
        if (u?.email && !email) setEmail(String(u.email));
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!me?.email) return;
      setMyTicketsLoading(true);
      setMyTicketsErr(null);
      try {
        const resp = await api.get("/communications/my");
        const items = Array.isArray(resp?.data?.items) ? resp.data.items : [];
        setMyTickets(items);
      } catch (e: any) {
        setMyTicketsErr(
          e?.response?.data?.message ||
            t("contact.my_tickets_error", { defaultValue: "Failed to load your tickets." })
        );
      } finally {
        setMyTicketsLoading(false);
      }
    })();
  }, [me, t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);
    setTicketId(null);

    // basic validation
    if (!name || !email || !message) {
      setError(
        t("contact.validation_required", { defaultValue: "Please fill all required fields." })
      );
      return;
    }

    try {
      setIsLoading(true);
      const selected = courses.find((c) => c.id === courseId);

      // Optional context
      const url = window.location.href;
      const utm = {
        source: params.get("utm_source") || undefined,
        medium: params.get("utm_medium") || undefined,
        campaign: params.get("utm_campaign") || undefined,
      };

      // Send to your inbox table for the admin panel
      const resp = await api.post("/communications", {
        name,
        email,
        message,
        courseId: courseId || undefined,
        courseName: selected?.name,
        locale: i18n?.language || "en",
        url,
        utm,
      });
      const created = resp?.data || {};
      const id = created?.ticketShort || created?.id || created?.ticketId || created?.ticket || null;
      if (id) setTicketId(String(id));

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      setCourseId("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("contact.error_send", { defaultValue: "Failed to send message" });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const waLink = React.useMemo(() => {
    const base = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`
      : "https://wa.me/";
    const text = encodeURIComponent(
      `${t("contact.default_text", {
        defaultValue: "Hello, I would like to know more about your courses.",
      })}${
        courseId ? ` (${t("contact.course_id", { defaultValue: "Course ID" })}: ${courseId})` : ""
      }`
    );
    return `${base}?text=${text}`;
  }, [courseId, t]);

  const tgLink = React.useMemo(() => {
    return telegramHandle ? `https://t.me/${telegramHandle}` : "https://t.me/";
  }, []);

  const trackTicket = async (forcedId?: string) => {
    setTrackError(null);
    setTrackResult(null);
    const id = (forcedId ?? trackId ?? "").trim();
    if (!id) {
      setTrackError(
        t("contact.ticket_required", { defaultValue: "Please enter a ticket ID." })
      );
      return;
    }
    try {
      setTrackLoading(true);
      const resp = await api.get(`/communications/track/${encodeURIComponent(id)}`);
      setTrackResult(resp.data);
      setTrackId(id);
    } catch (err: any) {
      setTrackError(
        err?.response?.data?.message ||
          t("contact.ticket_not_found", { defaultValue: "Ticket not found." })
      );
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <Box color="text.primary">
      <Container>
        <VStack align="stretch" gap={6}>
          <Box
            as="form"
            onSubmit={submit}
            borderWidth={1}
            borderColor={brand}
            borderRadius="lg"
            mt={8}
            p={4}
          >
            <VStack align="stretch" gap={4}>
              <Box>
                <Text mb={1}>{t("contact.name", { defaultValue: "Your Name" })}</Text>
                <Input
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder={t("contact.name_ph", { defaultValue: "John Doe" })}
                  borderColor={brand}
                  _hover={{ borderColor: brand }}
                  _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                />
              </Box>

              {/* Removed inline ticket tracker; use history list below for tracking & copying */}

              <Box>
                <Text mb={1}>{t("contact.email", { defaultValue: "Email" })}</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder={t("contact.email_ph", { defaultValue: "you@example.com" })}
                  borderColor={brand}
                  _hover={{ borderColor: brand }}
                  _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                />
              </Box>

              <Box>
                <Text mb={1}>{t("contact.course", { defaultValue: "Course (optional)" })}</Text>
                <CSelect
                  value={courseId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCourseId(e.target.value)
                  }
                  style={{ padding: "10px", borderRadius: 8 }}
                  borderColor={brand}
                  _hover={{ borderColor: brand }}
                  _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                  bg="transparent"
                >
                  <option value="">
                    {t("contact.course_ph", { defaultValue: "Select a course" })}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </CSelect>
              </Box>

              <Box>
                <Text mb={1}>{t("contact.message", { defaultValue: "Message" })}</Text>
                <Textarea
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMessage(e.target.value)
                  }
                  rows={6}
                  placeholder={t("contact.message_ph", {
                    defaultValue: "Tell us more about what you need...",
                  })}
                  borderColor={brand}
                  _hover={{ borderColor: brand }}
                  _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                />
              </Box>

              {error && <Text color="red.500">{error}</Text>}
              {sent && (
                <VStack align="start" gap={2}>
                  <Text color="green.500">
                    {t("contact.sent", {
                      defaultValue: "Your message has been sent. We will get back to you soon.",
                    })}
                  </Text>
                </VStack>
              )}

              {me?.email && (
                <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={4}>
                  <HStack justify="space-between" align="center" mb={3}>
                    <Heading size="sm">
                      {t("contact.my_tickets_title", { defaultValue: "Your Tickets" })}
                    </Heading>
                    <Text fontSize="xs" color="text.muted">
                      {t("contact.my_tickets_hint", {
                        defaultValue: "Showing up to the last 50 tickets",
                      })}
                    </Text>
                  </HStack>

                  {myTicketsLoading && (
                    <Text>{t("common.loading", { defaultValue: "Loading…" })}</Text>
                  )}
                  {myTicketsErr && <Text color="red.500">{myTicketsErr}</Text>}

                  {!myTicketsLoading && !myTicketsErr && (
                    <>
                      {myTickets.length === 0 ? (
                        <Text color="text.muted">
                          {t("contact.my_tickets_empty", {
                            defaultValue: "You don't have any tickets yet.",
                          })}
                        </Text>
                      ) : (
                        <VStack align="stretch" gap={2}>
                          {myTickets.map((tk) => (
                            <HStack
                              key={tk.id}
                              p={3}
                              borderWidth={1}
                              borderColor={brand}
                              borderRadius="md"
                              justify="space-between"
                              flexWrap="wrap"
                              gap={2}
                            >
                              <VStack align="start" gap={0}>
                                <Text fontWeight="semibold">
                                  {t("contact.ticket_id", { defaultValue: "Ticket ID" })}:{" "}
                                  {tk.ticketId}
                                </Text>
                                <Text fontSize="xs" opacity={0.8}>
                                  {new Date(tk.createdAt).toLocaleString()}
                                  {tk.courseName ? ` • ${tk.courseName}` : ""}
                                </Text>
                                <Text fontSize="sm" noOfLines={2}>
                                  {tk.preview}
                                </Text>
                              </VStack>

                              <HStack gap={2}>
                                <Box
                                  as="span"
                                  px={2}
                                  py={1}
                                  borderWidth={1}
                                  borderColor={brand}
                                  borderRadius="md"
                                  fontSize="xs"
                                >
                                  {tk.status}
                                </Box>
                                <Button
                                  size="sm"
                                  bg={brand}
                                  color="black"
                                  _hover={{ opacity: 0.9 }}
                                  onClick={async () => {
                                    setTrackOpen(true);
                                    await trackTicket(tk.ticketId);
                                  }}
                                >
                                  {t("contact.track_this", { defaultValue: "Track" })}
                                </Button>
                                <Button
                                  size="sm"
                                  bg={brand}
                                  color="black"
                                  _hover={{ opacity: 0.9 }}
                                  onClick={() => navigator.clipboard.writeText(tk.ticketId)}
                                >
                                  {t("contact.copy_this", { defaultValue: "Copy" })}
                                </Button>
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </>
                  )}
                </Box>
              )}

              {/* Domino's-style tracker panel */}
              {trackOpen && (
                <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={4}>
                  <HStack justify="space-between" align="center" mb={3}>
                    <Heading size="sm">
                      {t("contact.track_title", { defaultValue: "Track Ticket" })}
                    </Heading>
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        bg={brand}
                        color="black"
                        _hover={{ opacity: 0.9 }}
                        onClick={() => navigator.clipboard.writeText(trackId)}
                      >
                        {t("contact.copy_this", { defaultValue: "Copy" })}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setTrackOpen(false); setTrackResult(null); setTrackError(null); }}>
                        {t("common.close", { defaultValue: "Close" })}
                      </Button>
                    </HStack>
                  </HStack>

                  <Text fontSize="sm" color="text.muted" mb={2}>
                    {t("contact.ticket_id", { defaultValue: "Ticket ID" })}: {trackId}
                  </Text>

                  {trackError && <Text color="red.500">{trackError}</Text>}
                  {!trackError && !trackResult && (
                    <Text>{t("common.loading", { defaultValue: "Loading…" })}</Text>
                  )}

                  {trackResult && (
                    <VStack align="stretch" gap={3}>
                      {/* Progress steps */}
                      {(() => {
                        const status = String(trackResult.status || '').toUpperCase();
                        const steps = [
                          { key: 'OPEN', label: t('contact.stage_received', { defaultValue: 'Received' }) },
                          { key: 'READ', label: t('contact.stage_read', { defaultValue: 'Read' }) },
                          { key: 'ESCALATED', label: t('contact.stage_escalated', { defaultValue: 'Escalated' }) },
                          { key: 'RESOLVED', label: t('contact.stage_resolved', { defaultValue: 'Resolved' }) },
                        ];
                        const activeIndex = Math.max(0, steps.findIndex(s => s.key === status));
                        const isDone = (idx: number) => idx <= activeIndex;
                        return (
                          <HStack gap={2} align="center">
                            {steps.map((s, idx) => (
                              <HStack key={s.key} gap={2} align="center">
                                <Box
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  bg={isDone(idx) ? brand : 'transparent'}
                                  borderWidth={1}
                                  borderColor={brand}
                                  color={isDone(idx) ? 'black' : 'inherit'}
                                  minW="96px"
                                  textAlign="center"
                                  fontSize="sm"
                                >
                                  {s.label}
                                </Box>
                                {idx < steps.length - 1 && (
                                  <Box flexShrink={0} w="24px" h="2px" bg={isDone(idx) ? brand : 'gray.600'} borderRadius="full" />
                                )}
                              </HStack>
                            ))}
                          </HStack>
                        );
                      })()}

                      {/* Details */}
                      <VStack align="start" gap={1}>
                        <Text>
                          <strong>{t('contact.status', { defaultValue: 'Status' })}:</strong> {trackResult.status}
                        </Text>
                        <Text>
                          <strong>{t('contact.created', { defaultValue: 'Created' })}:</strong> {new Date(trackResult.createdAt).toLocaleString()}
                        </Text>
                        {trackResult.courseName && (
                          <Text>
                            <strong>{t('contact.course', { defaultValue: 'Course' })}:</strong> {trackResult.courseName}
                          </Text>
                        )}
                        {trackResult.preview && (
                          <Text>
                            <strong>{t('contact.preview', { defaultValue: 'Message Preview' })}:</strong> {trackResult.preview}
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  )}
                </Box>
              )}

              <HStack>
                <Button
                  type="submit"
                  bg={brand}
                  color="black"
                  _hover={{ opacity: 0.9 }}
                  isLoading={isLoading}
                >
                  <Icon as={Send} style={{ marginRight: 8 }} />
                  {t("contact.send", { defaultValue: "Send Message" })}
                </Button>
              </HStack>
            </VStack>
          </Box>

          <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={4}>
            <Heading size="sm" mb={3}>
              {t("contact.alt", { defaultValue: "Prefer WhatsApp or Telegram?" })}
            </Heading>
            <HStack gap={3}>
              <Button
                onClick={() => window.open(waLink, "_blank", "noreferrer")}
                variant="outline"
                borderColor="#25D366"
                color="#25D366"
              >
                <Icon as={PhoneCall} style={{ marginRight: 8 }} />
                {t("contact.whatsapp", { defaultValue: "WhatsApp" })}
              </Button>
              <Button
                onClick={() => window.open(tgLink, "_blank", "noreferrer")}
                variant="outline"
                borderColor="#229ED9"
                color="#229ED9"
              >
                <Icon as={MessageSquare} style={{ marginRight: 8 }} />
                {t("contact.telegram", { defaultValue: "Telegram" })}
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Contact;
