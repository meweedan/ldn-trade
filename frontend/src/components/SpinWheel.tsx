import React from "react";
import { Box, Button, Heading, Text, VStack, HStack, useToast, Spinner } from "@chakra-ui/react";
import api from "../api/client";

const GOLD = "#b7a27d";

type SpinResult =
  | { type: "PROMO"; code: string; value: number; discountType: "PERCENT" }
  | { type: "VIP_MONTH"; message: string };

export default function SpinWheel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<SpinResult | null>(null);
  const toast = useToast();

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setResult(null);
      setSpinning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function spin() {
    try {
      setSpinning(true);
      setResult(null);
      const r = await api.post("/spin", {});
      const data = r?.data as SpinResult;
      setTimeout(() => {
        setResult(data);
        setSpinning(false);
      }, 1200); // tiny delay to simulate spin
    } catch {
      setSpinning(false);
      toast({ status: "error", title: "Failed to spin" });
    }
  }

  function content() {
    if (spinning) {
      return (
        <VStack py={8} gap={4} align="center">
          <Spinner size="xl" color={GOLD} />
          <Text>Spinning...</Text>
        </VStack>
      );
    }
    if (!result) {
      return (
        <VStack py={6} gap={4} align="center">
          <Text>Try your luck and win a promo code or 1 month VIP access!</Text>
          <Button onClick={spin} bg={GOLD} color="black" _hover={{ opacity: 0.9 }}>
            Spin Now
          </Button>
        </VStack>
      );
    }
    if (result.type === "PROMO") {
      return (
        <VStack py={6} gap={3} align="center">
          <Heading size="md">You won {result.value}% off!</Heading>
          <HStack>
            <Text fontWeight="bold">Code:</Text>
            <Box px={2} py={1} borderRadius="md" bg={GOLD} color="black" fontWeight="bold">
              {result.code}
            </Box>
          </HStack>
          <Text>Use it at checkout.</Text>
        </VStack>
      );
    }
    return (
      <VStack py={6} gap={3} align="center">
        <Heading size="md">VIP Month!</Heading>
        <Text>Congrats! Create an account to claim your VIP access.</Text>
      </VStack>
    );
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={999999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
      />
      
      {/* Modal Content */}
      <Box
        position="relative"
        bg="white"
        color="black"
        borderRadius="lg"
        boxShadow="2xl"
        maxW="md"
        w="90%"
        p={6}
        onClick={(e) => e.stopPropagation()}
        sx={{
          _dark: { bg: "gray.800", color: "white" }
        }}
      >
        {/* Close Button */}
        <Button
          position="absolute"
          top={2}
          right={2}
          size="sm"
          variant="ghost"
          onClick={onClose}
          isDisabled={spinning}
        >
          ✕
        </Button>

        {/* Header */}
        <Heading size="md" mb={4}>Spin & Win</Heading>

        {/* Content */}
        {content()}

        {/* Footer */}
        <Box mt={4} textAlign="center">
          <Button variant="ghost" onClick={onClose} isDisabled={spinning}>
            Close
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
