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
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import { getAllCountries, getDeviceCountryCode } from "../utils/countries";

type Method = "usdt" | "libyana" | "madar";

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
  const [user, setUser] = React.useState<any | null>(null);
  const [country, setCountry] = React.useState("");
  const [courseLanguage, setCourseLanguage] = React.useState("en");
  const [promoCode, setPromoCode] = React.useState<string>("");
  const [refCode, setRefCode] = React.useState<string>("");
  const [alreadyEnrolled, setAlreadyEnrolled] = React.useState(false);

  // Preview pricing
  const [previewAmount, setPreviewAmount] = React.useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewDiscount, setPreviewDiscount] = React.useState<number | null>(null);
  const [previewBase, setPreviewBase] = React.useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewPath, setPreviewPath] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  // Payment modal state
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentExpiresAt, setPaymentExpiresAt] = React.useState<number | null>(null);
  const [remainingSec, setRemainingSec] = React.useState(0);
  const [fromPhone, setFromPhone] = React.useState("");
  const [txnHash, setTxnHash] = React.useState("");
  const [proofSubmitting, setProofSubmitting] = React.useState(false);
  const [proofError, setProofError] = React.useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = React.useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = React.useState(false);

  // USDT QR code
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  // Premium theming via tokens only (no hooks)
  const brand = "#b7a27d";
  const cardBorder = "border.default";
  const subtleText = "text.muted";
  const selectBorder = "border.default";
  const selectFocus = "border.focus";

  const openPaymentModal = React.useCallback(() => {
    const expires = Date.now() + 30 * 60 * 1000;
    setPaymentExpiresAt(expires);
    setPaymentOpen(true);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const [me, tResp, mine] = await Promise.all([
          api.get("/users/me").catch(() => ({ data: null })),
          tierId ? api.get(`/courses/${tierId}`) : Promise.resolve({ data: null }),
          getMyPurchases({ ttlMs: 10 * 60 * 1000 }).catch(() => [] as any[]),
        ]);
        setUser((me as any).data);
        setTier((tResp as any).data);
        const list: any[] = Array.isArray(mine) ? (mine as any[]) : [];
        const enrolled = list.some(
          (p) => String(p.status || "").toUpperCase() === "CONFIRMED" && ((p.tier && p.tier.id === tierId) || p.tierId === tierId)
        );
        setAlreadyEnrolled(enrolled);
      } catch {}
    })();
  }, [tierId]);

  // Persist referral
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

  // Purchase status helper
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

  // Start polling after proof submitted
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

  // Start checkout: opens modal and starts 30-min window immediately for non-redirect methods
  const startCheckout = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = { tierId, method, purchaseId, country, courseLanguage };
      if (promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();
      const resp = await api.post("/purchase/create", payload);
      const provider = (resp.data?.provider || "").toString().toLowerCase();

      if (resp.data?.purchaseId && !purchaseId) {
        setPurchaseId(resp.data.purchaseId as string);
        // Mark this purchase to be watched by celebration overlay
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

      if (provider === "usdt") {
        const addr = resp.data?.address || null;
        const amt =
          typeof resp.data?.amount === "number"
            ? resp.data.amount
            : Number(resp.data?.amount) || null;
        // Prefer previewed discounted amount if available
        const finalAmt = previewAmount != null ? previewAmount : amt;
        setAddress(addr);
        setAmount(finalAmt);
        // generate QR immediately for USDT
        if (addr) {
          const { default: QRCode } = await import("qrcode");
          const dataUrl = await QRCode.toDataURL(addr, { margin: 1, scale: 5 });
          setQrDataUrl(dataUrl);
        } else {
          setQrDataUrl(null);
        }
        openPaymentModal(); // starts 30min
      } else if (provider === "libyana" || provider === "madar") {
        openPaymentModal(); // starts 30min too
      } else if (provider === "free") {
        // Immediately watch and navigate; overlay will celebrate on next poll
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
    promoCode,
    refCode,
    openPaymentModal,
    navigate,
    previewAmount,
  ]);

  // Promo preview
  // Promo preview — TRUST the API, don't infer
  const confirmPromo = React.useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      if (!tierId) throw new Error("Missing course");
      const payload: any = {
        tierId,
        method, // the backend prices per method (ok to pass)
        country,
        courseLanguage,
        preview: true, // <<< critical
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
      // If a promo was entered but no discount applied, surface a friendly message
      if (promoCode && validBase != null && (validDue == null || Math.abs(validDue - validBase) < 1e-6)) {
        setPreviewError(
          t("checkout.promo.not_applied", {
            defaultValue: "This promo didn’t apply (invalid, expired, not applicable, or per-user limit).",
          })
        );
      }
    } catch (e: any) {
      setPreviewError(e?.response?.data?.message || e?.message || "Failed to preview");
      setPreviewAmount(null);
      setPreviewDiscount(null);
      setPreviewBase(null);
      setPreviewPath(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [tierId, method, country, courseLanguage, promoCode, refCode, t]);

  // Auto-preview when promo code changes (debounced)
  React.useEffect(() => {
    if (!promoCode) {
      setPreviewAmount(null);
      setPreviewDiscount(null);
      setPreviewBase(null);
      setPreviewPath(null);
      setPreviewError(null);
      return;
    }
    const id = setTimeout(() => {
      confirmPromo();
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCode, method, country, courseLanguage, tierId]);

  // Free enroll
  const enrollFree = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!tierId) throw new Error("Missing course");
      const payload: any = { tierId, method: "free" };
      if (promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();
      await api.post("/purchase/create", payload);
      navigate("/enrolled");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  }, [tierId, navigate, promoCode, refCode]);

  // Submit proof
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
        // Watch this purchase for celebration when confirmed
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
  const baseUsd = previewBase != null ? previewBase : usdPrice; // prefer server base after preview
  const baseLyd = Math.round(baseUsd * 8 * 100) / 100;

  // Effective price after a confirmed preview
  const effectiveUsd = previewAmount != null ? previewAmount : baseUsd;
  const effectiveLyd = Math.round(effectiveUsd * 8 * 100) / 100;
  const savedUsd = Math.max(0, baseUsd - effectiveUsd);

  const lang = String(i18n?.language || "en").toLowerCase();
  const freeLabel = t("checkout.free", {
    defaultValue: lang.startsWith("ar") ? "مجاني" : lang.startsWith("fr") ? "Gratuit" : "Free",
  });

  // All countries (localized), device-first
  const countryOptions = React.useMemo(() => {
    return getAllCountries(i18n?.language || "en", deviceCode);
  }, [i18n?.language, deviceCode]);

  // Compute device code on client, optionally preselect
  React.useEffect(() => {
    const dc = getDeviceCountryCode();
    setDeviceCode(dc);
    if (!country && dc) setCountry(dc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 30-min countdown tick
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

  // Advanced tier?
  const isAdvancedTier = React.useMemo(() => {
    const name = String(tier?.name || "").toLowerCase();
    const level = String(tier?.level || "").toLowerCase();
    return name.includes("advanced") || level.includes("advanced");
  }, [tier?.name, tier?.level]);

  // Copy helpers
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert(t("common.copied", { defaultValue: "Copied!" }));
    } catch {}
  };

  return (
    <Box py={{ base: 6, md: 10 }} color="text.primary">
      <Container maxW="6xl">
        {/* Premium header (opaque, mobile friendly) */}
        <Box
          border="1px solid"
          borderColor={cardBorder}
          bg="bg.surface"
          borderRadius="2xl"
          px={{ base: 4, md: 8 }}
          py={{ base: 5, md: 7 }}
          mb={6}
          boxShadow="lg"
        >
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="lg">{t("checkout.title", { defaultValue: "Checkout" })}</Heading>
              <Text color={subtleText}>
                {t("checkout.subtitle", {
                  defaultValue: "Secure your seat with fast, flexible payment methods.",
                })}
              </Text>
            </VStack>
            {tier?.level && (
              <Badge colorScheme="yellow" fontSize="sm">
                {tier.level}
              </Badge>
            )}
          </HStack>
        </Box>

        {!tierId && (
          <Box p={3} border="1px solid" borderColor={brand} borderRadius="md" mb={6} bg="bg.surface">
            <Text>
              {t("checkout.no_tier", {
                defaultValue: "No course tier selected. Go back and choose a course.",
              })}
            </Text>
          </Box>
        )}
        {alreadyEnrolled && (
          <Box p={3} border="1px solid" borderColor="green.300" borderRadius="md" mb={6} bg="bg.surface" color="green.700">
            {t("checkout.already_enrolled", { defaultValue: "You already own this course. Enjoy learning!" })}
            <Button ml={3} size="sm" onClick={() => navigate("/enrolled")}>
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
            mb={6}
          >
            {error}
          </Box>
        )}

        <Grid
          templateColumns={{ base: "1fr", md: "2fr 1fr" }}
          gap={{ base: 4, md: 8 }}
          alignItems="start"
        >
          {/* Left */}
          <GridItem>
            <VStack align="stretch" gap={{ base: 4, md: 6 }}>
              {/* Customer details */}
              <Box
                borderWidth={1}
                borderColor={cardBorder}
                bg="bg.surface"
                borderRadius="xl"
                p={{ base: 4, md: 5 }}
                boxShadow="md"
              >
                <Heading size="md" mb={4}>
                  {t("checkout.customer.details", { defaultValue: "Customer Details" })}
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.full_name", { defaultValue: "Full Name" })}
                    </Text>
                    <Input
                      defaultValue={user?.name || ""}
                      placeholder={t("checkout.placeholders.name", { defaultValue: "Your name" })}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.email", { defaultValue: "Email" })}
                    </Text>
                    <Input
                      defaultValue={user?.email || ""}
                      placeholder="you@example.com"
                      type="email"
                    />
                  </Box>
                  <Box>
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
                  <Box>
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
              {!isFree && (
                <Box
                  borderWidth={1}
                  borderColor={cardBorder}
                  bg="bg.surface"
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                  boxShadow="md"
                >
                  <Heading size="md" mb={4}>
                    {t("checkout.payment.title", { defaultValue: "Payment Method" })}
                  </Heading>

                  <VStack align="stretch" gap={3}>
                    <HStack gap={3} flexWrap="wrap">
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
                        <HStack gap={3} flexWrap="wrap">
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
                        <HStack gap={3} flexWrap="wrap">
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

                  {/* Promo */}
                  <Box mt={4}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.promo.label", { defaultValue: "Promo Code" })}
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t("checkout.promo.placeholder", {
                          defaultValue: "Enter code (optional)",
                        })}
                      />
                      <Button
                        onClick={confirmPromo}
                        isLoading={previewLoading}
                        variant="outline"
                        borderColor={brand}
                        color="inherit"
                        _hover={{ bg: "#b7a27d" }}
                      >
                        {t("checkout.promo.confirm", { defaultValue: "Confirm Promo" })}
                      </Button>
                    </HStack>
                    {previewError && (
                      <Text mt={2} color="red.500" fontSize="sm">
                        {previewError}
                      </Text>
                    )}
                    {previewAmount != null && (
                      <Text mt={2} fontWeight={600}>
                        {t("checkout.promo.due", { defaultValue: "You pay:" })}{" "}
                        {showLYD ? `${effectiveLyd} LYD` : `$${effectiveUsd}`}
                        {savedUsd > 0 ? (
                          <Text as="span" ml={2} color={subtleText} fontWeight={400}>
                            ({t("checkout.promo.saved", { defaultValue: "saved" })} ${savedUsd})
                          </Text>
                        ) : null}
                      </Text>
                    )}
                  </Box>

                  {/* Actions */}
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
                </Box>
              )}

              {/* Free path */}
              {isFree && (
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
          <GridItem>
            <Box
              borderWidth={1}
              borderColor={cardBorder}
              bg="bg.surface"
              borderRadius="xl"
              p={{ base: 4, md: 5 }}
              boxShadow="md"
              position="sticky"
              top={4}
            >
              <Heading size="md" mb={4}>
                {t("checkout.summary.title", { defaultValue: "Order Summary" })}
              </Heading>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text fontWeight={600}>
                      {tier?.name || t("checkout.summary.course", { defaultValue: "Course" })}
                    </Text>
                    <Text fontSize="sm" color={subtleText}>
                      {tier?.description}
                    </Text>
                  </Box>
                  <Text fontWeight={700}>
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

                <HStack justify="space-between">
                  <Text>{t("checkout.summary.subtotal", { defaultValue: "Subtotal" })}</Text>
                  <Text fontWeight={700}>
                    {isFree
                      ? freeLabel
                      : showLYD
                      ? `${effectiveLyd} LYD`
                      : `$${effectiveUsd || "-"}`}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>{t("checkout.summary.taxes", { defaultValue: "Taxes" })}</Text>
                  <Text fontWeight={700}>{isFree ? freeLabel : "$0"}</Text>
                </HStack>
                <Box h="1px" bg="bg.surface" />
                <HStack justify="space-between">
                  <Text>{t("checkout.summary.total", { defaultValue: "Total" })}</Text>
                  <Text fontWeight={800}>
                    {isFree
                      ? freeLabel
                      : showLYD
                      ? `${effectiveLyd} LYD`
                      : `$${effectiveUsd || "-"}`}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* Payment modal (opaque, mobile-friendly) */}
        {paymentOpen && !isFree && (
          <Box
            position="fixed"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            px={4}
          >
            <Box
              bg="bg.surface"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              maxW="lg"
              w="full"
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
                      <HStack gap={2} align="center" mt={1}>
                        <Code
                          p={2}
                          borderRadius="md"
                          display="block"
                          w={{ base: "100%", sm: "auto" }}
                        >
                          {address}
                        </Code>
                        </HStack>
                        <HStack gap={2} align="center" mt={1}>
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
                          <a href={qrDataUrl} download="usdt-address-qr.png">
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
                            style={{ maxWidth: 180, margin: "0 auto" }}
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
                  borderColor={brand}
                  color="inherit"
                  _hover={{ bg: "#b7a27d" }}
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
