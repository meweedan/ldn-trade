import React from "react";
import { Box, Container, Heading, Text, VStack, HStack, Link, Badge, Code } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../../themeProvider";
const GOLD = "#b7a27d";

export default function PrivacyRefundPolicy() {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");
  const { mode } = useThemeMode();

  const Bullets: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box as="ul" listStyleType="disc" ps={5} display="grid" rowGap={2}>
      {children}
    </Box>
  );

  const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box as="li" ms={0}>
      {children}
    </Box>
  );

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
      bg={mode === "dark" ? "black" : "white"}
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
          {/* Page Header */}
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Heading size="lg">
                {t("legal.privacy_refund.title") || "Privacy & Refund Policy"}
              </Heading>
              <Badge color="#b7a27d" borderColor="#b7a27d" fontSize="14px">
                {t("legal.common.last_updated") || "Last updated"}:{" "}
                {t("legal.privacy_refund.last_updated") || "Oct 8, 2025"}
              </Badge>
            </HStack>
            <Text color="text.muted">
              {t("legal.privacy_refund.intro") ||
                "This policy explains how we handle your data and how refunds work for our educational products and subscriptions focused on forex and crypto trading."}
            </Text>
          </VStack>

          {/* Scope */}
          <Section title={t("legal.privacy_refund.scope.title") || "Scope"} k="scope">
            <Text color="text.muted">
              {t("legal.privacy_refund.scope.p1") ||
                "These terms apply to all courses, live sessions, templates, and membership tiers available on our platform."}
            </Text>
            <Text color="text.muted">
              {t("legal.privacy_refund.scope.p2") ||
                "Financial markets are risky. We provide education only—no investment advice, signals, or portfolio management."}
            </Text>
          </Section>

          {/* Payments (USDT only) */}
          <Section
            title={t("legal.privacy_refund.payments.title") || "Payments & Pricing (USDT Only)"}
            k="payments"
          >
            <Text color="text.muted">
              {t("legal.privacy_refund.payments.p1") ||
                "All sales are processed exclusively in USDT. Where supported, we accept USDT on TRC20 and ERC20 networks."}
            </Text>
            <Bullets>
              <Bullet>
                {t("legal.privacy_refund.payments.li1") ||
                  "Prices may be displayed in your local currency for convenience, but settlement is in USDT."}
              </Bullet>
              <Bullet>
                {t("legal.privacy_refund.payments.li2") ||
                  "Network fees and on-chain confirmation times are outside our control."}
              </Bullet>
              <Bullet>
                {t("legal.privacy_refund.payments.li3") ||
                  "You are responsible for sending the exact amount to the correct chain address. Mis-sent funds may be irrecoverable."}
              </Bullet>
            </Bullets>
            <HStack pt={1} wrap="wrap" gap={2}>
              <Badge variant="subtle" colorScheme="yellow">
                {t("legal.privacy_refund.payments.note") || "Note"}
              </Badge>
              <Text color="text.muted" flex="1">
                {t("legal.privacy_refund.payments.note_text") ||
                  "Payment confirmations occur after sufficient on-chain confirmations."}
              </Text>
            </HStack>
          </Section>

          {/* Refund Policy */}
          <Section title={t("legal.refund.title") || "Refund Policy"} k="refund">
            <Text color="text.muted">
              {t("legal.refund.p1") ||
                "If you’re not satisfied within 7 days of purchase, contact support for a full refund (terms apply)."}
            </Text>
            <Bullets>
              <Bullet>
                {t("legal.refund.eligibility") ||
                  "Eligibility: first-time purchase of a given product/tier, and meaningful usage under fair-use limits."}
              </Bullet>
              <Bullet>
                {t("legal.refund.exclusions") ||
                  "Exclusions: content scraping/sharing, downloading a substantial portion of materials, account sharing, or policy abuse."}
              </Bullet>
              <Bullet>
                {t("legal.refund.digital") ||
                  "Because access is digital, refunds may be prorated or denied if significant content has been consumed."}
              </Bullet>
              <Bullet>
                {t("legal.refund.method") ||
                  "Refunds are issued in USDT to the original network used for payment. Network fees are non-refundable."}
              </Bullet>
              <Bullet>
                {t("legal.refund.timeline") ||
                  "Processing time: up to 10 business days after approval, excluding on-chain network delays."}
              </Bullet>
            </Bullets>
            <Text color="text.muted">
              {t("legal.refund.process") ||
                "To initiate a refund, email support with your order ID, wallet address, and reason."}{" "}
              <Code>{t("legal.common.support_email") || "support@infini.ly"}</Code>
            </Text>
          </Section>

          {/* Access & Cancellations */}
          <Section
            title={t("legal.privacy_refund.access.title") || "Access, Renewals & Cancellations"}
            k="access"
          >
            <Bullets>
              <Bullet>
                {t("legal.privacy_refund.access.li1") ||
                  "Access to digital content is personal and non-transferable."}
              </Bullet>
              <Bullet>
                {t("legal.privacy_refund.access.li2") ||
                  "Subscriptions renew automatically unless cancelled before the next billing date."}
              </Bullet>
              <Bullet>
                {t("legal.privacy_refund.access.li3") ||
                  "Cancellation stops future charges; it does not retroactively refund prior periods."}
              </Bullet>
            </Bullets>
          </Section>

          {/* Chargebacks & Disputes */}
          <Section
            title={t("legal.privacy_refund.chargebacks.title") || "Chargebacks & Disputes"}
            k="chargebacks"
          >
            <Text color="text.muted">
              {t("legal.privacy_refund.chargebacks.p1") ||
                "Please contact us first to resolve billing or access issues. Unauthorized disputes may result in account suspension."}
            </Text>
          </Section>

          {/* Privacy: Data We Collect */}
          <Section
            title={t("legal.privacy.data.title") || "Privacy: Data We Collect"}
            k="privacy-data"
          >
            <Bullets>
              <Bullet>
                {t("legal.privacy.data.account") ||
                  "Account data: name, email, and login identifiers."}
              </Bullet>
              <Bullet>
                {t("legal.privacy.data.billing") ||
                  "Billing metadata: transaction IDs, wallet address, and plan details (no private keys are ever collected)."}
              </Bullet>
              <Bullet>
                {t("legal.privacy.data.usage") ||
                  "Usage analytics: page views, progress, device information, and approximate location (for fraud prevention and product improvement)."}
              </Bullet>
            </Bullets>
          </Section>

          {/* How We Use Data */}
          <Section title={t("legal.privacy.use.title") || "How We Use Your Data"} k="privacy-use">
            <Bullets>
              <Bullet>
                {t("legal.privacy.use.provide") ||
                  "To provide and improve course content, track progress, and deliver support."}
              </Bullet>
              <Bullet>
                {t("legal.privacy.use.security") ||
                  "To protect against fraud, abuse, and unauthorized sharing."}
              </Bullet>
              <Bullet>
                {t("legal.privacy.use.comms") ||
                  "To send essential service emails. You can opt out of non-essential marketing messages."}
              </Bullet>
            </Bullets>
          </Section>

          {/* Cookies & Third Parties */}
          <Section
            title={t("legal.privacy.cookies.title") || "Cookies, Analytics & Third-Party Services"}
            k="cookies"
          >
            <Text color="text.muted">
              {t("legal.privacy.cookies.p1") ||
                "We use cookies and similar technologies for authentication, preferences, and analytics. Some third-party providers may process limited personal data according to their own policies."}
            </Text>
          </Section>

          {/* Retention & Security */}
          <Section
            title={t("legal.privacy.security.title") || "Data Retention & Security"}
            k="security"
          >
            <Bullets>
              <Bullet>
                {t("legal.privacy.security.retention") ||
                  "We retain data only as long as necessary for the purposes described or as required by law."}
              </Bullet>
              <Bullet>
                {t("legal.privacy.security.measures") ||
                  "We apply technical and organizational safeguards, but no method is 100% secure."}
              </Bullet>
            </Bullets>
          </Section>

          {/* Your Rights */}
          <Section title={t("legal.privacy.rights.title") || "Your Rights"} k="rights">
            <Text color="text.muted">
              {t("legal.privacy.rights.p1") ||
                "Subject to local laws, you may request access, correction, deletion, or portability of your data. We may ask for verification before fulfilling requests."}
            </Text>
          </Section>

          {/* Contact */}
          <Section title={t("legal.common.contact") || "Contact"} k="contact">
            <Text color="text.muted">
              {t("legal.common.contact_text") ||
                "For privacy questions or refund requests, reach us at "}
              <Link href="mailto:support@infini.ly" color={GOLD}>
                {t("legal.common.support_email") || "support@infini.ly"}
              </Link>
              .
            </Text>
          </Section>

          <Text color="text.muted" fontSize="sm" opacity={0.8}>
            {t("legal.common.disclaimer") ||
              "Nothing here is financial advice. Trading involves substantial risk of loss. Educational content is provided as-is without guarantees."}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
