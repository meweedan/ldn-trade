/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  Badge,
  VStack,
  chakra,
  Link,
} from "@chakra-ui/react";
import { Wrap, WrapItem, useBreakpointValue, Grid } from "@chakra-ui/react";
import { Download, Eye, EyeOff, RefreshCcw, Mail, PhoneCall, MessageSquare, AlertTriangle, ShieldAlert } from "lucide-react";
import api from "../../api/client";
import { useTranslation } from "react-i18next";

export type CommItem = {
  id: string;
  name: string;
  email: string;
  message: string;
  courseId?: string;
  courseName?: string;
  locale?: string;
  url?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  createdAt: string;
  read: boolean;
  // Ticket meta
  status?: "open" | "closed" | "escalated";
  priority?: "low" | "medium" | "high" | "critical";
  assignedAdminId?: string;
  assignee?: string; // display only (optional)
  ticketShort?: string;
};

const brand = "#b7a27d";

const priorityColor: Record<NonNullable<CommItem["priority"]>, string> = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

const statusColor: Record<NonNullable<CommItem["status"]>, string> = {
  open: "yellow",
  closed: "green",
  escalated: "purple",
};

const CommunicationsAdminPanel: React.FC = () => {
  const [items, setItems] = React.useState<CommItem[]>([]);
  const { t } = useTranslation() as unknown as { t: (key: string, options?: any) => string };
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [notif, setNotif] = React.useState<string | null>(null);
  const compact = useBreakpointValue({ base: true, sm: false });
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [editingAssigneeFor, setEditingAssigneeFor] = React.useState<string | null>(null);
  const [assigneeDraft, setAssigneeDraft] = React.useState<string>(""); // legacy email fallback (unused in dropdown)
  type AdminUser = { id: string; name: string; email: string };
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [assigneeIdDraft, setAssigneeIdDraft] = React.useState<string>("");

  const getAdminLabel = React.useCallback(
    (id?: string) => {
      if (!id) return undefined;
      const a = admins.find((x) => x.id === id);
      if (!a) return undefined;
      return a.name ? `${a.name} (${a.email})` : a.email;
    },
    [admins]
  );

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    setNotif(null);
    try {
      const res = await api.get("/admin/communications", {
        params: { q: q || undefined, unread: onlyUnread || undefined },
      });
      const raw = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const normalized: CommItem[] = raw.map((it: CommItem) => ({
        status: "open",
        priority: "medium",
        ...it,
      }));
      setItems(normalized);
    } catch (e: any) {
      setErr("Failed to load communications");
    } finally {
      setLoading(false);
    }
  }, [q, onlyUnread]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Load admins for assignment dropdown
  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/admins");
        const list = res?.data?.data || [];
        setAdmins(Array.isArray(list) ? list : []);
      } catch {
        setAdmins([]);
      }
    })();
  }, []);

  const patchItem = async (id: string, patch: Partial<CommItem>, successMsg?: string) => {
    try {
      setSaving((s) => ({ ...s, [id]: true }));
      setNotif(null);
      // optimistic update
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      await api.patch(`/admin/communications/${encodeURIComponent(id)}`, patch);
      if (successMsg) setNotif(successMsg);
    } catch (e) {
      setErr("Failed to update");
      fetchItems();
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  const toggleRead = async (id: string, next: boolean) => {
    await patchItem(
      id,
      { read: next },
      next
        ? t('admin.comm.status_read', { defaultValue: 'Marked as read' })
        : t('admin.comm.status_open', { defaultValue: 'Marked as unread' })
    );
  };

  const setPriority = async (id: string, priority: NonNullable<CommItem["priority"]>) => {
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/priority`, {
      // map frontend strings to backend enum
      priority: priority.toUpperCase(), // LOW | MEDIUM | HIGH | CRITICAL
    });
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, priority } : it)));
  };

  const openAssign = (id: string, _current: string | undefined) => {
    setEditingAssigneeFor(id);
    // initialize with existing assignedAdminId if present on item
    const currentItem = items.find((x) => x.id === id);
    setAssigneeIdDraft(currentItem?.assignedAdminId || "");
  };

  const saveAssign = async () => {
    if (!editingAssigneeFor) return;
    const id = editingAssigneeFor;
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/assign`, {
      assignedAdminId: assigneeIdDraft || undefined,
    });
    const label = getAdminLabel(assigneeIdDraft) || "";
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, assignedAdminId: assigneeIdDraft, assignee: label } : it)));
    setEditingAssigneeFor(null);
    setAssigneeDraft("");
    setAssigneeIdDraft("");
  };

  const cancelAssign = () => {
    setEditingAssigneeFor(null);
    setAssigneeDraft("");
    setAssigneeIdDraft("");
  };

  const closeTicket = async (id: string) => {
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/close`);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "closed", read: true } : it))
    );
  };

  const escalateTicket = async (id: string) => {
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/escalate`);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "escalated", priority: "critical" } : it))
    );
  };

  const handleAssigneeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setAssigneeIdDraft(e.target.value);
  };

  const exportCsv = () => {
    const header = [
      "id",
      "name",
      "email",
      "message",
      "courseId",
      "courseName",
      "locale",
      "url",
      "utm.source",
      "utm.medium",
      "utm.campaign",
      "createdAt",
      "read",
      "status",
      "priority",
      "assignee",
      "ticketShort",
    ].join(",");
    const rows = items.map((it) =>
      [
        it.id,
        JSON.stringify(it.name || ""),
        JSON.stringify(it.email || ""),
        JSON.stringify(it.message || ""),
        JSON.stringify(it.courseId || ""),
        JSON.stringify(it.courseName || ""),
        JSON.stringify(it.locale || ""),
        JSON.stringify(it.url || ""),
        JSON.stringify(it.utm?.source || ""),
        JSON.stringify(it.utm?.medium || ""),
        JSON.stringify(it.utm?.campaign || ""),
        it.createdAt,
        String(!!it.read),
        it.status || "open",
        it.priority || "medium",
        JSON.stringify(it.assignee || ""),
        JSON.stringify((it as any).ticketShort || it.id || ""),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `communications_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
        <HStack gap={2}>
          <Input
            placeholder={t("admin.comm.search_ph", {
              defaultValue: "Search name, email, message…",
            })}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button
            onClick={() => setOnlyUnread((v) => !v)}
            variant="solid"
            bg="#b7a27d"
            borderColor={brand}
          >
            {onlyUnread ? (
              <>
                <Icon as={EyeOff} />
              </>
            ) : (
              <>
                <Icon as={Eye} />
              </>
            )}
          </Button>
          <Button onClick={fetchItems} variant="solid" bg="#b7a27d" isLoading={loading}>
            <Icon as={RefreshCcw} />
            {t("common.refresh")}
          </Button>
        </HStack>
        <Button onClick={exportCsv}>
          <Icon as={Download} />
          {t("common.export_csv")}
        </Button>
      </HStack>

      {err && (
        <Box mb={3}>
          <Text color="red.500">{err}</Text>
        </Box>
      )}
      {notif && (
        <Box mb={3}>
          <Text color="green.500">{notif}</Text>
        </Box>
      )}

      {loading ? (
        <HStack>
          <Spinner size="sm" />
          <Text>Loading…</Text>
        </HStack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          {items.map((it) => (
            <Box
              key={it.id}
              borderWidth={1}
              borderColor={it.read ? "gray.700" : brand}
              borderRadius="lg"
              p={3}
              bg={it.read ? "transparent" : "rgba(183,162,125,0.06)"}
              opacity={saving[it.id] ? 0.7 : 1}
            >
              <HStack justify="space-between" align="start" mb={2}>
                <HStack gap={2} flexWrap="wrap">
                  <Text fontWeight="bold">{it.name}</Text>
                  <Badge>{it.locale || "—"}</Badge>
                  {!it.read && <Badge colorScheme="yellow">NEW</Badge>}
                  {it.status && (
                    <Badge colorScheme={statusColor[it.status] || "gray"}>
                      {it.status.toUpperCase()}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs">{new Date(it.createdAt).toLocaleString()}</Text>
              </HStack>

              <VStack align="start" gap={2}>
                <HStack>
                  <Icon as={Mail} />
                  <Link href={`mailto:${it.email}`}>{it.email}</Link>
                </HStack>

                <Box>
                  <Text fontSize="sm" color="text.muted">
                    {t("common.course")}
                  </Text>
                  <Text>
                    {it.courseName || "—"}
                    {it.courseId ? (
                      <Text as="span" opacity={0.7} fontSize="xs">
                        {" "}
                        ({it.courseId})
                      </Text>
                    ) : null}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="text.muted" mb={1}>
                    {t("common.message")}
                  </Text>
                  <Text
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {it.message}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="text.muted" mb={1}>
                    {t("common.meta")}
                  </Text>
                  <VStack align="start" gap={1}>
                    {it.url && (
                      <Link href={it.url} target="_blank" rel="noreferrer">
                        {t("common.page")}
                      </Link>
                    )}
                    {(it.utm?.source || it.utm?.medium || it.utm?.campaign) && (
                      <Text fontSize="xs" opacity={0.8}>
                        utm: {it.utm?.source || "—"}/{it.utm?.medium || "—"}/
                        {it.utm?.campaign || "—"}
                      </Text>
                    )}
                  </VStack>
                </Box>

                {/* Ticket meta + actions */}
                {/* Ticket meta + actions */}
                <Box pt={1} w="100%">
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr auto" }}
                    gap={2}
                    alignItems="center"
                    w="100%"
                  >
                    {/* LEFT CLUSTER */}
                    <HStack
                      gap={2}
                      align="center"
                      flexWrap="wrap"
                      minW={0} // allow shrinking
                      overflow="hidden" // keep inside card
                      style={{ wordBreak: "break-word" }}
                    >
                      <Badge variant="outline" borderColor={brand}>
                        {t("admin.comm.ticket_id", { defaultValue: "Ticket" })}:{" "}
                        {it.ticketShort || (it as any).ticketId || it.id}
                      </Badge>

                      {/* Priority buttons — use Wrap so they line-break gracefully */}
                      <Wrap gap="6px">
                        {(["low", "medium", "high", "critical"] as const).map((p) => (
                          <WrapItem key={p}>
                            <Button
                              size="xs"
                              px={2}
                              variant={it.priority === p ? "solid" : "outline"}
                              onClick={() => setPriority(it.id, p)}
                              whiteSpace="nowrap"
                            >
                              <Badge colorScheme={priorityColor[p]}>{p.toUpperCase()}</Badge>
                            </Button>
                          </WrapItem>
                        ))}
                      </Wrap>

                      {/* Assignee inline editor */}
                      {editingAssigneeFor === it.id ? (
                        <HStack>
                          <chakra.select
                            value={assigneeIdDraft}
                            onChange={handleAssigneeChange}
                            maxW="240px"
                            borderWidth="1px"
                            borderColor="gray.600"
                            borderRadius="md"
                            px={3}
                            py={1.5}
                            bg="transparent"
                            aria-label={t("admin.comm.assignee_ph", {
                              defaultValue: "Select admin",
                            })}
                          >
                            <option value="">
                              {t("admin.comm.assignee_ph", { defaultValue: "Select admin" })}
                            </option>
                            {admins.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name ? `${a.name} (${a.email})` : a.email}
                              </option>
                            ))}
                          </chakra.select>

                          <Button size="xs" onClick={saveAssign} isLoading={!!saving[it.id]}>
                            {t("admin.comm.assign_btn", { defaultValue: "Assign" })}
                          </Button>
                          <Button size="xs" variant="outline" onClick={cancelAssign}>
                            {t("common.cancel", { defaultValue: "Cancel" })}
                          </Button>
                        </HStack>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openAssign(it.id, it.assignee)}
                          whiteSpace="nowrap"
                        >
                          {it.assignedAdminId
                            ? `${t("admin.comm.assignee", { defaultValue: "Assignee" })}: ${
                                getAdminLabel(it.assignedAdminId) || "—"
                              }`
                            : t("admin.comm.assign", { defaultValue: "Assign…" })}
                        </Button>
                      )}
                    </HStack>

                    {/* RIGHT CLUSTER (always stays inside; drops below on small widths) */}
                    <Wrap gap="8px" justify="flex-end" maxW="100%">
                      <WrapItem>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => escalateTicket(it.id)}
                          title={t("admin.comm.escalate", { defaultValue: "Escalate" })}
                          whiteSpace="nowrap"
                        >
                          <Icon as={ShieldAlert} style={{ marginRight: compact ? 0 : 6 }} />
                          {!compact && t("admin.comm.escalate", { defaultValue: "Escalate" })}
                        </Button>
                      </WrapItem>
                      <WrapItem>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => closeTicket(it.id)}
                          title={t("admin.comm.close", { defaultValue: "Close" })}
                          whiteSpace="nowrap"
                        >
                          <Icon as={AlertTriangle} style={{ marginRight: compact ? 0 : 6 }} />
                          {!compact && t("admin.comm.close", { defaultValue: "Close" })}
                        </Button>
                      </WrapItem>
                    </Wrap>
                  </Grid>

                  <Box my={2} h="1px" bg="gray.700" />
                  <HStack gap={3} align="center">
                    <Badge colorScheme={it.read ? "green" : "yellow"}>
                      {it.read
                        ? t("admin.comm.status_read", { defaultValue: "READ" })
                        : t("admin.comm.status_open", { defaultValue: "OPEN" })}
                    </Badge>
                    {it.status && (
                      <Badge colorScheme={statusColor[it.status] || "gray"}>
                        {(it.status || "open").toUpperCase()}
                      </Badge>
                    )}
                    {(it.assignedAdminId || it.assignee) && (
                      <Badge variant="subtle" colorScheme="cyan">
                        {t("admin.comm.assignee", { defaultValue: "Assignee" })}:{" "}
                        {getAdminLabel(it.assignedAdminId) || it.assignee || "—"}
                      </Badge>
                    )}
                  </HStack>
                </Box>

                <HStack gap={2} pt={2}>
                  <Button
                    variant="solid"
                    bg="#b7a27d"
                    onClick={() => toggleRead(it.id, !it.read)}
                    isLoading={!!saving[it.id]}
                  >
                    <Icon as={it.read ? EyeOff : Eye} style={{ marginRight: 6 }} />
                    {it.read
                      ? t("admin.comm.mark_unread", { defaultValue: "Mark unread" })
                      : t("admin.comm.mark_read", { defaultValue: "Mark read" })}
                  </Button>
                  <Button
                    variant="solid"
                    bg="#b7a27d"
                    onClick={() => window.open(`mailto:${it.email}`, "_blank", "noreferrer")}
                    title="Email"
                  >
                    <Icon as={MessageSquare} style={{ marginRight: 6 }} />
                    {t("common.reply")}
                  </Button>
                  <Button
                    variant="solid"
                    bg="#b7a27d"
                    onClick={() => window.open(`https://wa.me/`, "_blank", "noreferrer")}
                    title="WhatsApp"
                  >
                    <Icon as={PhoneCall} style={{ marginRight: 6 }} />
                    {t("common.whatsapp")}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {!loading && !items.length && <Text color="text.muted">{t("common.noMessages")}</Text>}
    </Box>
  );
};

export default CommunicationsAdminPanel;
