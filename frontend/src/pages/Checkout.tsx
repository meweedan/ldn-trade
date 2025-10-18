/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/Checkout.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Code,
  chakra,
  Grid,
  GridItem,
  Input,
  Badge,
  useBreakpointValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import { getAllCountries, getDeviceCountryCode } from "../utils/countries";

type Method = "usdt" | "stripe" | "libyana" | "madar";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation() as any;
  const location = useLocation();
  const [deviceCode, setDeviceCode] = React.useState<string | null>(null);
  const qs = React.useMemo(() => new URLSearchParams(location.search), [location.search]);

  const tierId = qs.get("tierId") || "";
  const [purchaseId, setPurchaseId] = React.useState<string>(qs.get("purchaseId") || "");
  const [method, setMethod] = React.useState<Method>("usdt");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [tier, setTier] = React.useState<any | null>(null);
  const [allTiers, setAllTiers] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any | null>(null);
  const [country, setCountry] = React.useState("");
  const [courseLanguage, setCourseLanguage] = React.useState("en");
  const [promoCode, setPromoCode] = React.useState<string>("");
  const [refCode, setRefCode] = React.useState<string>("");
  const [alreadyEnrolled, setAlreadyEnrolled] = React.useState(false);
  const [vipTelegram, setVipTelegram] = React.useState(false);

  const [previewAmount, setPreviewAmount] = React.useState<number | null>(null);
  const [previewDiscount, setPreviewDiscount] = React.useState<number | null>(null);
  const [previewBase, setPreviewBase] = React.useState<number | null>(null);
  const [previewPath, setPreviewPath] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentExpiresAt, setPaymentExpiresAt] = React.useState<number | null>(null);
  const [remainingSec, setRemainingSec] = React.useState(0);
  const [fromPhone, setFromPhone] = React.useState("");
  const [txnHash, setTxnHash] = React.useState("");
  const [proofSubmitting, setProofSubmitting] = React.useState(false);
  const [proofError, setProofError] = React.useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = React.useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = React.useState(false);

  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  // NEW: Promo UX controls
  const [showPromoInput, setShowPromoInput] = React.useState(false);
  const [promoConfirmed, setPromoConfirmed] = React.useState(false);

  const brand = "#b7a27d";
  const cardBorder = "#b7a27d";
  const subtleText = "text.muted";
  const selectBorder = "#b7a27d";
  const selectFocus = "#b7a27d";

  const isMdUp = useBreakpointValue({ base: false, md: true });

  const openPaymentModal = React.useCallback(() => {
    const expires = Date.now() + 30 * 60 * 1000;
    setPaymentExpiresAt(expires);
    setPaymentOpen(true);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const [me, tResp, mine, all] = await Promise.all([
          api.get("/users/me").catch(() => ({ data: null })),
          tierId ? api.get(`/courses/${tierId}`) : Promise.resolve({ data: null }),
          getMyPurchases({ ttlMs: 10 * 60 * 1000 }).catch(() => [] as any[]),
          api.get("/courses").catch(() => ({ data: [] })),
        ]);
        setUser((me as any).data);
        setTier((tResp as any).data);
        const listAll = Array.isArray((all as any).data) ? (all as any).data : [];
        setAllTiers(listAll);
        const list: any[] = Array.isArray(mine) ? (mine as any[]) : [];
        const enrolled = list.some(
          (p) =>
            String(p.status || "").toUpperCase() === "CONFIRMED" &&
            ((p.tier && p.tier.id === tierId) || p.tierId === tierId)
        );
        setAlreadyEnrolled(enrolled);
      } catch {}
    })();
  }, [tierId]);

  React.useEffect(() => {
    const ref = qs.get("ref");
    const stored = localStorage.getItem("refCode") || "";
    if (ref) {
      localStorage.setItem("refCode", ref);
      setRefCode(ref);
    } else if (stored) {
      setRefCode(stored);
    }
  }, [qs]);

  const fetchPurchaseStatus = React.useCallback(async (): Promise<string | null> => {
    try {
      const list = await getMyPurchases({ force: true });
      const arr: any[] = Array.isArray(list) ? list : [];
      const found = arr.find((p) => p.id === purchaseId);
      const status = found?.status || null;
      if (status) setPurchaseStatus(status);
      return status;
    } catch {
      return null;
    }
  }, [purchaseId]);

  const startPollingStatus = React.useCallback(() => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      const st = await fetchPurchaseStatus();
      if (st === "CONFIRMED") return;
      setTimeout(poll, 5000);
    };
    poll();
    return () => {
      active = false;
    };
  }, [fetchPurchaseStatus]);

  const startCheckout = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        tierId,
        method,
        purchaseId,
        country,
        courseLanguage,
        vipTelegram: !!vipTelegram && !tier?.isVipProduct,
      };
      if (promoConfirmed && promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();
      const resp = await api.post("/purchase/create", payload);
      const provider = (resp.data?.provider || "").toString().toLowerCase();

      if (resp.data?.purchaseId && !purchaseId) {
        setPurchaseId(resp.data.purchaseId as string);
        try {
          const k = "watchPurchaseIds";
          const arr = JSON.parse(localStorage.getItem(k) || "[]");
          if (Array.isArray(arr)) {
            if (!arr.includes(resp.data.purchaseId)) arr.push(resp.data.purchaseId);
            localStorage.setItem(k, JSON.stringify(arr));
          } else {
            localStorage.setItem(k, JSON.stringify([resp.data.purchaseId]));
          }
        } catch {}
      }

      if (provider === "stripe") {
        const url = (resp.data?.checkoutUrl || resp.data?.url) as string | undefined;
        if (url) {
          window.location.href = url;
          return;
        }
        const clientSecret = (resp.data?.clientSecret || resp.data?.paymentIntentClientSecret) as
          | string
          | undefined;
        if (clientSecret) {
          setError(
            t("checkout.errors.stripe_client_secret", {
              defaultValue:
                "Stripe client secret received. Payment Element flow is not enabled yet.",
            })
          );
          return;
        }
        setError(
          t("checkout.errors.stripe_url_missing", {
            defaultValue: "Stripe checkout URL missing. Please try again.",
          })
        );
      } else if (provider === "usdt") {
        const addr = resp.data?.address || null;
        const amt =
          typeof resp.data?.amount === "number"
            ? resp.data.amount
            : Number(resp.data?.amount) || null;
        const finalAmt = previewAmount != null ? previewAmount : amt;
        setAddress(addr);
        setAmount(finalAmt);
        if (addr) {
          const { default: QRCode } = await import("qrcode");
          const dataUrl = await QRCode.toDataURL(addr, { margin: 1, scale: 5 });
          setQrDataUrl(dataUrl);
        } else {
          setQrDataUrl(null);
        }
        openPaymentModal();
      } else if (provider === "libyana" || provider === "madar") {
        openPaymentModal();
      } else if (provider === "free") {
        try {
          const k = "watchPurchaseIds";
          const arr = JSON.parse(localStorage.getItem(k) || "[]");
          if (Array.isArray(arr)) {
            if (!arr.includes(resp.data.purchaseId)) arr.push(resp.data.purchaseId);
            localStorage.setItem(k, JSON.stringify(arr));
          } else {
            localStorage.setItem(k, JSON.stringify([resp.data.purchaseId]));
          }
        } catch {}
        navigate("/enrolled");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }, [
    tierId,
    method,
    purchaseId,
    country,
    courseLanguage,
    promoConfirmed,
    promoCode,
    refCode,
    openPaymentModal,
    navigate,
    previewAmount,
    t,
    vipTelegram,
    tier?.isVipProduct,
  ]);

  const confirmPromo = React.useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      if (!tierId) throw new Error("Missing course");
      const payload: any = {
        tierId,
        method,
        country,
        courseLanguage,
        preview: true,
        vipTelegram: !!vipTelegram && !tier?.isVipProduct,
      };
      if (promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();

      const resp = await api.post("/purchase/create", payload);
      const due = Number(resp.data?.amount);
      const disc = Number(resp.data?.discount);
      const baseUsed = Number(resp.data?.baseUsed);
      const validDue = Number.isFinite(due) ? due : null;
      const validDisc = Number.isFinite(disc) ? disc : null;
      const validBase = Number.isFinite(baseUsed) ? baseUsed : null;
      setPreviewAmount(validDue);
      setPreviewDiscount(validDisc);
      setPreviewBase(validBase);
      setPreviewPath(resp.data?.pricingPath || null);

      // Determine if promo applied
      const applied =
        !!promoCode &&
        validBase != null &&
        validDue != null &&
        Math.abs(validDue - validBase) >= 1e-6;

      setPromoConfirmed(applied);
      if (applied) setShowPromoInput(false);

      if (promoCode && !applied) {
        setPreviewError(
          t("checkout.promo.not_applied", {
            defaultValue:
              "This promo didn’t apply (invalid, expired, not applicable, or per-user limit).",
          })
        );
      }
    } catch (e: any) {
      setPreviewError(e?.response?.data?.message || e?.message || "Failed to preview");
      setPreviewAmount(null);
      setPreviewDiscount(null);
      setPreviewBase(null);
      setPreviewPath(null);
      setPromoConfirmed(false);
    } finally {
      setPreviewLoading(false);
    }
  }, [
    tierId,
    method,
    country,
    courseLanguage,
    promoCode,
    refCode,
    t,
    vipTelegram,
    tier?.isVipProduct,
  ]);

  // Debounce preview on code typing (keep behavior)
  React.useEffect(() => {
    if (!promoCode) {
      setPreviewAmount(null);
      setPreviewDiscount(null);
      setPreviewBase(null);
      setPreviewPath(null);
      setPreviewError(null);
      setPromoConfirmed(false);
      return;
    }
    const id = setTimeout(() => {
      confirmPromo();
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCode, method, country, courseLanguage, tierId]);

  const enrollFree = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!tierId) throw new Error("Missing course");
      const payload: any = { tierId, method: "free" };
      if (promoConfirmed && promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();
      await api.post("/purchase/create", payload);
      navigate("/enrolled");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  }, [tierId, navigate, promoConfirmed, promoCode, refCode]);

  const submitProof = async () => {
    setProofError(null);
    setProofSubmitting(true);
    try {
      let pid = purchaseId;
      if (!pid) {
        if (!tierId) throw new Error("Missing purchase ID");
        const resp = await api.post("/purchase/create", { tierId, method });
        const provider = (resp.data?.provider || "").toString().toLowerCase();
        if (resp.data?.purchaseId) {
          pid = resp.data.purchaseId as string;
          setPurchaseId(pid);
        }
        if (provider === "usdt") {
          setAddress(resp.data.address || "");
          setAmount(resp.data.amount || null);
        }
      }

      if (method === "usdt" && !txnHash)
        throw new Error(
          t("checkout.errors.txid_required", { defaultValue: "Please enter the transaction hash" })
        );
      if ((method === "libyana" || method === "madar") && !fromPhone)
        throw new Error(
          t("checkout.errors.phone_required", {
            defaultValue: "Please enter the sender phone number",
          })
        );

      const payload: any = { purchaseId: pid, method };
      if (method === "usdt") payload.txHash = txnHash.trim();
      if (method === "libyana" || method === "madar") payload.fromPhone = fromPhone.trim();

      let ok = false;
      try {
        await api.post("/purchase/confirm", payload);
        ok = true;
      } catch {
        await api.post("/purchase/proof", payload);
        ok = true;
      }

      if (ok) {
        setProofSubmitted(true);
        startPollingStatus();
        try {
          const idToWatch = pid;
          if (idToWatch) {
            const k = "watchPurchaseIds";
            const arr = JSON.parse(localStorage.getItem(k) || "[]");
            if (Array.isArray(arr)) {
              if (!arr.includes(idToWatch)) arr.push(idToWatch);
              localStorage.setItem(k, JSON.stringify(arr));
            } else {
              localStorage.setItem(k, JSON.stringify([idToWatch]));
            }
          }
        } catch {}
      }
    } catch (e: any) {
      setProofError(
        e?.response?.data?.message ||
          e?.message ||
          t("checkout.errors.proof_failed", { defaultValue: "Failed to submit proof" })
      );
    } finally {
      setProofSubmitting(false);
    }
  };

  const CSelect = chakra("select");

  const priceStr = tier?.price_stripe ?? tier?.price_usdt ?? "";
  const usdPrice: number = typeof priceStr === "number" ? priceStr : Number(priceStr) || 0;
  const isFree = usdPrice <= 0;
  const isLibya = country === "LY";
  const isWallet = method === "libyana" || method === "madar";
  const showLYD = isLibya && isWallet;
  const baseUsd = previewBase != null ? previewBase : usdPrice;
  const baseLyd = Math.round(baseUsd * 8 * 100) / 100;

  const effectiveUsd = previewAmount != null ? previewAmount : baseUsd;
  const vipTier = React.useMemo(
    () => (allTiers || []).find((x: any) => x?.isVipProduct) || null,
    [allTiers]
  );
  const vipPriceUsd: number = React.useMemo(() => {
    const v = vipTier?.price_usdt;
    return typeof v === "number" ? v : Number(v || 0);
  }, [vipTier?.price_usdt]);
  const effectiveLyd = Math.round(effectiveUsd * 8 * 100) / 100;
  const savedUsd = Math.max(0, baseUsd - effectiveUsd);

  const lang = String(i18n?.language || "en").toLowerCase();
  const freeLabel = t("checkout.free", {
    defaultValue: lang.startsWith("ar") ? "مجاني" : lang.startsWith("fr") ? "Gratuit" : "Free",
  });

  const countryOptions = React.useMemo(() => {
    return getAllCountries(i18n?.language || "en", deviceCode);
  }, [i18n?.language, deviceCode]);

  const vipAddonUsd = React.useMemo(() => {
    if (tier?.isVipProduct || !vipTelegram) return 0;
    const p = Number(vipPriceUsd);
    return Number.isFinite(p) && p > 0 ? p : 20; // fallback to 20 if price missing
  }, [tier?.isVipProduct, vipTelegram, vipPriceUsd]);  

  // Combined due amount (course + VIP add-on). Drives UI and totals.
  const totalUsd = React.useMemo(() => {
    const base = Number(effectiveUsd) || 0;
    const addon = Number(vipAddonUsd) || 0;
    return Math.max(0, base + addon);
  }, [effectiveUsd, vipAddonUsd]);
  const isZeroDue = totalUsd <= 0;

  React.useEffect(() => {
    const dc = getDeviceCountryCode();
    setDeviceCode(dc);
    if (!country && dc) setCountry(dc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!paymentOpen || !paymentExpiresAt) return;
    const tick = () => {
      const secs = Math.max(0, Math.floor((paymentExpiresAt - Date.now()) / 1000));
      setRemainingSec(secs);
      if (secs <= 0) setPaymentOpen(false);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [paymentOpen, paymentExpiresAt]);

  const isAdvancedTier = React.useMemo(() => {
    const name = String(tier?.name || "").toLowerCase();
    const level = String(tier?.level || "").toLowerCase();
    return name.includes("advanced") || level.includes("advanced");
  }, [tier?.name, tier?.level]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert(t("common.copied", { defaultValue: "Copied!" }));
    } catch {}
  };

  // Helpers for where to render controls
  const renderPromoBlock = (variant: "inline" | "footer") => {
    // hide when free product
    if (isFree) return null;

    const PromoToggle = (
      <HStack gap={2} flexWrap="wrap" align="center">
        {!showPromoInput && !promoConfirmed && (
          <ChakraLink
            as="button"
            color={brand}
            textDecoration="underline"
            onClick={() => setShowPromoInput(true)}
          >
            {t("checkout.promo.have_code", { defaultValue: "I have a promo code" })}
          </ChakraLink>
        )}
      </HStack>
    );

    const PromoInput = (
      <>
        <HStack gap={2} flexWrap="wrap" align="stretch" bg="bg.surface"> 
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder={t("checkout.promo.placeholder", {
              defaultValue: "Enter code",
            })}
            w={{ base: "100%", sm: "auto" }}
            flex="1"
          />
          <Button
            onClick={confirmPromo}
            isLoading={previewLoading}
            variant="outline"
            borderColor={brand}
            color="inherit"
            _hover={{ bg: "#b7a27d" }}
            w={{ base: "100%", sm: "auto" }}
          >
            {t("checkout.promo.confirm", { defaultValue: "Apply" })}
          </Button>
        </HStack>
        {previewError && (
          <Text mt={2} color="red.500" fontSize="sm">
            {previewError}
          </Text>
        )}
        {promoConfirmed && (
          <Text mt={2} color="green.600" fontSize="sm">
            {t("checkout.promo.applied", { defaultValue: "Promo applied!" })} {promoCode}
          </Text>
        )}
      </>
    );

    return (
      <Box mt={variant === "footer" ? 0 : 4}>
        <Text fontWeight={600} mb={1}>
          {t("checkout.promo.label", { defaultValue: "Promo Code" })}
        </Text>
        {!promoConfirmed && !showPromoInput && PromoToggle}
        {!promoConfirmed && showPromoInput && PromoInput}
      </Box>
    );
  };

  const renderVipUpsell = (variant: "inline" | "footer") => {
    if (tier?.isVipProduct) return null; // don't upsell inside VIP product
    return (
      <Box
        mt={variant === "footer" ? 2 : 2}
        p={3}
        borderWidth={1}
        borderColor="#229ED9"
        borderRadius="md"
        bg="#229ED9"
      >
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box minW={0}>
            <Text fontWeight={600} color="white">
              {t("checkout.addons.vip.title", { defaultValue: "VIP Telegram (monthly)" })}
            </Text>
            <Text fontSize="sm" color="white">
              {t("checkout.addons.vip.subtitle", {
                defaultValue: `Recurring $${vipPriceUsd}/month. Cancel anytime.`,
              })}
            </Text>
          </Box>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={vipTelegram}
              onChange={(e) => setVipTelegram(e.target.checked)}
            />
            <Text fontSize="sm" color="white">
              {t("checkout.addons.vip.choose", {
                defaultValue: `Add ($${vipPriceUsd || 10}/month)`,
              })}
            </Text>
          </label>
        </HStack>
      </Box>
    );
  };

  return (
    <Box py={{ base: 4, md: 10 }} color="text.primary" overflowX="hidden">
      <Container maxW={{ base: "full", md: "6xl" }} px={{ base: 3, md: 6 }}>
        {/* Header */}
        <Box
          border="1px solid"
          borderColor={cardBorder}
          bg="bg.surface"
          borderRadius="2xl"
          px={{ base: 4, md: 8 }}
          py={{ base: 4, md: 7 }}
          mb={{ base: 4, md: 6 }}
          boxShadow="lg"
          w="full"
          minW={0}
        >
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <VStack align="start" gap={1} minW={0}>
              <Heading size={useBreakpointValue({ base: "md", md: "lg" })} noOfLines={2}>
                {t("checkout.title", { defaultValue: "Checkout" })}
              </Heading>
              <Text color={subtleText} noOfLines={2}>
                {t("checkout.subtitle", {
                  defaultValue: "Secure your seat with fast, flexible payment methods.",
                })}
              </Text>
            </VStack>
            {tier?.level && (
              <Badge color="#b7a27d" fontSize="sm" flexShrink={0}>
                {tier.level}
              </Badge>
            )}
          </HStack>
        </Box>

        {tier?.isBundle && Array.isArray(tier?.bundleTierIds) && tier.bundleTierIds.length > 0 && (
          <Box
            p={3}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="md"
            mb={{ base: 4, md: 6 }}
            bg="bg.surface"
            w="full"
          >
            <Text fontWeight={600} mb={1}>
              {t("checkout.bundle.includes", { defaultValue: "This bundle includes:" })}
            </Text>
            <VStack align="start" spacing={1}>
              {tier.bundleTierIds
                .map((id: string) => allTiers.find((x) => x.id === id)?.name)
                .filter(Boolean)
                .map((name: any, idx: number) => (
                  <Text key={`bund-i-${idx}`}>• {name}</Text>
                ))}
            </VStack>
          </Box>
        )}

        {!tierId && (
          <Box
            p={3}
            border="1px solid"
            borderColor={brand}
            borderRadius="md"
            mb={{ base: 4, md: 6 }}
            bg="bg.surface"
            w="full"
          >
            <Text>
              {t("checkout.no_tier", {
                defaultValue: "No course tier selected. Go back and choose a course.",
              })}
            </Text>
          </Box>
        )}
        {alreadyEnrolled && (
          <Box
            p={3}
            border="1px solid"
            borderColor="green.300"
            borderRadius="md"
            mb={{ base: 4, md: 6 }}
            bg="bg.surface"
            color="green.700"
            w="full"
          >
            {t("checkout.already_enrolled", {
              defaultValue: "You already own this course. Enjoy learning!",
            })}
            <Button ml={3} mt={{ base: 2, md: 0 }} size="sm" onClick={() => navigate("/enrolled")}>
              {t("celebration.cta", { defaultValue: "Go to My Courses" })}
            </Button>
          </Box>
        )}

        {error && (
          <Box
            p={3}
            border="1px solid"
            borderColor="red.300"
            borderRadius="md"
            bg="bg.surface"
            color="red.700"
            mb={{ base: 4, md: 6 }}
            w="full"
          >
            {error}
          </Box>
        )}

        <Grid
          templateColumns={{ base: "1fr", md: "2fr 1fr" }}
          gap={{ base: 4, md: 8 }}
          alignItems="start"
          w="full"
          minW={0}
        >
          {/* Left */}
          <GridItem minW={0}>
            <VStack align="stretch" gap={{ base: 4, md: 6 }} w="full" minW={0}>
              {/* Customer details */}
              <Box
                borderWidth={1}
                borderColor={cardBorder}
                bg="bg.surface"
                borderRadius="xl"
                p={{ base: 4, md: 5 }}
                boxShadow="md"
                w="full"
                minW={0}
              >
                <Heading size="md" mb={4}>
                  {t("checkout.customer.details", { defaultValue: "Customer Details" })}
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.full_name", { defaultValue: "Full Name" })}
                    </Text>
                    <Input
                      defaultValue={user?.name || ""}
                      placeholder={t("checkout.placeholders.name", { defaultValue: "Your name" })}
                      w="full"
                    />
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.email", { defaultValue: "Email" })}
                    </Text>
                    <Input
                      defaultValue={user?.email || ""}
                      placeholder="you@example.com"
                      type="email"
                      w="full"
                    />
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.country", { defaultValue: "Country/Region" })}
                    </Text>
                    <CSelect
                      value={country}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCountry(e.target.value)
                      }
                      style={{ padding: "10px", borderRadius: 10 }}
                      bg="bg.surface"
                      border="1px solid"
                      borderColor={selectBorder}
                      _focus={{ outline: "none", boxShadow: `0 0 0 1px ${selectFocus}` }}
                      w="full"
                    >
                      <option value="">
                        {t("checkout.placeholders.country", { defaultValue: "Choose country" })}
                      </option>
                      {countryOptions.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.name}
                        </option>
                      ))}
                    </CSelect>
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.pref_lang", {
                        defaultValue: "Preferred Course Language",
                      })}
                    </Text>
                    <CSelect
                      value={courseLanguage}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCourseLanguage(e.target.value)
                      }
                      style={{ padding: "10px", borderRadius: 10 }}
                      bg="bg.surface"
                      border="1px solid"
                      borderColor={selectBorder}
                      _focus={{ outline: "none", boxShadow: `0 0 0 1px ${selectFocus}` }}
                      w="full"
                    >
                      <option value="en">
                        {t("checkout.lang.en", { defaultValue: "English" })}
                      </option>
                      <option value="ar">
                        {t("checkout.lang.ar", { defaultValue: "Arabic" })}
                      </option>
                      <option value="fr">
                        {t("checkout.lang.fr", { defaultValue: "French" })}
                      </option>
                    </CSelect>
                  </Box>
                </Grid>
              </Box>

              {/* Payment */}
              {!isZeroDue && (
                <Box
                  borderWidth={1}
                  borderColor={cardBorder}
                  bg="bg.surface"
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                  boxShadow="md"
                  w="full"
                  minW={0}
                >
                  <Heading size="md" mb={4}>
                    {t("checkout.payment.title", { defaultValue: "Payment Method" })}
                  </Heading>

                  <VStack align="stretch" gap={3}>
                    <HStack gap={3} flexWrap="wrap" align="center">
                      <input
                        type="radio"
                        id="stripe"
                        name="method"
                        checked={method === "stripe"}
                        onChange={() => setMethod("stripe")}
                      />
                      <label htmlFor="stripe">
                        {t("checkout.payment.card", { defaultValue: "Card (Visa/Mastercard)" })}
                      </label>
                    </HStack>
                    <HStack gap={3} flexWrap="wrap" align="center">
                      <input
                        type="radio"
                        id="usdt"
                        name="method"
                        checked={method === "usdt"}
                        onChange={() => setMethod("usdt")}
                      />
                      <label htmlFor="usdt">
                        {t("checkout.payment.usdt", { defaultValue: "USDT (TRC20)" })}
                      </label>
                    </HStack>

                    {country === "LY" && (
                      <>
                        <HStack gap={3} flexWrap="wrap" align="center">
                          <input
                            type="radio"
                            id="libyana"
                            name="method"
                            checked={method === "libyana"}
                            onChange={() => setMethod("libyana")}
                          />
                          <label htmlFor="libyana">
                            {t("checkout.payment.libyana", { defaultValue: "Libyana Balance" })}
                          </label>
                        </HStack>
                        <HStack gap={3} flexWrap="wrap" align="center">
                          <input
                            type="radio"
                            id="madar"
                            name="method"
                            checked={method === "madar"}
                            onChange={() => setMethod("madar")}
                          />
                          <label htmlFor="madar">
                            {t("checkout.payment.madar", { defaultValue: "Madar Balance" })}
                          </label>
                        </HStack>
                      </>
                    )}

                    {method === "libyana" && (
                      <Box p={4} border="1px solid" borderColor={brand} borderRadius="md">
                        <VStack align="start" gap={2}>
                          <Heading size="sm">
                            {t("checkout.libyana.title", {
                              defaultValue: "Pay with Libyana Balance",
                            })}
                          </Heading>
                          <Text>
                            {t("checkout.libyana.instructions", {
                              defaultValue: "Send the payment to the following number:",
                            })}
                          </Text>
                          <Code p={2} borderRadius="md" display="inline-block">
                            0929292222
                          </Code>
                          <Text fontSize="sm" color={subtleText}>
                            {t("checkout.libyana.note", {
                              defaultValue:
                                "After payment, your enrollment will be confirmed by our team.",
                            })}
                          </Text>
                        </VStack>
                      </Box>
                    )}

                    {method === "madar" && (
                      <Box p={4} border="1px solid" borderColor={brand} borderRadius="md">
                        <VStack align="start" gap={2}>
                          <Heading size="sm">
                            {t("checkout.madar.title", { defaultValue: "Pay with Madar Balance" })}
                          </Heading>
                          <Text>
                            {t("checkout.madar.instructions", {
                              defaultValue: "Send the payment to the following number:",
                            })}
                          </Text>
                          <Code p={2} borderRadius="md" display="inline-block">
                            0919090909
                          </Code>
                          <Text fontSize="sm" color={subtleText}>
                            {t("checkout.madar.note", {
                              defaultValue:
                                "After payment, your enrollment will be confirmed by our team.",
                            })}
                          </Text>
                        </VStack>
                      </Box>
                    )}
                  </VStack>

                  {/* VIP upsell (kept inline for desktop view) */}
                  {isMdUp && !tier?.isVipProduct && renderVipUpsell("inline")}

                  {/* Promo block:
                      - Desktop: keep here.
                      - Mobile: rendered later at page footer. */}
                  {isMdUp && renderPromoBlock("inline")}

                  {/* Actions (desktop only) */}
                  {isMdUp && (
                    <HStack mt={6} gap={3} flexWrap="wrap">
                      <Button
                        onClick={startCheckout}
                        isLoading={loading}
                        disabled={!tierId || alreadyEnrolled}
                        variant="solid"
                        bg="#b7a27d"
                        w={{ base: "100%", sm: "auto" }}
                      >
                        {t("checkout.actions.complete", { defaultValue: "Complete Purchase" })}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        borderColor={brand}
                        color="inherit"
                        _hover={{ bg: "#b7a27d" }}
                        w={{ base: "100%", sm: "auto" }}
                      >
                        {t("checkout.actions.back", { defaultValue: "Back" })}
                      </Button>
                    </HStack>
                  )}
                </Box>
              )}

              {/* Free path */}
              {isZeroDue && (
                <HStack gap={3} flexWrap="wrap">
                  <Button
                    onClick={enrollFree}
                    isLoading={loading}
                    disabled={!tierId || alreadyEnrolled}
                    variant="solid"
                    bg={brand}
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    w={{ base: "100%", sm: "auto" }}
                  >
                    {freeLabel}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    borderColor={brand}
                    color="inherit"
                    _hover={{ bg: "#b7a27d" }}
                    w={{ base: "100%", sm: "auto" }}
                  >
                    {t("checkout.actions.back", { defaultValue: "Back" })}
                  </Button>
                </HStack>
              )}
            </VStack>
          </GridItem>

          {/* Right: Order summary */}
          <GridItem minW={0}>
            <Box
              borderWidth={1}
              borderColor={cardBorder}
              bg="bg.surface"
              borderRadius="xl"
              p={{ base: 4, md: 5 }}
              boxShadow="md"
              position={{ base: "static", md: "sticky" }}
              top={{ md: 4 }}
              w="full"
              minW={0}
            >
              <Heading size="md" mb={4}>
                {t("checkout.summary.title", { defaultValue: "Order Summary" })}
              </Heading>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between" align="start" minW={0}>
                  <Box minW={0}>
                    <Text fontWeight={600} noOfLines={1}>
                      {tier?.name || t("checkout.summary.course", { defaultValue: "Course" })}
                    </Text>
                    <Text fontSize="sm" noOfLines={3}>
                      {tier?.description}
                    </Text>
                  </Box>
                  <Text fontWeight={700} textAlign="right" flexShrink={0} color="#b7a27d">
                    {isFree ? (
                      freeLabel
                    ) : showLYD ? (
                      savedUsd > 0 ? (
                        <>
                          <s>{baseLyd} LYD</s> {effectiveLyd} LYD
                        </>
                      ) : (
                        `${baseLyd} LYD`
                      )
                    ) : savedUsd > 0 ? (
                      <>
                        <s>${baseUsd}</s> ${effectiveUsd}
                      </>
                    ) : (
                      `$${baseUsd || ""}`
                    )}
                  </Text>
                </HStack>

                <Box h="1px" bg="bg.surface" />

                {/* Benefits */}
                <VStack align="start" gap={1}>
                  <Text>
                    •{" "}
                    {t("checkout.benefits.certificate", {
                      defaultValue: "You’ll receive a certificate of achievement",
                    })}
                  </Text>
                  <Text>
                    •{" "}
                    {t("checkout.benefits.lifetime", {
                      defaultValue: "Lifetime access to all tiers",
                    })}
                  </Text>
                  {isAdvancedTier && (
                    <Text>
                      •{" "}
                      {t("checkout.benefits.vipSignals", {
                        defaultValue: "+ our Telegram VIP signals group",
                      })}
                    </Text>
                  )}
                  <Text>
                    •{" "}
                    {t("checkout.benefits.brokerBonus", {
                      defaultValue:
                        "Join our certified broker and enjoy a complimentary 50–100% bonus on your deposits",
                    })}
                  </Text>
                </VStack>

                <Box h="1px" bg="bg.surface" />

                {/* VIP add-on (summary) */}
                {!tier?.isVipProduct && vipTelegram && (
                  <>
                    <HStack justify="space-between">
                      <Text color="#b7a27d">
                        {t("checkout.addons.vip.title", { defaultValue: "VIP Telegram (monthly)" })}
                      </Text>
                      <Text fontWeight={700}>${vipPriceUsd || 20}</Text>
                    </HStack>
                    <Box h="1px" bg="bg.surface" />
                  </>
                )}

                {/* Promo line item (code + discount) */}
                {promoConfirmed && !isFree && (
                  <>
                    <HStack justify="space-between">
                      <Text>
                        {t("checkout.summary.promo", { defaultValue: "Promo" })}{" "}
                        <Text as="span" color={brand}>
                          ({promoCode})
                        </Text>
                      </Text>
                      <Text fontWeight={700} color="green.600">
                        {showLYD
                          ? `- ${Math.round((previewDiscount || savedUsd) * 8 * 100) / 100} LYD`
                          : `- $${(previewDiscount || savedUsd).toFixed(2)}`}
                      </Text>
                    </HStack>
                    <Box h="1px" bg="bg.surface" />
                  </>
                )}

                <HStack justify="space-between">
                  <Text>{t("checkout.summary.subtotal", { defaultValue: "Subtotal" })}</Text>
                  <Text fontWeight={700} color="#b7a27d">
                    {(() => {
                      if (isFree) return freeLabel;
                      if (showLYD) {
                        const dueLyd = Math.round((effectiveUsd + vipAddonUsd) * 8 * 100) / 100;
                        return `${dueLyd} LYD`;
                      }
                      return `$${(effectiveUsd + vipAddonUsd).toFixed(2)}`;
                    })()}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>{t("checkout.summary.total", { defaultValue: "Total" })}</Text>
                  <Text fontWeight={800} color="#b7a27d">
                    {(() => {
                      if (isFree) return freeLabel;
                      if (showLYD) {
                        const dueLyd = Math.round((effectiveUsd + vipAddonUsd) * 8 * 100) / 100;
                        return `${dueLyd} LYD`;
                      }
                      return `$${(effectiveUsd + vipAddonUsd).toFixed(2)}`;
                    })()}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* === MOBILE FOOTER CONTROLS (shown only on base) === */}
        {!isMdUp && !isFree && (
          <VStack align="stretch" gap={4} mt={4}>
            {/* VIP upsell before purchase on mobile */}
            {renderVipUpsell("footer")}

            {/* Promo at the end on mobile */}
            {renderPromoBlock("footer")}

            {/* Final actions at the very end on mobile */}
            <HStack mt={2} gap={3} flexWrap="wrap">
              <Button
                onClick={startCheckout}
                isLoading={loading}
                disabled={!tierId || alreadyEnrolled}
                variant="solid"
                bg="#b7a27d"
                w={{ base: "100%", sm: "auto" }}
              >
                {t("checkout.actions.complete", { defaultValue: "Complete Purchase" })}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                borderColor={brand}
                color="inherit"
                _hover={{ bg: "#b7a27d" }}
                w={{ base: "100%", sm: "auto" }}
              >
                {t("checkout.actions.back", { defaultValue: "Back" })}
              </Button>
            </HStack>
          </VStack>
        )}

        {/* Payment modal */}
        {paymentOpen && !isZeroDue && (
          <Box
            position="fixed"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            px={{ base: 3, md: 4 }}
            py={{ base: 3, md: 6 }}
            bg="rgba(0,0,0,0.55)"
          >
            <Box
              bg="bg.surface"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              maxW={{ base: "100%", sm: "540px" }}
              w="full"
              maxH="90vh"
              overflowY="auto"
              border="1px solid"
              borderColor="bg.surface"
              boxShadow="xl"
            >
              <Heading size="md" mb={4}>
                {t("checkout.modal.title", { defaultValue: "Payment Details" })}
              </Heading>

              <Text mb={2}>
                {t("checkout.modal.remaining", { defaultValue: "Time remaining:" })}{" "}
                <b>
                  {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
                </b>
              </Text>

              {method === "usdt" ? (
                <VStack align="stretch" gap={3}>
                  {address && (
                    <Box>
                      <Text fontSize="sm">
                        {t("checkout.modal.send_to", { defaultValue: "Send USDT (TRC20) to:" })}
                      </Text>
                      <HStack gap={2} align="stretch" mt={1} flexWrap="wrap">
                        <Code
                          p={2}
                          borderRadius="md"
                          display="block"
                          w={{ base: "100%", sm: "auto" }}
                          overflowWrap="anywhere"
                          wordBreak="break-all"
                        >
                          {address}
                        </Code>
                      </HStack>
                      <HStack gap={2} align="center" mt={2} flexWrap="wrap">
                        <Button
                          variant="solid"
                          bg={brand}
                          _hover={{ opacity: 0.9 }}
                          onClick={() => copy(address)}
                          w={{ base: "100%", sm: "auto" }}
                        >
                          {t("common.copy", { defaultValue: "Copy" })}
                        </Button>
                        {qrDataUrl && (
                          <a
                            href={qrDataUrl}
                            download="usdt-address-qr.png"
                            style={{ width: "100%" }}
                          >
                            <Button
                              variant="solid"
                              bg={brand}
                              color="white"
                              _hover={{ opacity: 0.9 }}
                              w={{ base: "100%", sm: "auto" }}
                            >
                              {t("common.download_qr", { defaultValue: "Download QR" })}
                            </Button>
                          </a>
                        )}
                      </HStack>
                      {qrDataUrl && (
                        <Box mt={3} textAlign="center">
                          <img
                            src={qrDataUrl}
                            alt="USDT Address QR"
                            style={{
                              width: "180px",
                              maxWidth: "100%",
                              height: "auto",
                              margin: "0 auto",
                            }}
                          />
                          <Text fontSize="xs" color={subtleText} mt={1}>
                            {t("checkout.modal.scan_qr", { defaultValue: "Scan to pay" })}
                          </Text>
                        </Box>
                      )}
                      {amount ? (
                        <Text fontSize="sm" color={subtleText} mt={2}>
                          {t("checkout.modal.amount", { defaultValue: "Amount (approx):" })}{" "}
                          {amount} USDT
                        </Text>
                      ) : null}
                    </Box>
                  )}

                  <Text fontSize="sm">
                    {t("checkout.modal.txid_prompt", {
                      defaultValue: "Enter your transaction hash (TXID) after sending the USDT.",
                    })}
                  </Text>
                  <Input
                    placeholder={t("checkout.modal.txid_ph", { defaultValue: "Transaction hash" })}
                    value={txnHash}
                    onChange={(e) => setTxnHash(e.target.value)}
                    w="full"
                  />

                  {purchaseStatus && (
                    <Text fontSize="sm">
                      {t("checkout.modal.status", { defaultValue: "Current status:" })}{" "}
                      <b>{purchaseStatus}</b>
                    </Text>
                  )}
                  {proofError && (
                    <Box
                      p={2}
                      border="1px solid"
                      borderColor="red.300"
                      color="red.700"
                      borderRadius="md"
                    >
                      {proofError}
                    </Box>
                  )}
                  {proofSubmitted && purchaseStatus !== "CONFIRMED" && (
                    <Text fontSize="sm" color={subtleText}>
                      {t("checkout.modal.verifying", {
                        defaultValue:
                          "We are verifying your transaction. This can take a few minutes.",
                      })}
                    </Text>
                  )}
                </VStack>
              ) : (
                <VStack align="stretch" gap={3}>
                  <Text fontSize="sm">
                    {t("checkout.modal.phone_prompt", {
                      defaultValue: "Enter the phone number you sent the balance from.",
                    })}
                  </Text>
                  <Input
                    placeholder={method === "libyana" ? "092xxxxxxx" : "091xxxxxxx"}
                    value={fromPhone}
                    onChange={(e) => setFromPhone(e.target.value)}
                    w="full"
                  />
                  {purchaseStatus && (
                    <Text fontSize="sm">
                      {t("checkout.modal.status", { defaultValue: "Current status:" })}{" "}
                      <b>{purchaseStatus}</b>
                    </Text>
                  )}
                  {proofError && (
                    <Box
                      p={2}
                      border="1px solid"
                      borderColor="red.300"
                      color="red.700"
                      borderRadius="md"
                    >
                      {proofError}
                    </Box>
                  )}
                  {proofSubmitted && purchaseStatus !== "CONFIRMED" && (
                    <Text fontSize="sm" color={subtleText}>
                      {t("checkout.modal.awaiting", {
                        defaultValue:
                          "Awaiting manual confirmation from admin. You will receive access once verified.",
                      })}
                    </Text>
                  )}
                </VStack>
              )}

              <HStack justify="flex-end" mt={6} gap={3} flexWrap="wrap">
                <Button
                  variant="solid"
                  bg="red"
                  onClick={() => setPaymentOpen(false)}
                  w={{ base: "100%", sm: "auto" }}
                >
                  {t("checkout.modal.close", { defaultValue: "Close" })}
                </Button>
                <Button
                  variant="solid"
                  bg="green"
                  _hover={{ opacity: 0.9 }}
                  onClick={submitProof}
                  isLoading={!!proofSubmitting}
                  w={{ base: "100%", sm: "auto" }}
                >
                  {t("checkout.modal.paid", { defaultValue: "I've Paid" })}
                </Button>
              </HStack>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Checkout;
