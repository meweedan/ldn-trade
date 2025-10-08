import React from "react";
import { Box, Container, Heading, Text, VStack, HStack, Badge, Link } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const GOLD = "#b7a27d";

export default function Terms() {
  const { t, i18n } = useTranslation("translation") as any; // ensure correct ns
  const isRTL = i18n?.language?.startsWith("ar");

  const Section: React.FC<{ title: string; k?: string; children: React.ReactNode }> = ({
    title,
    k,
    children,
  }) => (
    <Box
      id={k}
      border="1px solid"
      borderColor={GOLD}
      borderRadius="xl"
      p={{ base: 4, md: 6 }}
      bg="transparent"
    >
      <Heading size="md" mb={3} color={GOLD}>
        {title}
      </Heading>
      <VStack align="stretch" gap={3}>
        {children}
      </VStack>
    </Box>
  );

  return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="5xl">
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Heading size="lg">{t("legal.terms.title", "Terms & Conditions")}</Heading>
              <Badge color="#b7a27d" borderColor="#b7a27d" fontSize="14px">
                {t("legal.common.last_updated") || "Last updated"}:{" "}
                {t("legal.privacy_refund.last_updated") || "Oct 8, 2025"}
              </Badge>
            </HStack>
            <Text color="text.muted">
              {t(
                "legal.terms.intro",
                "By using this platform, enrolling in our courses, or purchasing digital content, you agree to these terms and conditions. Please read them carefully before proceeding."
              )}
            </Text>
          </VStack>

          {/* Scope */}
          <Section title={t("legal.terms.scope.title", "Scope")} k="scope">
            <Text color="text.muted">
              {t(
                "legal.terms.scope.p1",
                "These terms govern your use of our educational services, courses, subscriptions, and community access focused on forex and crypto trading education."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.scope.p2",
                "All content provided is for educational purposes only and does not constitute financial or investment advice."
              )}
            </Text>
          </Section>

          {/* Use of Content */}
          <Section
            title={t("legal.terms.use.title", "Use of Content & Intellectual Property")}
            k="use"
          >
            <Text color="text.muted">
              {t(
                "legal.terms.use.p1",
                "You are granted a personal, non-transferable, limited license to access and use our educational materials. You may not share, resell, distribute, or publicly display our content without written permission."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.use.p2",
                "All course videos, PDFs, and templates are copyrighted material. Unauthorized use may result in account termination and legal action."
              )}
            </Text>
          </Section>

          {/* User Conduct */}
          <Section title={t("legal.terms.conduct.title", "User Conduct")} k="conduct">
            <Text color="text.muted">
              {t(
                "legal.terms.conduct.p1",
                "You agree not to misuse the platform, engage in fraudulent activity, share your account, or attempt to gain unauthorized access to our systems."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.conduct.p2",
                "We reserve the right to suspend or terminate accounts involved in content piracy, abusive behavior, or any activity that compromises platform integrity."
              )}
            </Text>
          </Section>

          {/* Payments & Refunds */}
          <Section title={t("legal.terms.payments.title", "Payments & Refunds")} k="payments">
            <Text color="text.muted">
              {t(
                "legal.terms.payments.p1",
                "All payments are processed exclusively in USDT. Please review our Refund Policy for detailed terms on eligibility and processing times."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.payments.p2",
                "You are responsible for verifying payment addresses and network selection before sending crypto transactions."
              )}
            </Text>
          </Section>

          {/* Risk Disclosure */}
          <Section
            title={t("legal.terms.disclaimer.title", "Risk Disclosure & Educational Purpose")}
            k="disclaimer"
          >
            <Text color="text.muted">
              {t(
                "legal.terms.disclaimer.p1",
                "Trading forex, cryptocurrencies, and financial markets involves significant risk. Past performance does not guarantee future results."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.disclaimer.p2",
                "Our courses, templates, and examples are purely educational and do not constitute financial advice, trading recommendations, or investment guidance."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.disclaimer.p3",
                "You acknowledge that you are solely responsible for any trading decisions made based on information from our materials."
              )}
            </Text>
          </Section>

          {/* Liability */}
          <Section
            title={t("legal.terms.liability.title", "Limitation of Liability")}
            k="liability"
          >
            <Text color="text.muted">
              {t(
                "legal.terms.liability.p1",
                "We are not liable for any losses, damages, or claims arising from your use of our platform or the application of our educational content."
              )}
            </Text>
            <Text color="text.muted">
              {t(
                "legal.terms.liability.p2",
                "All information is provided 'as is' without warranties of accuracy, completeness, or fitness for purpose."
              )}
            </Text>
          </Section>

          {/* Modifications */}
          <Section
            title={t("legal.terms.modifications.title", "Changes to Terms")}
            k="modifications"
          >
            <Text color="text.muted">
              {t(
                "legal.terms.modifications.p1",
                "We may update these terms periodically to reflect new features, laws, or business practices. Continued use after updates implies acceptance."
              )}
            </Text>
          </Section>

          {/* Contact */}
          <Section title={t("legal.common.contact", "Contact")} k="contact">
            <Text color="text.muted">
              {t("legal.common.contact_text", "For legal inquiries, please contact us at ")}
              <Link
                href={`mailto:${t("legal.common.support_email", "support@example.com")}`}
                color={GOLD}
              >
                {t("legal.common.support_email", "support@example.com")}
              </Link>
              .
            </Text>
          </Section>

          {/* Final Disclaimer */}
          <Text color="text.muted" fontSize="sm" opacity={0.8}>
            {t(
              "legal.common.disclaimer",
              "Trading involves substantial risk and may result in loss of capital. Our content is educational and not a guarantee of results."
            )}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
