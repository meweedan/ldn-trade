import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Link,
  List,
  ListItem,
  Icon,
  Image,
  Code,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const GOLD = "#b7a27d";

export default function CryptoGuide() {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");

  return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="5xl">
        <VStack align="stretch" spacing={8}>
          {/* Hero */}
          <VStack spacing={2} textAlign="center">
            <Heading fontSize={{ base: "2xl", md: "3xl" }} color={GOLD}>
              {t("crypto.title")}
            </Heading>
            <Text opacity={0.85} maxW="3xl">
              {t("crypto.subtitle")}
            </Text>
          </VStack>

          <Divider />

          {/* What is USDT */}
          <Card>
            <CardBody bg="bg.surface" borderWidth="1px" borderColor="#b7a27d" borderRadius="md">
              <Heading size="md" mb={2}>
                {t("crypto.what_is_usdt.title")}
              </Heading>
              <Text mb={3}>{t("crypto.what_is_usdt.desc")}</Text>
              <Image
                src="/images/rand/usdt.png"
                alt="USDT example"
                borderRadius="md"
                w="full"
                maxW="400px"
                mx="auto"
              />
            </CardBody>
          </Card>

          {/* Chain Comparison */}
          <Card>
            <CardBody bg="bg.surface" borderWidth="1px" borderColor="#b7a27d" borderRadius="md">
              <Heading size="md" mb={2}>
                {t("crypto.chains.title")}
              </Heading>
              <Text mb={4}>{t("crypto.chains.desc")}</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box p={4} border="1px solid" borderColor="gray.300" borderRadius="md">
                  <Heading size="sm" color="blue.400">
                    Ethereum (ERC20)
                  </Heading>
                  <Text fontSize="sm">{t("crypto.chains.erc20")}</Text>
                </Box>
                <Box p={4} border="1px solid" borderColor="gray.300" borderRadius="md">
                  <Heading size="sm" color="purple.400">
                    BNB Smart Chain (BEP20)
                  </Heading>
                  <Text fontSize="sm">{t("crypto.chains.bep20")}</Text>
                </Box>
                <Box p={4} border="1px solid" borderColor="gray.300" borderRadius="md">
                  <Heading size="sm" color="green.400">
                    TRON (TRC20)
                  </Heading>
                  <Text fontSize="sm" fontWeight="bold" color={GOLD}>
                    {t("crypto.chains.trc20")}
                  </Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* How to Buy */}
          <Card>
            <CardBody bg="bg.surface" borderWidth="1px" borderColor="#b7a27d" borderRadius="md">
              <Heading size="md" mb={2}>
                {t("crypto.buy.title")}
              </Heading>
              <Text mb={3}>{t("crypto.buy.desc")}</Text>
              <List spacing={2}>
                <ListItem>
                  <Link href="https://www.binance.com" isExternal color={GOLD}>
                    Binance <Icon as={ExternalLink} boxSize={4} ml={1} />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://www.okx.com" isExternal color={GOLD}>
                    OKX <Icon as={ExternalLink} boxSize={4} ml={1} />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://www.bybit.com" isExternal color={GOLD}>
                    Bybit <Icon as={ExternalLink} boxSize={4} ml={1} />
                  </Link>
                </ListItem>
              </List>

              <Divider my={4} />

              <Heading size="sm" mb={2}>
                {t("crypto.buy.libya_title")}
              </Heading>
              <Text mb={3}>{t("crypto.buy.libya_desc")}</Text>

              <List spacing={2}>
                <ListItem>
                  <Link href="https://goo.gl/maps/dM6uUjNBa2N9eR4P6" isExternal color={GOLD}>
                    Tripoli – Al-Siyahiya Exchange
                    <Icon as={ExternalLink} boxSize={4} ml={1} />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://goo.gl/maps/wLrLpKUcTcnzjAEz8" isExternal color={GOLD}>
                    Benghazi – Souq Al-Jareed Exchange
                    <Icon as={ExternalLink} boxSize={4} ml={1} />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://goo.gl/maps/9LhGzAmLxwHbL6Ft7" isExternal color={GOLD}>
                    Misrata – Downtown Financial Center
                    <Icon as={ExternalLink} boxSize={4} ml={1} />
                  </Link>
                </ListItem>
              </List>
            </CardBody>
          </Card>

          {/* How to Send */}
          <Card>
            <CardBody bg="bg.surface" borderWidth="1px" borderColor="#b7a27d" borderRadius="md">
              <Heading size="md" mb={2}>
                {t("crypto.send.title")}
              </Heading>
              <Text mb={3}>{t("crypto.send.desc")}</Text>

              <List spacing={2} pl={4}>
                <ListItem>✅ {t("crypto.send.steps.1")}</ListItem>
                <ListItem>✅ {t("crypto.send.steps.2")}</ListItem>
                <ListItem>✅ {t("crypto.send.steps.3")}</ListItem>
                <ListItem>✅ {t("crypto.send.steps.4")}</ListItem>
              </List>

              <Divider my={4} />

              <Text fontWeight="bold">{t("crypto.txn.title")}</Text>
              <Text mb={2}>{t("crypto.txn.desc")}</Text>

              <Code p={3} borderRadius="md" display="block" whiteSpace="nowrap">
                9d14db6a6e4e5e8adf07f1fbbbe23cb9d5b2a4bdfa7cbba532e38aabceabf9c9
              </Code>

              <Text fontSize="sm" opacity={0.8} mt={2}>
                {t("crypto.txn.note")}
              </Text>
            </CardBody>
          </Card>

          <VStack>
            <Button
              as={RouterLink}
              to="/checkout"
              bg={GOLD}
              color="black"
              _hover={{ opacity: 0.9 }}
            >
              {t("crypto.cta_enroll")}
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
