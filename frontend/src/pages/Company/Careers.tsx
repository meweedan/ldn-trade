import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Heading,
  Text,
  Button,
  Badge,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/client"; // <-- uses baseURL: '/api'

const GOLD = "#b7a27d";

type JobDTO = {
  id: string;
  title: string;
  description: string;
  requirements: string[] | null;
  expectedPay: string | null;
  closingDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location?: string;
  type?: "FULLTIME" | "PARTTIME" | "CONTRACT";
};

export default function Careers() {
  const { t } = useTranslation() as any;
  const [jobs, setJobs] = React.useState<JobDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // HITS: GET /api/careers/jobs?limit=24
        const res = await api.get("/careers/jobs", { params: { limit: 24 } });
        const payload = res?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        if (!alive) return;
        setJobs(list as JobDTO[]);
        setErr(null);
      } catch (e) {
        if (!alive) return;
        setErr("Failed to load jobs");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Container maxW="7xl">
        <Stack gap={6}>
          <Heading size="lg">{t("company.careers.title") || "Careers"}</Heading>
          <Text color="text.muted" maxW="4xl">
            {t("company.careers.subtitle") ||
              "Join a product-driven team building world-class trading education."}
          </Text>

          {loading ? (
            <HStack>
              <Spinner />
              <Text color="text.muted">Loading jobs…</Text>
            </HStack>
          ) : err ? (
            <Text color="red.400">{err}</Text>
          ) : jobs.length === 0 ? (
            <Text color="text.muted">No open roles right now. Check back soon.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 6 }}>
              {jobs.map((job) => {
                const closing = new Date(job.closingDate).toLocaleDateString();
                return (
                  <Box
                    key={job.id}
                    border="1px solid"
                    borderColor={GOLD}
                    borderRadius="xl"
                    p={{ base: 4, md: 5 }}
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 200ms ease"
                  >
                    <Stack gap={3}>
                      <Heading size="md">{job.title}</Heading>
                      <HStack gap={3} flexWrap="wrap">
                        {job.expectedPay ? (
                          <Badge colorScheme="yellow" borderRadius="full">
                            {job.expectedPay}
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          borderColor={GOLD}
                          color={GOLD}
                          borderRadius="full"
                        >
                          Closes: {closing}
                        </Badge>
                      </HStack>
                      <Text color="text.muted">{job.description}</Text>
                      <RouterLink to={`/apply/${job.id}`}>
                        <Button
                          bg={GOLD}
                          color="black"
                          _hover={{ opacity: 0.9 }}
                          borderRadius="xl"
                          alignSelf="flex-start"
                        >
                          {t("company.careers.apply.title") || "Apply Now"}
                        </Button>
                      </RouterLink>
                    </Stack>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
