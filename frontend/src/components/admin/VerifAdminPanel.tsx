import React from "react";
import { Box, Heading, Text, VStack, HStack, Button, Icon, Badge } from "@chakra-ui/react";
import { ShieldCheck, Check } from "lucide-react";
import defaultApi from "../../api/client";
import GlassCard from "../../components/GlassCard";
import { useTranslation } from "react-i18next";

type PurchaseStatus = "CONFIRMED" | "FAILED" | "PENDING";

export type VerificationsPanelProps = {
  /** Whether the current viewer is an admin (gate the panel). */
  isAdmin: boolean;
  /** Optional: inject a custom API client; defaults to ../../api/client */
  apiClient?: typeof defaultApi;
};

const VerificationsPanel: React.FC<VerificationsPanelProps> = ({
  isAdmin,
  apiClient = defaultApi,
}) => {
  const { t, i18n } = useTranslation() as any;

  const [users, setUsers] = React.useState<any[]>([]);
  const [businesses, setBusinesses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pendingPurchases, setPendingPurchases] = React.useState<any[]>([]);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [u, b, p] = await Promise.all([
        apiClient.get("/admin/users/pending"),
        apiClient.get("/admin/businesses/pending"),
        apiClient.get("/purchase/admin/pending"),
      ]);
      setUsers(u?.data?.data || []);
      setBusinesses(b?.data?.data || []);
      setPendingPurchases(p?.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  React.useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const verifyUser = async (id: string) => {
    await apiClient.post(`/admin/users/${id}/verify`);
    load();
  };

  const verifyBusiness = async (id: string) => {
    await apiClient.post(`/admin/businesses/${id}/verify`);
    load();
  };

  const setPurchaseStatus = async (id: string, status: PurchaseStatus) => {
    try {
      setUpdatingId(id);
      await apiClient.patch(`/purchase/admin/${id}/status`, { status });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (s: PurchaseStatus) =>
    s === "PENDING" ? "orange" : s === "CONFIRMED" ? "green" : "red";

  const statusLabel = (s: PurchaseStatus) =>
    ({
      PENDING: t("statuses.pending"),
      CONFIRMED: t("statuses.confirmed"),
      FAILED: t("statuses.failed"),
    }[s]);

  if (!isAdmin) {
    return (
      <Box py={6} color="text.primary">
        <Heading size="md" mb={2}>
          {t("forbidden.title")}
        </Heading>
        <Text>{t("forbidden.message")}</Text>
      </Box>
    );
  }

  return (
    <Box py={6} color="text.primary">
      <GlassCard>
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">{t("title")}</Heading>
          {/* Chakra uses `isLoading`; using it preserves the intended behavior */}
          <Button onClick={load} isLoading={loading}>
            <Icon as={ShieldCheck} style={{ marginInlineEnd: 8 }} /> {t("actions.refresh")}
          </Button>
        </HStack>

        <VStack align="stretch" gap={8}>
          {/* Pending Payments */}
          <Box>
            <Heading size="md" mb={3}>
              {t("sections.pending_payments")}
            </Heading>
            <VStack align="stretch" gap={2}>
              {pendingPurchases.map((p) => (
                <Box
                  key={p.id}
                  border="1px solid"
                  borderColor={statusColor(p.status as PurchaseStatus)}
                  borderRadius="md"
                  p={3}
                >
                  <HStack justify="space-between" align="start">
                    <Box>
                      <HStack gap={3}>
                        <Badge colorScheme={statusColor(p.status as PurchaseStatus) as any}>
                          {statusLabel(p.status as PurchaseStatus)}
                        </Badge>
                        <Text fontWeight={600}>
                          {t("labels.purchase_short_id", { id: `#${String(p.id).slice(0, 8)}` })}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" mt={1}>
                        {t("labels.user_line", {
                          name: p.user?.name || p.userId,
                          email: p.user?.email || t("labels.na"),
                        })}
                      </Text>
                      <Text fontSize="sm">
                        {t("labels.course_line", {
                          course: p.tier?.name || p.tierId,
                        })}
                      </Text>
                      {p.txnHash && (
                        <Text fontSize="sm">{t("labels.proof_line", { hash: p.txnHash })}</Text>
                      )}
                      <Text fontSize="xs" color="text.muted">
                        {t("labels.created_at", {
                          date: new Date(p.createdAt).toLocaleString(i18n.language),
                        })}
                      </Text>
                    </Box>
                    <HStack gap={2}>
                      <Button
                        size="xs"
                        bg="green"
                        color="white"
                        onClick={() => setPurchaseStatus(p.id, "CONFIRMED")}
                        isLoading={updatingId === p.id}
                      >
                        {t("actions.confirm")}
                      </Button>
                      <Button
                        size="xs"
                        variant="solid"
                        color="red"
                        onClick={() => setPurchaseStatus(p.id, "FAILED")}
                        isLoading={updatingId === p.id}
                      >
                        {t("actions.fail")}
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
              {pendingPurchases.length === 0 && (
                <Text>{t("empty_states.no_pending_payments")}</Text>
              )}
            </VStack>
          </Box>

          {/* Pending Users */}
          <Box>
            <Heading size="md" mb={3}>
              {t("sections.pending_users")}
            </Heading>
            <VStack align="stretch" gap={2}>
              {users.map((u) => (
                <HStack
                  key={u.id}
                  justify="space-between"
                  border="1px solid"
                  borderColor="border.default"
                  borderRadius="md"
                  p={3}
                  bg="bg.surface"
                >
                  <Box>
                    <Text fontWeight={600}>{u.name}</Text>
                    <Text fontSize="sm">{u.email}</Text>
                  </Box>
                  <HStack gap={3}>
                    <Badge colorScheme="orange">{t("statuses.pending")}</Badge>
                    <Button size="xs" onClick={() => verifyUser(u.id)}>
                      <Icon as={Check} style={{ marginInlineEnd: 8 }} /> {t("actions.verify")}
                    </Button>
                  </HStack>
                </HStack>
              ))}
              {users.length === 0 && <Text>{t("empty_states.no_pending_users")}</Text>}
            </VStack>
          </Box>

          {/* Pending Businesses */}
          <Box>
            <Heading size="md" mb={3}>
              {t("sections.pending_businesses")}
            </Heading>
            <VStack align="stretch" gap={2}>
              {businesses.map((b) => (
                <HStack
                  key={b.id}
                  justify="space-between"
                  border="1px solid"
                  borderColor="border.default"
                  borderRadius="md"
                  p={3}
                  bg="bg.surface"
                >
                  <Box>
                    <Text fontWeight={600}>{b.name}</Text>
                    <Text fontSize="sm">{t("labels.owner_line", { owner: b.owner_id })}</Text>
                  </Box>
                  <HStack gap={3}>
                    <Badge colorScheme={b.verified ? "green" : "orange"}>
                      {b.verified ? t("labels.yes") : t("labels.no")}
                    </Badge>
                    {!b.verified && (
                      <Button size="xs" onClick={() => verifyBusiness(b.id)}>
                        <Icon as={Check} style={{ marginInlineEnd: 8 }} /> {t("actions.verify")}
                      </Button>
                    )}
                  </HStack>
                </HStack>
              ))}
              {businesses.length === 0 && <Text>{t("empty_states.no_pending_businesses")}</Text>}
            </VStack>
          </Box>
        </VStack>
      </GlassCard>
    </Box>
  );
};

export default VerificationsPanel;