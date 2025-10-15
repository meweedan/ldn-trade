import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useDisclosure,
  Box,
  HStack,
  VStack,
  Divider,
  Badge,
  Icon,
  keyframes,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import Confetti from "./Confetti";
import { CheckCircle2, Send } from "lucide-react";

// LocalStorage helpers
const getJson = <T,>(k: string, def: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
};
const setJson = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

const CELEBRATED_KEY = "celebratedPurchaseIds"; // string[]
const WATCH_KEY = "watchPurchaseIds"; // string[] set by checkout after proof submit

const GOLD = "#b7a27d";

// Tiny helpers for luxe vibes
const shine = keyframes`
  0% { transform: translateX(-120%); opacity: 0.0; }
  20% { opacity: 0.45; }
  100% { transform: translateX(140%); opacity: 0; }
`;

const EnrollmentCelebration: React.FC = () => {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [current, setCurrent] = React.useState<{
    id: string;
    tierId?: string;
    tierName?: string;
  } | null>(null);
  const [vipSelected, setVipSelected] = React.useState(false);

  // VIP window locals
  const [vipStart, setVipStart] = React.useState<string | null>(null);
  const [vipEnd, setVipEnd] = React.useState<string | null>(null);

  // Telegram handle (env)
  const tgHandle = process.env.REACT_APP_TELEGRAM_HANDLE || "";
  const tgLink = React.useMemo(
    () => (tgHandle ? `https://t.me/${tgHandle}` : "https://t.me/"),
    [tgHandle]
  );

  // URL param (optional)
  const vipParam = React.useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get("vip");
    } catch {
      return null;
    }
  }, []);

  // If returned from VIP checkout with vip=1, auto-open & persist/activate VIP
  React.useEffect(() => {
    if (vipParam === "1" && !isOpen) {
      setVipSelected(true);
      if (!current) setCurrent({ id: "vip" });
      onOpen();
      // Persist server-side VIP access
      (async () => {
        try {
          await api.post("/community/vip/activate", {});
        } catch {}
      })();
      try {
        const key = "vipSubscription";
        const raw = localStorage.getItem(key);
        let startIso: string | null = null;
        let endIso: string | null = null;
        if (raw) {
          const parsed = JSON.parse(raw);
          startIso = parsed?.startIso || null;
          endIso = parsed?.endIso || null;
        }
        const now = new Date();
        if (!startIso) startIso = now.toISOString();
        if (!endIso) {
          const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          endIso = end.toISOString();
        }
        localStorage.setItem(key, JSON.stringify({ startIso, endIso }));
        setVipStart(startIso);
        setVipEnd(endIso);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vipParam, isOpen]);

  // Load persisted VIP window if any
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("vipSubscription");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.startIso) setVipStart(parsed.startIso);
        if (parsed?.endIso) setVipEnd(parsed.endIso);
      }
    } catch {}
  }, []);

  const trigger = React.useCallback(
    (purchase: any) => {
      const preferInline = localStorage.getItem("preferInlineCelebrate") === "1";
      setCurrent({ id: purchase.id, tierId: purchase.tier?.id, tierName: purchase.tier?.name });

      if (preferInline) {
        try {
          localStorage.setItem("celebrationInlineOpen", "1");
          localStorage.setItem(
            "celebrationCurrent",
            JSON.stringify({
              id: purchase.id,
              tierId: purchase.tier?.id,
              tierName: purchase.tier?.name,
            })
          );
          localStorage.setItem("disableModalCelebrate", "1");
        } catch {}
      } else {
        onOpen();
      }

      const celebrated = new Set(getJson<string[]>(CELEBRATED_KEY, []));
      celebrated.add(purchase.id);
      setJson(CELEBRATED_KEY, Array.from(celebrated));

      // Remove from watch list if present
      const watch = new Set(getJson<string[]>(WATCH_KEY, []));
      if (watch.has(purchase.id)) {
        watch.delete(purchase.id);
        setJson(WATCH_KEY, Array.from(watch));
      }

      // Pull VIP intent chosen during checkout extras (if any)
      try {
        const extras = getJson<Record<string, any>>("celebrationExtras", {});
        setVipSelected(!!extras[purchase.id]?.vipTelegram);
      } catch {}
    },
    [onOpen]
  );

  // Polling for confirmations (unchanged)
  React.useEffect(() => {
    let mounted = true;
    let timer: any;

    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          timer = setTimeout(poll, 15000);
          return;
        }
        const watch = new Set(getJson<string[]>(WATCH_KEY, []));
        if (!watch.size) {
          timer = setTimeout(poll, 60000);
          return;
        }
        const data = await getMyPurchases({ force: true });
        if (!mounted || !Array.isArray(data)) {
          timer = setTimeout(poll, 15000);
          return;
        }
        const celebrated = new Set(getJson<string[]>(CELEBRATED_KEY, []));
        const confirmed = data.filter(
          (p: any) => String(p.status || "").toUpperCase() === "CONFIRMED"
        );
        const watchedConfirmed = confirmed.find(
          (p: any) => watch.has(p.id) && !celebrated.has(p.id)
        );
        if (watchedConfirmed) {
          trigger(watchedConfirmed);
        } else {
          const recent = confirmed.find((p: any) => !celebrated.has(p.id));
          if (recent) trigger(recent);
        }
      } catch {
        // ignore
      } finally {
        timer = setTimeout(poll, 15000);
      }
    };

    poll();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [trigger]);

  const goToEnrolled = React.useCallback(() => {
    onClose();
    navigate("/enrolled");
  }, [navigate, onClose]);

  const startVip = React.useCallback(async () => {
    try {
      if (!current?.id) return;
      const resp = await api.post("/payments/vip", { purchaseId: current.id });
      const url = resp?.data?.url as string | undefined;
      if (url) window.location.href = url;
    } catch {}
  }, [current?.id]);

  // --- UI ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      {/* Soft dim overlay */}
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(6px)" />

      <ModalContent
        position="relative"
        overflow="hidden"
        bg="rgba(16,16,16,0.75)"
        backdropFilter="blur(12px)"
        borderRadius="2xl"
        px={{ base: 1, md: 2 }}
        py={{ base: 0, md: 0 }}
        // Gold gradient rim
        border="1px solid"
        borderColor="transparent"
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          padding: "1px",
          borderRadius: "inherit",
          background: `linear-gradient(135deg, rgba(183,162,125,0.8), rgba(255,255,255,0.1))`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
        }}
        boxShadow="0 20px 60px rgba(0,0,0,0.45)"
      >
        {/* celebratory confetti */}
        {isOpen && (
          <Confetti
            count={48}
            emojis={["🎉", "♾️"]}
            durationRangeSec={[1.6, 3.6]}
            sizeRangePx={[18, 30]}
          />
        )}

        {/* subtle sheen sweep */}
        <Box
          position="absolute"
          top={0}
          left={0}
          h="100%"
          w="35%"
          bg="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)"
          transform="skewX(-15deg)"
          animation={`${shine} 2200ms ease-out 500ms 1`}
          pointerEvents="none"
        />

        <ModalHeader px={{ base: 5, md: 6 }} pt={{ base: 5, md: 6 }} pb={2}>
          <HStack spacing={3}>
            <Box
              bg="rgba(183,162,125,0.22)"
              border="1px solid"
              borderColor="rgba(183,162,125,0.55)"
              rounded="full"
              p="6px"
              display="grid"
              placeItems="center"
            >
              <Icon as={CheckCircle2} color={GOLD} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight={800} color={GOLD} lineHeight="1.2">
                {t("celebration.title", { defaultValue: "Enrollment Confirmed!" })}
              </Text>
              {current?.tierName && (
                <Badge mt="2px" colorScheme="yellow" variant="subtle">
                  {current.tierName}
                </Badge>
              )}
            </VStack>
          </HStack>
        </ModalHeader>

        <ModalBody px={{ base: 5, md: 6 }} pb={4}>
          <VStack align="stretch" spacing={3}>
            <Text fontWeight={600} color="whiteAlpha.900">
              {t("celebration.body", {
                defaultValue: "Congratulations, you're enrolled into {{course_name}} successfully.",
                course_name:
                  current?.tierName || t("learn.course_fallback", { defaultValue: "Course" }),
              })}
            </Text>

            <Text color="whiteAlpha.800">
              {t("celebration.cta_hint", {
                defaultValue: "Click below to get started on your path to mastering trading.",
              })}
            </Text>

            {/* VIP section — shows JOIN if the user opted in */}
            <Box
              mt={3}
              p={3}
              borderRadius="lg"
              bg="rgba(255,255,255,0.04)"
              border="1px solid rgba(183,162,125,0.35)"
            >
              {vipSelected ? (
                <>
                  <HStack justify="space-between" align="start" mb={2}>
                    <VStack spacing={0} align="start">
                      <Text fontWeight={700} color={GOLD}>
                        {t("celebration.vip_ready", { defaultValue: "VIP unlocked" })}
                      </Text>
                      <Text fontSize="sm" color="whiteAlpha.800">
                        {t("celebration.vip_ready_desc", {
                          defaultValue:
                            "Join our VIP Telegram to access signals, live sessions and premium chat.",
                        })}
                      </Text>
                    </VStack>
                    <Badge variant="outline" colorScheme="yellow">
                      VIP
                    </Badge>
                  </HStack>

                  <HStack gap={3} wrap="wrap">
                    <Button
                      onClick={() => window.open(tgLink, "_blank", "noreferrer")}
                      bg={GOLD}
                      color="black"
                      leftIcon={<Icon as={Send} />}
                      _hover={{ filter: "brightness(0.95)" }}
                    >
                      {t("celebration.vip_join", { defaultValue: "Open VIP Telegram" })}
                    </Button>

                    {(vipStart || vipEnd) && (
                      <Box fontSize="xs" color="whiteAlpha.800">
                        {vipStart && <Text>Start: {new Date(vipStart).toLocaleString()}</Text>}
                        {vipEnd && <Text>Renews: {new Date(vipEnd).toLocaleString()}</Text>}
                      </Box>
                    )}
                  </HStack>
                </>
              ) : (
                <>
                  <Text fontWeight={700} color={GOLD} mb={1}>
                    {t("celebration.vip_offer", {
                      defaultValue: "Add VIP Telegram monthly subscription now:",
                    })}
                  </Text>
                  <Button
                    onClick={startVip}
                    bg={GOLD}
                    color="black"
                    leftIcon={<Icon as={Send} />}
                    _hover={{ filter: "brightness(0.95)" }}
                  >
                    {t("celebration.vip_subscribe", { defaultValue: "Subscribe to VIP" })}
                  </Button>
                </>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <Divider opacity={0.15} />

        <ModalFooter px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
          <HStack w="100%" justify="flex-end" spacing={3}>
            <Button
              variant="ghost"
              color="whiteAlpha.800"
              _hover={{ bg: "whiteAlpha.100" }}
              onClick={onClose}
            >
              {t("common.close", { defaultValue: "Close" })}
            </Button>
            <Button
              bg={GOLD}
              color="black"
              _hover={{ filter: "brightness(0.95)" }}
              onClick={goToEnrolled}
            >
              {t("celebration.cta", { defaultValue: "Go to My Courses" })}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnrollmentCelebration;
