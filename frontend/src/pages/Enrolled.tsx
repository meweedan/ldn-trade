import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Badge, Button, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

const Enrolled: React.FC = () => {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get('/purchase/mine');
        setEnrollments(Array.isArray(resp.data) ? resp.data : []);
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
