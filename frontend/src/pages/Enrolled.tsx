import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Badge, Button, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyPurchases } from '../api/client';
import ProgressWidget from '../components/ProgressWidget';

const Enrolled: React.FC = () => {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vipInfo, setVipInfo] = useState<{ active: boolean; endIso: string | null }>({ active: false, endIso: null });
  const tgHandle = (process.env.REACT_APP_TELEGRAM_HANDLE as string) || '';
  const tgLink = tgHandle ? `https://t.me/${tgHandle}` : 'https://t.me/';

  useEffect(() => {
    (async () => {
      try {
        const list = await getMyPurchases({ ttlMs: 10 * 60 * 1000 });
        const arr = Array.isArray(list) ? list : [];
        setEnrollments(arr);
        try {
          const vipActive = arr.some((p: any) => String(p.status || '').toUpperCase() === 'CONFIRMED' && p?.tier?.isVipProduct);
          const raw = localStorage.getItem('vipSubscription');
          let endIso: string | null = null;
          if (raw) {
            const parsed = JSON.parse(raw);
            endIso = parsed?.endIso || null;
          }
          setVipInfo({ active: vipActive || !!endIso, endIso });
        } catch {}
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load enrollments');
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box p={6} display="flex" alignItems="center" gap={3}>
        <Spinner />
        <Text>{t('common.loading') || 'Loading enrollments...'}</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      {/* Progress Widget */}
      <Box mb={6}>
        <ProgressWidget compact />
      </Box>

      {(vipInfo.active || vipInfo.endIso) && (
        <Box
          p={3}
          borderWidth={1}
          borderColor="#b7a27d"
          borderRadius="lg"
          mb={5}
          bg="bg.surface"
        >
          <HStack justify="space-between" align="center">
            <HStack>
              <Badge colorScheme="yellow">VIP</Badge>
              <Text>
                {(() => {
                  if (!vipInfo.endIso) return t('vip.active', { defaultValue: 'VIP active' });
                  const diff = new Date(vipInfo.endIso).getTime() - Date.now();
                  const days = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
                  return t('vip.days_remaining', { defaultValue: `VIP days remaining: ${days}` });
                })()}
              </Text>
            </HStack>
            <Button bg="#b7a27d" color="black" onClick={() => window.open(tgLink, '_blank', 'noreferrer')}>
              {t('vip.open', { defaultValue: 'Open VIP Telegram' })}
            </Button>
          </HStack>
        </Box>
      )}
      <Heading fontSize="2xl" fontWeight="bold" textAlign="center" mb={6}>
        {t("dashboard.courses") || "My Enrollments"}
      </Heading>
      {error && (
        <Box color="red.500" mb={4}>
          {error}
        </Box>
      )}

      {enrollments.filter((p: any) => p.status === "CONFIRMED").length === 0 ? (
        <Text>{t("states.empty") || "No enrollments yet."}</Text>
      ) : (
        <VStack align="stretch" gap={4} bg="bg.surface">
          {enrollments
            .filter((p: any) => p.status === "CONFIRMED")
            .map((en: any) => {
              const tier = en.tier || {};
              return (
                <Box key={en.id} borderWidth={1} borderRadius="lg" p={5} borderColor="#b7a27d">
                  <HStack justify="space-between" align="start" mb={2}>
                    <Heading size="md">{tier.name || "Course"}</Heading>
                    <Badge
                      colorScheme={
                        en.status === "CONFIRMED"
                          ? "green"
                          : en.status === "PENDING"
                          ? "yellow"
                          : "gray"
                      }
                    >
                      {en.status}
                    </Badge>
                  </HStack>
                  {tier.description && (
                    <Text fontSize="sm" color="text.muted" mb={3}>
                      {tier.description}
                    </Text>
                  )}
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.500">
                      {t("common.created_at", { defaultValue: "Created at" })}:{" "}
                      {new Date(en.createdAt).toLocaleString()}
                    </Text>
                    <HStack gap={3}>
                      {en.status === "PENDING" && (
                        <Button
                          bg="#b7a27d"
                          color="white"
                          onClick={() =>
                            navigate(
                              `/checkout?purchaseId=${encodeURIComponent(en.id)}${
                                tier.id ? `&tierId=${encodeURIComponent(tier.id)}` : ""
                              }`
                            )
                          }
                        >
                          {t("checkout.complete_purchase", { defaultValue: "Complete Purchase" })}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        borderColor="black"
                        bg="#b7a27d"
                        onClick={() => navigate("/courses")}
                      >
                        {t("home.courses.cta") || "View Curriculum"}
                      </Button>
                      {tier.id && (
                        <Button
                          bg="#b7a27d"
                          color="white"
                          onClick={() => navigate(`/learn/${tier.id}`)}
                        >
                          {t("home.courses.view", { defaultValue: "View Course" })}
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </Box>
              );
            })}
        </VStack>
      )}
    </Box>
  );
};

export default Enrolled;
