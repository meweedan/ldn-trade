import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  chakra,
  Heading,
  SimpleGrid,
  GridItem,
  Divider,
} from "@chakra-ui/react";
import GlassCard from "../components/GlassCard";
import { useColorMode } from "@chakra-ui/react";

const CSelect = chakra("select");
const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "";

type Role = "user";
type Country = { name: string; cca2: string; iddRoots: string[]; iddSuffixes: string[] };

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation() as any;
  const { colorMode } = useColorMode();

  // Common fields
  const [role] = useState<Role>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Extra fields
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Countries and phone
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // cca2 code
  const [dialCode, setDialCode] = useState<string>("");

  // OTP verification state
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Validate DOB (18 to 100 years)
      if (dob) {
        const birth = new Date(dob);
        const now = new Date();
        const ageMs = now.getTime() - birth.getTime();
        const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
        if (ageYears < 18) {
          setError(t("auth.error_underage") || "You must be at least 18 years old.");
          setLoading(false);
          return;
        }
        if (ageYears > 100) {
          setError(t("auth.error_overage") || "Please enter a valid date of birth.");
          setLoading(false);
          return;
        }
      }

      // Require phone OTP verification if phone is provided
      if (phone && !phoneVerified) {
        setError(t("auth.phone_verify_required") || "Please verify your phone via OTP.");
        setLoading(false);
        return;
      }

      const fullPhone = phone ? `${dialCode || ""}${phone}` : undefined;
      const payload: any = { name, email, password, role };
      if (selectedCountry) payload.nationality = selectedCountry;
      if (fullPhone) payload.phone = fullPhone;

      const { data } = await api.post("/auth/register", payload);
      const accessToken: string = data?.data?.accessToken || data?.accessToken || data?.token || "";
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
      }

      navigate("/courses");
    } catch (e: any) {
      const msgRaw = e?.response?.data?.message || "";
      const msg =
        msgRaw.includes("already") && msgRaw.toLowerCase().includes("email")
          ? t("auth.duplicate_email") || "Email already registered"
          : msgRaw || t("auth.register_error") || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const waLink = React.useMemo(() => {
    const base = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`
      : "https://wa.me/";
    return base;
  }, []);

  // Load all countries (name + dial code) from RestCountries
  React.useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
        const data = await resp.json();
        const mapped: Country[] = (data || [])
          .map((c: any) => {
            const root = c?.idd?.root || "";
            const suffixes = Array.isArray(c?.idd?.suffixes) ? c.idd.suffixes : [];
            return {
              name: c?.name?.common || c?.name?.official || "Unknown",
              cca2: c?.cca2 || "",
              iddRoots: root ? [root] : [],
              iddSuffixes: suffixes,
            } as Country;
          })
          .filter((c: Country) => !!c.name);
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Update dial code when nationality changes
  React.useEffect(() => {
    if (!selectedCountry) return;
    const c = countries.find((x) => x.cca2 === selectedCountry);
    if (!c) return;
    const root = c.iddRoots[0] || "";
    const firstSuffix = c.iddSuffixes[0] || "";
    const code = `${root}${firstSuffix}` || "";
    setDialCode(code);
  }, [selectedCountry, countries]);

  const sendOtp = async () => {
    setError(null);
    setOtpSent(false);
    setPhoneVerified(false);
    try {
      if (!dialCode || !phone) {
        setError(t("auth.phone_required") || "Please enter your phone number.");
        return;
      }
      setOtpSending(true);
      await api.post("/auth/otp/send", { phone: `${dialCode}${phone}` });
      setOtpSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || t("auth.otp_send_failed") || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    try {
      if (!otpCode) {
        setError(t("auth.otp_required") || "Enter the OTP code.");
        return;
      }
      setOtpVerifying(true);
      await api.post("/auth/otp/verify", { phone: `${dialCode}${phone}`, code: otpCode });
      setPhoneVerified(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || t("auth.otp_verify_failed") || "Failed to verify OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <Box color="text.primary" py={{ base: 8, md: 12 }}>
      <Container maxW="8xl" px={{ base: 4, md: 8 }}>
        <VStack align="stretch" gap={{ base: 6, md: 10 }}>
          <Box>
            <Heading as="h1" size="lg" mb={2}>
              {t("auth.create_account") || "Create account"}
            </Heading>
            <Text color="text.muted">
              {t("auth.create_account_sub") || "Join in a few quick steps."}
            </Text>
          </Box>

          <GlassCard style={{ width: "100%" }}>
            {error && (
              <Text mb={4} color="red.500">
                {error}
              </Text>
            )}

            <form onSubmit={onSubmit}>
              <VStack align="stretch" gap={{ base: 6, md: 8 }}>
                {/* ===== Section: Basic info ===== */}
                <Box>
                  <Heading as="h2" size="sm" mb={3}>
                    {t("auth.basic_info") || "Basic information"}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                    <GridItem borderRadius="md" px={3} py={2} borderColor="#b7a27d">
                      <Text fontSize="sm" mb={1} color="text.muted">
                        {t("auth.name")}
                      </Text>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={(t("auth.name_placeholder") as string) || "John Doe"}
                        required
                      />
                    </GridItem>

                    <GridItem borderRadius="md" px={3} py={2} borderColor="#b7a27d">
                      <Text fontSize="sm" mb={1} color="text.muted">
                        {t("auth.email")}
                      </Text>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={(t("auth.email_placeholder") as string) || "you@example.com"}
                        required
                      />
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <Text fontSize="sm" mb={1} color="text.muted">
                        {t("auth.password")}
                      </Text>
                      <HStack align="stretch">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={(t("auth.password_placeholder") as string) || "••••••••"}
                          required
                          borderRadius="md"
                          px={3}
                          py={2}
                          borderColor="#b7a27d"
                        />
                        <Button
                          variant="solid"
                          bg="#b7a27d"
                          onClick={() => setShowPassword((v) => !v)}
                          flexShrink={0}
                        >
                          {showPassword ? t("auth.hide") || "Hide" : t("auth.show") || "Show"}
                        </Button>
                      </HStack>
                    </GridItem>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* ===== Section: Nationality & Phone (with OTP) ===== */}
                <Box>
                  <Heading as="h2" size="sm" mb={3}>
                    {t("auth.contact_info") || "Contact information"}
                  </Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                    <GridItem borderRadius="md" px={3} py={2} borderColor="#b7a27d">
                      <Text fontSize="sm" mb={1}>
                        {t("auth.nationality") || "Nationality"}
                      </Text>
                      <CSelect
                        value={selectedCountry}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setSelectedCountry(e.target.value)
                        }
                        borderRadius="md"
                        px={3}
                        py={2}
                        maxW="250px"
                        bg={colorMode === "dark" ? "black" : "white"}
                        color={colorMode === "dark" ? "white" : "black"}
                        borderColor="#b7a27d"
                      >
                        <option value="">
                          {t("auth.nationality_placeholder") || "Select a country"}
                        </option>
                        {countries.map((c) => (
                          <option key={c.cca2} value={c.cca2}>
                            {c.name}
                          </option>
                        ))}
                      </CSelect>
                    </GridItem>

                    <GridItem borderRadius="md" px={3} py={2} borderColor="#b7a27d">
                      <Text fontSize="sm" mb={1}>
                        {t("auth.phone") || "Phone"}
                      </Text>
                      <HStack>
                        <CSelect
                          value={dialCode}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setDialCode(e.target.value)
                          }
                          minW={{ base: "40%", md: "36%" }}
                          borderRadius="md"
                          px={3}
                          py={2}
                          borderColor="#b7a27d"
                          bg={colorMode === "dark" ? "black" : "white"}
                          color={colorMode === "dark" ? "white" : "black"}
                        >
                          {(() => {
                            const c = countries.find((x) => x.cca2 === selectedCountry);
                            const root = c?.iddRoots?.[0] || "";
                            const suffixes = c?.iddSuffixes?.length ? c.iddSuffixes : [""];
                            const opts = suffixes.map((s) => `${root}${s || ""}`).filter(Boolean);
                            const unique = Array.from(new Set(opts));
                            return unique.length ? unique : ["+"];
                          })().map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </CSelect>

                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={(t("auth.phone_placeholder") as string) || "91 234 5678"}
                          borderRadius="md"
                          px={3}
                          py={2}
                          borderColor="#b7a27d"
                        />
                      </HStack>

                      <HStack mt={2} gap={2} flexWrap="wrap">
                        <Button
                          variant="solid"
                          bg="#b7a27d"
                          onClick={sendOtp}
                          isLoading={otpSending}
                          disabled={!dialCode || !phone}
                        >
                          {t("auth.send_otp") || "Send OTP"}
                        </Button>
                        <Input
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder={(t("auth.otp_placeholder") as string) || "Enter OTP"}
                          maxW="200px"
                          borderRadius="md"
                          borderColor="#b7a27d"
                        />
                        <Button
                          onClick={verifyOtp}
                          isLoading={otpVerifying}
                          bg="#b7a27d"
                          disabled={!otpCode}
                        >
                          {phoneVerified
                            ? t("auth.verified") || "Verified"
                            : t("auth.verify") || "Verify"}
                        </Button>
                        <Button
                          variant="solid"
                          bg="green"
                          onClick={() => window.open(waLink, "_blank", "noreferrer")}
                        >
                          {t("auth.open_whatsapp") || "Open WhatsApp"}
                        </Button>
                      </HStack>

                      {otpSent && !phoneVerified && (
                        <Text fontSize="xs" color="text.muted" mt={1}>
                          {t("auth.otp_sent") || "OTP sent. Please check your phone."}
                        </Text>
                      )}
                      {phoneVerified && (
                        <Text fontSize="xs" color="green.500" mt={1}>
                          {t("auth.phone_verified") || "Phone verified."}
                        </Text>
                      )}
                      <Text fontSize="xs" color="text.muted" mt={1}>
                        {t("auth.whatsapp_required") ||
                          "Your phone must be linked to WhatsApp to receive the OTP."}
                      </Text>
                    </GridItem>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* ===== Section: Additional details (optional) ===== */}
                {role === "user" && (
                  <Box>
                    <Heading as="h2" size="sm" mb={3}>
                      {t("auth.additional_info") || "Additional details"}
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                      <GridItem borderRadius="md" px={3} py={2} borderColor="#b7a27d">
                        <Text fontSize="sm" mb={1} color="text.muted">
                          {t("auth.dob") || "Date of birth"}
                        </Text>
                        <Input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          placeholder={t("auth.dob_placeholder") || "Date of birth"}
                        />
                      </GridItem>
                      <GridItem borderRadius="md" px={3} py={2} borderColor="#b7a27d">
                        <Text fontSize="sm" mb={1} color="text.muted">
                          {t("auth.gender") || "Gender"}
                        </Text>
                        <CSelect
                          value={gender}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setGender(e.target.value)
                          }
                          borderRadius="md"
                          px={3}
                          py={2}
                          bg={colorMode === "dark" ? "black" : "white"}
                          color={colorMode === "dark" ? "white" : "black"}
                          borderColor="#b7a27d"
                        >
                          <option value="">{t("common.select") || "Select"}</option>
                          <option value="male">{t("auth.gender_male") || "Male"}</option>
                          <option value="female">{t("auth.gender_female") || "Female"}</option>
                        </CSelect>
                      </GridItem>
                    </SimpleGrid>
                  </Box>
                )}

                {/* Submit button */}
                <HStack pt={2} justifyContent="center">
                  <Button
                    variant="solid"
                    bg="#b7a27d"
                    minW="200px"
                    color="black"
                    _hover={{ opacity: 0.9 }}
                    isDisabled={loading}
                    isLoading={loading}
                  >
                    {loading
                      ? t("auth.registering") || "Registering…"
                      : t("auth.create_account") || "Create account"}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </GlassCard>

          <Text color="text.muted" textAlign="center">
            {t("auth.already_have") || "Already have an account?"}{" "}
            <Link to="/auth/login">{t("auth.login") || "Log in"}</Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Register;
