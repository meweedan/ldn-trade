import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, useDisclosure, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";

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

const EnrollmentCelebration: React.FC = () => {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [current, setCurrent] = React.useState<{ id: string; tierId?: string; tierName?: string } | null>(null);

  const trigger = React.useCallback((purchase: any) => {
    setCurrent({ id: purchase.id, tierId: purchase.tier?.id, tierName: purchase.tier?.name });
    onOpen();
    const celebrated = new Set(getJson<string[]>(CELEBRATED_KEY, []));
    celebrated.add(purchase.id);
    setJson(CELEBRATED_KEY, Array.from(celebrated));
    // Remove from watch list if present
    const watch = new Set(getJson<string[]>(WATCH_KEY, []));
    if (watch.has(purchase.id)) {
      watch.delete(purchase.id);
      setJson(WATCH_KEY, Array.from(watch));
    }
  }, [onOpen]);

  // Polling for confirmations
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
        // Prefer purchases in the watch list to avoid celebrating historical ones
        const confirmed = data.filter((p: any) => String(p.status || "").toUpperCase() === "CONFIRMED");
        const watchedConfirmed = confirmed.find((p: any) => watch.has(p.id) && !celebrated.has(p.id));
        if (watchedConfirmed) {
          trigger(watchedConfirmed);
        } else {
          // Fallback: celebrate very recent confirmations not yet seen
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

  // Lightweight confetti effect using CSS-only falling emojis
  const Confetti: React.FC = () => {
    const pieces = Array.from({ length: 24 }).map((_, i) => i);
    return (
      <Box pointerEvents="none" position="absolute" inset={0} overflow="hidden">
        {pieces.map((i) => (
          <Box
            key={i}
            position="absolute"
            top="-10%"
            left={`${(i * 37) % 100}%`}
            animation={`fall ${2 + (i % 3)}s linear ${(i % 10) * 0.1}s 1`}
            fontSize="20px"
          >
            🎉
          </Box>
        ))}
        <style>{`
          @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(140%) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </Box>
    );
  };

  const goToEnrolled = React.useCallback(() => {
    onClose();
    navigate("/enrolled");
  }, [navigate, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent position="relative" overflow="hidden">
        {isOpen && <Confetti />}
        <ModalHeader>{t("celebration.title", { defaultValue: "Enrollment Confirmed!" })}</ModalHeader>
        <ModalBody>
          <Box>
            <Text fontWeight={600} mb={2}>
              {t("celebration.body", {
                defaultValue: "Congratulations, you're enrolled into {{course_name}} successfully.",
                course_name: current?.tierName || t("learn.course_fallback", { defaultValue: "Course" }),
              })}
            </Text>
            <Text>
              {t("celebration.cta_hint", {
                defaultValue: "Click below to get started on your path to mastering trading.",
              })}
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="yellow" onClick={goToEnrolled}>
            {t("celebration.cta", { defaultValue: "Go to My Courses" })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnrollmentCelebration;
