import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Container, VStack, HStack, Heading, Text, Button, Spinner, Icon } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/react";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import { ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle, GraduationCap, Star } from "lucide-react";
import { useThemeMode } from "../themeProvider";

const Learn: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // tier id
  const navigate = useNavigate();
  const { user } = useAuth() as any;
  const { t, i18n } = useTranslation() as any;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [course, setCourse] = React.useState<any | null>(null);
  const [resources, setResources] = React.useState<any[]>([]);
  const [allowed, setAllowed] = React.useState(false);
  const [pdfBlobUrls, setPdfBlobUrls] = React.useState<Record<string, string>>({});
  const { mode } = useThemeMode(); // "light" | "dark"
  const [certDataUrl, setCertDataUrl] = React.useState<string>("");
  const [certOpen, setCertOpen] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  // Reviews state
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [myRating, setMyRating] = React.useState<number>(0);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const [myComment, setMyComment] = React.useState<string>("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const tpLogo = mode === "dark" ? "/images/logos/TP-White.png" : "/images/logos/TP-Black.png";
  const TRUSTPILOT_URL = "https://www.trustpilot.com/review/tradeprofitab.ly"; // <-- put your page here

  const isCompleted = Boolean(
    (course as any)?.completed || (course as any)?.status === "COMPLETED"
  );

  const stampLogo = mode === "dark" ? "/logo.png" : "/logo.png";

  // Section visibility
  const [showInstructor, setShowInstructor] = React.useState(true);
  const [showMaterials, setShowMaterials] = React.useState(true);
  const [showDocuments, setShowDocuments] = React.useState(true);
  const [showVideos, setShowVideos] = React.useState(true);
  const [showSupport, setShowSupport] = React.useState(true);

  // Carousel refs
  const carouselRef = React.useRef<HTMLDivElement | null>(null);
  const topCarouselRef = React.useRef<HTMLDivElement | null>(null);
  const materialsVideosRef = React.useRef<HTMLDivElement | null>(null);

  // --- Helpers ---
  const BACKEND_ORIGIN = String((api.defaults as any).baseURL || "").replace(/\/+$/, "");
  const toAbsoluteUrl = (url: string) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    const origin = BACKEND_ORIGIN || window.location.origin;
    return `${origin}${path}`;
  };

  const isExternalSafe = (url?: string) => {
    if (!url) return false;
    if (!/^https?:\/\//i.test(url)) return false;
    try {
      const u = new URL(url);
      return !(u.host === "localhost:3000" || u.hostname === "localhost");
    } catch {
      return false;
    }
  };

  // --- Load access + course ---
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getMyPurchases({ ttlMs: 10 * 60 * 1000 });
        const arr: any[] = Array.isArray(list) ? list : [];
        const ok = arr.some((p) => p?.tierId === id && p?.status === "CONFIRMED");
        setAllowed(ok);
        if (!ok) {
          setError(t("learn.errors.access_denied"));
        } else if (id) {
          const resp = await api.get(`/courses/${id}`);
          setCourse(resp.data);
          const r = Array.isArray(resp.data?.resources) ? resp.data.resources : [];
          setResources(r);
          const rv = Array.isArray(resp.data?.reviews) ? resp.data.reviews : [];
          setReviews(rv);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || t("learn.errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  // Prefill my review if it exists
  const hasMyReview = React.useMemo(() => {
    const uid = user?.id;
    if (!uid) return false;
    return reviews.some((r: any) => r?.userId === uid);
  }, [reviews, user?.id]);

  React.useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    const mine = (reviews as any[]).find((r) => r?.userId === uid);
    if (mine) {
      setMyRating(Number(mine.rating) || 0);
      setMyComment(String(mine.comment || ""));
    }
  }, [reviews, user?.id]);

    React.useEffect(() => {
      if (isCompleted && !hasMyReview) setReviewOpen(true);
    }, [isCompleted, hasMyReview]);


  // --- Preload PDFs as blobs (same behavior) ---
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const list = Array.isArray(resources) ? resources : [];
      const pdfs = list.filter((r: any) => (r.type || "").toLowerCase() === "pdf" && r.url);
      const entries = await Promise.all(
        pdfs.map(async (r: any) => {
          try {
            const abs = toAbsoluteUrl(String(r.url));
            const resp = await api.get(abs, { responseType: "blob" });
            const blobUrl = URL.createObjectURL(resp.data);
            return [String(r.url), blobUrl] as const;
          } catch {
            return [String(r.url), ""] as const;
          }
        })
      );
      if (!cancelled) {
        setPdfBlobUrls((prev) => {
          Object.values(prev).forEach((u) => {
            try {
              URL.revokeObjectURL(u);
            } catch {}
          });
          return Object.fromEntries(entries);
        });
      } else {
        entries.forEach(([, u]) => {
          if (u) {
            try {
              URL.revokeObjectURL(u);
            } catch {}
          }
        });
      }
    };
    load();
    return () => {
      cancelled = true;
      setPdfBlobUrls((prev) => {
        Object.values(prev).forEach((u) => {
          try {
            URL.revokeObjectURL(u);
          } catch {}
        });
        return {};
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  // --- prevent context menu ---
  const preventContext = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  // --- Carousel controls ---
  const scrollByCard = (dir: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 16 : Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };
  const scrollTopCarousel = (dir: "left" | "right") => {
    const el = topCarouselRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 16 : Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  type CertCopy = {
    heading: string;
    subheading: string;
    statement: (student: string, course: string) => string;
    footer: string;
    labelName: string;
    labelCourse: string;
    labelDate: string;
    shareTitle: string;
    shareText: (student: string, course: string) => string;
  };

  function getCertCopy(lang: string): CertCopy {
    const L = lang.toLowerCase();
    if (L.startsWith("ar")) {
      return {
        heading: "شهادة إنجاز",
        subheading: "تُمنح هذه الشهادة إلى",
        statement: (student, course) => `تقديرًا لإكماله/ا بنجاح كورس: ${course}`,
        footer: "نؤكد أن هذه الشهادة صادرة بعد استيفاء متطلبات الكورس.",
        labelName: "الاسم",
        labelCourse: "الكورس",
        labelDate: "التاريخ",
        shareTitle: "شهادة إنجاز",
        shareText: (student, course) => `حصل/ت ${student} على شهادة إنجاز في ${course}`,
      };
    }
    if (L.startsWith("fr")) {
      return {
        heading: "Certificat d'Accomplissement",
        subheading: "Ce certificat est décerné à",
        statement: (student, course) =>
          `en reconnaissance de la réussite du cours : ${course}`,
        footer: "Nous certifions que ce document est délivré après l'accomplissement du cours.",
        labelName: "Nom",
        labelCourse: "Cours",
        labelDate: "Date",
        shareTitle: "Certificat d'Accomplissement",
        shareText: (student, course) => `${student} a obtenu un certificat pour ${course}`,
      };
    }
    // EN default
    return {
      heading: "Certificate of Achievement",
      subheading: "This certificate is awarded to",
      statement: (student, course) => `in recognition of successfully completing: ${course}`,
      footer: "We certify this document is issued upon satisfying course requirements.",
      labelName: "Name",
      labelCourse: "Course",
      labelDate: "Date",
      shareTitle: "Certificate of Achievement",
      shareText: (student, course) => `${student} earned a certificate for ${course}`,
    };
  }

  const QR_SIZE = 160; // px
  const QR_PAD = 120; // inset from inner border
  const STAMP_W = 320;
  const STAMP_H = 140;
  const STAMP_PAD_X = 160;
  const STAMP_PAD_Y = 180;

  async function drawCertificate({
    studentName,
    courseName,
    lang,
    themeMode,
    logoUrl,
    tpLogoUrl,
    accent = "#b7a27d",
    purchaseDate,
    completionDate,
    trustpilotUrl,
    embedQr = false, // <--- add this (default false)
  }: {
    studentName: string;
    courseName: string;
    lang: string;
    themeMode: "light" | "dark";
    logoUrl: string;
    tpLogoUrl: string;
    accent?: string;
    purchaseDate?: Date;
    completionDate?: Date;
    trustpilotUrl?: string;
    embedQr?: boolean; // <--- add this
  }): Promise<HTMLCanvasElement> {
    const W = 1920,
      H = 1358;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Colors
    const bg0 = themeMode === "dark" ? "#0b1220" : "#ffffff";
    const bg1 = themeMode === "dark" ? "#101a2f" : "#faf7f2"; // gradient end
    const ink = themeMode === "dark" ? "#f5f6fa" : "#111827";
    const subtle = themeMode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
    const isRTL = lang.toLowerCase().startsWith("ar");
    const copy = getCertCopy(lang);

    // Helpers
    const centerText = (text: string, y: number, size: number, weight = "600") => {
      ctx.save();
      ctx.fillStyle = ink;
      ctx.font = `${weight} ${size}px "Inter", system-ui, -apple-system, "Segoe UI", Arial`;
      ctx.textAlign = "center";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
      ctx.fillText(text, W / 2, y);
      ctx.restore();
    };
    const formatD = (d?: Date) => {
      try {
        return (d || new Date()).toLocaleDateString();
      } catch {
        return "";
      }
    };

    // ===== Background: gradient + subtle dots =====
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bg0);
    grad.addColorStop(1, bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // dotted overlay
    ctx.save();
    ctx.globalAlpha = themeMode === "dark" ? 0.06 : 0.05;
    ctx.fillStyle = themeMode === "dark" ? "#b7a27d" : "#3a2f22";
    const step = 32;
    for (let y = 80; y < H; y += step) {
      for (let x = 80; x < W; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Borders
    ctx.strokeStyle = accent;
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.strokeStyle = subtle;
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 80, W - 160, H - 160);

    // Decorative divider
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(220, H * 0.52);
    ctx.lineTo(W - 220, H * 0.52);
    ctx.stroke();

    // Title & recipient
    centerText(copy.heading, 260, 76, "800");
    centerText(copy.subheading, 340, 38, "500");
    centerText(studentName, 440, 72, "800");

    // ===== Statement (line 1) + Course name (line 2, accent) =====
    const statementFull = copy.statement(studentName, courseName);
    // remove the courseName from the statement line if present
    const sLine = statementFull
      .replace(courseName, "")
      .replace(/\s+([:：،,.])$/, "$1")
      .trim();
    centerText(sLine, 520, 34, "500");

    ctx.save();
    ctx.fillStyle = accent;
    ctx.font = `800 44px "Inter", system-ui, Arial`;
    ctx.textAlign = "center";
    ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
    ctx.fillText(courseName, W / 2, 570);
    ctx.restore();

    // ===== Details row: Start & Completion (no Name) =====
    const rowY = 650;
    const cols = 2;
    const colW = 520;
    const totalW = colW * cols;
    const startX = (W - totalW) / 2;

    const courseStart = isRTL
      ? "تاريخ البدء"
      : lang.startsWith("fr")
      ? "Date de début"
      : "Start Date";
    const courseDone = isRTL
      ? "تاريخ الإكمال"
      : lang.startsWith("fr")
      ? "Date d’achèvement"
      : "Completion Date";

    const drawCell = (label: string, value: string, colIndex: number) => {
      const x =
        startX + (isRTL ? totalW - (colIndex + 1) * colW + colW / 2 : colIndex * colW + colW / 2);
      ctx.save();
      ctx.fillStyle = themeMode === "dark" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";
      ctx.font = `600 26px "Inter", system-ui, Arial`;
      ctx.textAlign = "center";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
      ctx.fillText(label, x, rowY);
      ctx.fillStyle = ink;
      ctx.font = `700 34px "Inter", system-ui, Arial`;
      ctx.fillText(value, x, rowY + 46);
      ctx.restore();
    };

    drawCell(courseStart, formatD(purchaseDate), 0);
    drawCell(courseDone, formatD(completionDate), 1);

    const getCommitmentMsg = (lng: string) => {
      const L = (lng || "en").toLowerCase();
      if (L.startsWith("ar")) {
        return "شكرًا لثقتكم وجهودكم. نؤكد التزامنا بدعم تعلمكم المستمر وخطواتكم نحو تحقيق الحرية المالية.";
      }
      if (L.startsWith("fr")) {
        return "Merci pour votre confiance et vos efforts. Nous restons engagés à soutenir votre apprentissage continu vers l’atteinte de la liberté financière.";
      }
      return "Thank you for your trust and effort. We’re committed to supporting your continued learning on the path to financial freedom.";
    };

    // simple centered word-wrap
    const drawCenteredParagraph = ({
      text,
      y,
      maxWidth = 1280,
      lineHeight = 36,
      font = `500 24px "Inter", system-ui, Arial`,
      color = themeMode === "dark" ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)",
    }: {
      text: string;
      y: number;
      maxWidth?: number;
      lineHeight?: number;
      font?: string;
      color?: string;
    }) => {
      ctx.save();
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;

      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = "";

      const measure = (s: string) => ctx.measureText(s).width;

      words.forEach((w, i) => {
        const test = current ? `${current} ${w}` : w;
        if (measure(test) <= maxWidth) {
          current = test;
        } else {
          if (current) lines.push(current);
          current = w;
        }
        if (i === words.length - 1 && current) lines.push(current);
      });

      lines.forEach((ln, idx) => {
        ctx.fillText(ln, W / 2, y + idx * lineHeight);
      });
      ctx.restore();
    };

    // draw the paragraph ~120px below the row
    drawCenteredParagraph({
      text: getCommitmentMsg(lang),
      y: rowY + 120,
      maxWidth: 1280,
      lineHeight: 38,
      font: `500 46px "Inter", system-ui, Arial`,
      // slightly softer than body; tweak if you like:
      color: themeMode === "dark" ? "#b7a27d" : "#b7a27d",
    });

    // Footer (small)
    ctx.save();
    ctx.fillStyle = themeMode === "dark" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
    ctx.font = `500 26px "Inter", system-ui, Arial`;
    ctx.textAlign = "center";
    ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
    ctx.fillText(copy.footer, W / 2, H - 260);
    ctx.restore();

    // ===== Corners: smaller inset brand stamp + Trustpilot CTA + QR =====
    // Stamp: smaller & further from edge
    const stampX = isRTL ? STAMP_PAD_X : W - (STAMP_W + STAMP_PAD_X);
    const stampY = H - (STAMP_H + STAMP_PAD_Y);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logoUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      ctx.save();
      ctx.shadowColor = themeMode === "dark" ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 8;
      ctx.drawImage(img, stampX, stampY, STAMP_W, STAMP_H);
      ctx.restore();
    } catch {}

    // Trustpilot logo + caption on opposite corner
    const tpX = isRTL ? W - (280 + 140) : 140; // same as before
    const tpY = H - 380;

    try {
      const tp = new Image();
      tp.crossOrigin = "anonymous";
      tp.src = tpLogoUrl;
      await new Promise((res, rej) => {
        tp.onload = res;
        tp.onerror = rej;
      });
      ctx.drawImage(tp, tpX, tpY, 180, 44);

      ctx.save();
      ctx.fillStyle = ink;
      ctx.font = `700 28px "Inter", system-ui, Arial`;
      ctx.textAlign = isRTL ? "right" : "left";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
      const cta = isRTL
        ? "اترك لنا تقييمًا"
        : lang.startsWith("fr")
        ? "Laissez-nous un avis"
        : "Leave us a review";
      if (isRTL) ctx.fillText(cta, tpX + 280, tpY + 84);
      else ctx.fillText(cta, tpX, tpY + 84);
      ctx.restore();
    } catch {}

    // QR code for Trustpilot page (no deps; uses a public QR image endpoint)
    if (embedQr && trustpilotUrl) {
      const enc = encodeURIComponent(trustpilotUrl);
      const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=0&data=${enc}`;
      try {
        const qr = new Image();
        qr.crossOrigin = "anonymous";
        qr.src = qrSrc;
        await new Promise((res, rej) => {
          qr.onload = res;
          qr.onerror = rej;
        });

        const qrX = isRTL ? W - (QR_SIZE + QR_PAD) : QR_PAD;
        const qrY = QR_PAD;

        ctx.save();
        ctx.strokeStyle = subtle;
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX - 6, qrY - 6, QR_SIZE + 12, QR_SIZE + 12);
        ctx.drawImage(qr, qrX, qrY, QR_SIZE, QR_SIZE);
        ctx.restore();
      } catch {
        // silently skip QR if it fails
      }
    }

    return canvas;
  }


  const purchaseAt = (course as any)?.purchasedAt
    ? new Date((course as any).purchasedAt)
    : (course as any)?.createdAt
    ? new Date((course as any).createdAt)
    : undefined;

  const completedAt = (course as any)?.completedAt
    ? new Date((course as any).completedAt)
    : (course as any)?.completed
    ? new Date()
    : undefined;

  async function handleGenerateCertificate() {
    const studentName = user?.fullName || user?.name || user?.email || "Student";
    const courseName = (course as any)?.name || t("learn.course_fallback");
    const canvas = await drawCertificate({
      studentName,
      courseName,
      lang: i18n.language || "en",
      themeMode: mode === "dark" ? "dark" : "light",
      logoUrl: stampLogo,
      tpLogoUrl: tpLogo,
      purchaseDate: purchaseAt,
      completionDate: completedAt,
      trustpilotUrl: TRUSTPILOT_URL,
      embedQr: true, // <--- keep false for now to avoid tainting
    } as any);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      setCertDataUrl(dataUrl);
    } catch (err) {
      console.error("Certificate export failed (likely CORS/tainted canvas):", err);
      setCertDataUrl(""); // show modal even if image export failed
    }
    setCertOpen(true);
  }



  async function handleShare() {
    try {
      if (!navigator.canShare || !navigator.share) throw new Error("share unsupported");
      const res = await fetch(certDataUrl);
      const blob = await res.blob();
      const file = new File([blob], "certificate.png", { type: "image/png" });

      const copy = getCertCopy(i18n.language || "en");
      await navigator.share({
        title: copy.shareTitle,
        text: copy.shareText(
          user?.fullName || user?.name || user?.email || "Student",
          (course as any)?.name || t("learn.course_fallback")
        ),
        files: [file],
      });
    } catch (e) {
      // fallback: open in new tab
      const win = window.open();
      if (win) {
        win.document.write(`<img src="${certDataUrl}" style="max-width:100%"/>`);
        win.document.close();
      }
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = certDataUrl;
    a.download = "certificate.png";
    a.click();
  }

  async function handleMarkCompleted() {
    if (!id) return;
    try {
      setCompleting(true);
      await api.post(`/courses/${id}/complete`);
      setCourse((prev: any) => ({ ...(prev || {}), completed: true, status: "COMPLETED" }));
      if (!hasMyReview) setReviewOpen(true);
      alert(t("learn.completion.marked") || "Course marked as completed");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        t("learn.errors.complete_failed") ||
        "Failed to mark as completed";
      alert(msg);
    } finally {
      setCompleting(false);
    }
  }

  // Reviews submit
  async function handleSubmitReview() {
    if (!id) return;
    if (!myRating) return alert(t("learn.reviews.rating_required") || "Please select a rating");
    try {
      setSubmittingReview(true);
      const payload = { rating: myRating, comment: myComment } as any;
      const resp = await api.post(`/courses/${id}/reviews`, payload);
      // Update if mine exists, else prepend
      setReviews((prev: any[]) => {
        const uid = user?.id;
        if (!uid) return [resp.data, ...prev];
        const idx = prev.findIndex((r) => r?.userId === uid);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = resp.data;
          return copy;
        }
        return [resp.data, ...prev];
      });
      setMyRating(0);
      setMyComment("");
      alert(t("learn.reviews.thanks") || "Thanks for your review!");
    } catch (e: any) {
      const msg = e?.response?.data?.message || t("learn.reviews.submit_failed") || "Failed to submit review";
      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <Box p={8} display="flex" alignItems="center" gap={3}>
        <Spinner />
        <Text>{t("learn.loading")}</Text>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Container maxW="5xl" py={10}>
        <VStack gap={4} align="start">
          <Heading size="md">{t("learn.access.title")}</Heading>
          <Text>{error || t("learn.access.denied_fallback")}</Text>
          <Button
            onClick={() => navigate("/enrolled")}
            variant="outline"
            bg="#b7a27d"
            color="white"
            _hover={{ bg: "#b7a27d", color: "black" }}
          >
            {t("learn.access.back_to_my_courses")}
          </Button>
        </VStack>
      </Container>
    );
  }

  const tier = course || {};
  const list = Array.isArray(resources) ? resources : [];
  const pdfs = list.filter((r: any) => (r.type || "").toLowerCase() === "pdf" && r.url);
  const videos = list.filter((r: any) => (r.type || "").toLowerCase() === "video" && r.url);

  // --- Strict language-specific PDFs: ONLY EN_/FR_/AR_ (no fallback) ---
  const lang = String(i18n?.language || "en").toLowerCase();
  const langCode = lang.startsWith("fr") ? "FR" : lang.startsWith("ar") ? "AR" : "EN";
  const pdfsForRender = pdfs.filter((doc: any) => {
    try {
      const name = String(doc.url).split("/").pop() || "";
      return name.toUpperCase().startsWith(`${langCode}_`);
    } catch {
      return false;
    }
  });

  return (
    <>
      <Container maxW="6xl" py={8}>
        <VStack align="stretch" gap={6}>
          <HStack justify="space-between" align="start">
            <Box bg="bg.surface">
              <Heading>{tier.name || t("learn.course_fallback")}</Heading>
              {tier.description && (
                <Text mt={2} color="text.primary">
                  {tier.description}
                </Text>
              )}
            </Box>
            <Button
              onClick={() => navigate("/enrolled")}
              color="text.primary"
              bg="#b7a27d"
              variant="outline"
            >
              {t("learn.actions.my_courses")}
            </Button>
            {!isCompleted ? (
              <Button
                onClick={handleMarkCompleted}
                bg="green"
                color="white"
                _hover={{ bg: "green" }}
                disabled={completing}
              >
                <Icon as={CheckCircle} />
                {t("learn.actions.mark_completed") || "I've completed this course"}
              </Button>
            ) : (
              <VStack align="end" gap={1}>
                <Button
                  onClick={() => {
                    if (!hasMyReview) {
                      setReviewOpen(true);
                      return;
                    }
                    handleGenerateCertificate();
                  }}
                  bg="green"
                  color="white"
                  _hover={{ bg: "green" }}
                  disabled={!hasMyReview}
                >
                  <Icon as={GraduationCap} />
                  {t("learn.certificate.get") || "Get Certificate"}
                </Button>
                {!hasMyReview && (
                  <Text fontSize="xs" color="gray.500">
                    {t("review.unlock_certificate", {
                      defaultValue: "Leave a review to unlock your certificate",
                    })}
                  </Text>
                )}
              </VStack>
            )}
          </HStack>

          {/* Visibility toggles */}
          <Box borderWidth={1} borderRadius="lg" borderColor="#b7a27d" bg="bg.surface" p={4}>
            <HStack gap={3} wrap="wrap">
              <Button
                size="sm"
                variant={showInstructor ? "solid" : "solid"}
                bg={showInstructor ? "green" : "gray"}
                color={showInstructor ? "white" : "black"}
                onClick={() => setShowInstructor((s) => !s)}
              >
                <HStack gap={2}>
                  {showInstructor ? <EyeOff size={16} /> : <Eye size={16} />}
                  <Text>
                    {t("learn.instructor.title")}:{" "}
                    {showInstructor ? t("common.hide") : t("common.show")}
                  </Text>
                </HStack>
              </Button>
              <Button
                size="sm"
                variant={showMaterials ? "solid" : "solid"}
                bg={showMaterials ? "green" : "gray"}
                color={showMaterials ? "white" : "black"}
                onClick={() => setShowMaterials((s) => !s)}
              >
                <HStack gap={2}>
                  {showMaterials ? <EyeOff size={16} /> : <Eye size={16} />}
                  <Text>
                    {t("learn.materials.title")}:{" "}
                    {showMaterials ? t("common.hide") : t("common.show")}
                  </Text>
                </HStack>
              </Button>
              <Button
                size="sm"
                variant={showDocuments ? "solid" : "solid"}
                bg={showDocuments ? "green" : "gray"}
                color={showDocuments ? "white" : "black"}
                onClick={() => setShowDocuments((s) => !s)}
              >
                <HStack gap={2}>
                  {showDocuments ? <EyeOff size={16} /> : <Eye size={16} />}
                  <Text>
                    {t("learn.documents.title")}:{" "}
                    {showDocuments ? t("common.hide") : t("common.show")}
                  </Text>
                </HStack>
              </Button>
              <Button
                size="sm"
                variant={showVideos ? "solid" : "solid"}
                bg={showVideos ? "green" : "gray"}
                color={showVideos ? "white" : "black"}
                onClick={() => setShowVideos((s) => !s)}
              >
                <HStack gap={2}>
                  {showVideos ? <EyeOff size={16} /> : <Eye size={16} />}
                  <Text>
                    {t("learn.videos.title")}: {showVideos ? t("common.hide") : t("common.show")}
                  </Text>
                </HStack>
              </Button>
              <Button
                size="sm"
                variant={showSupport ? "solid" : "solid"}
                bg={showSupport ? "green" : "gray"}
                color={showSupport ? "white" : "black"}
                onClick={() => setShowSupport((s) => !s)}
              >
                <HStack gap={2}>
                  {showSupport ? <EyeOff size={16} /> : <Eye size={16} />}
                  <Text>
                    {t("learn.support.title")}: {showSupport ? t("common.hide") : t("common.show")}
                  </Text>
                </HStack>
              </Button>
            </HStack>
          </Box>

          {/* Instructor */}
          {(tier.instructorName || tier.instructorBio) && (
            <Box borderWidth={1} borderRadius="lg" borderColor="#b7a27d" p={5} bg="bg.surface">
              <HStack justify="space-between" mb={2}>
                <Heading size="md">{t("learn.instructor.title")}</Heading>
              </HStack>
              {showInstructor && (
                <>
                  {tier.instructorName && <Text fontWeight={600}>{tier.instructorName}</Text>}
                  {tier.instructorBio && <Text color="text.primary">{tier.instructorBio}</Text>}
                </>
              )}
            </Box>
          )}

          {/* Materials / Links */}
          <Box borderWidth={1} borderRadius="lg" borderColor="#b7a27d" p={5} bg="bg.surface">
            <HStack justify="space-between" mb={2}>
              <Heading size="md">{t("learn.materials.title")}</Heading>
            </HStack>
            {showMaterials && (
              <VStack align="start" gap={3}>
                {/* Preview & Trailer carousel if they are videos */}
                {(!!tier.previewUrl || !!tier.trailerUrl) && (
                  <>
                    <HStack justify="space-between" w="100%">
                      <Heading size="sm">
                        {t("learn.materials.media") || "Preview & Trailer"}
                      </Heading>
                      <HStack gap={2}>
                        <Button
                          size="sm"
                          variant="solid"
                          bg="#b7a27d"
                          onClick={() => scrollTopCarousel("left")}
                        >
                          <HStack gap={2}>
                            <ChevronLeft size={16} />
                            <Text>{t("common.prev")}</Text>
                          </HStack>
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          bg="#b7a27d"
                          onClick={() => scrollTopCarousel("right")}
                        >
                          <HStack gap={2}>
                            <ChevronRight size={16} />
                            <Text>{t("common.next")}</Text>
                          </HStack>
                        </Button>
                      </HStack>
                    </HStack>
                    <HStack
                      ref={topCarouselRef}
                      gap={4}
                      overflowX="auto"
                      pb={2}
                      style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
                    >
                      {["preview", "trailer"].map((kind) => {
                        const url = kind === "preview" ? tier.previewUrl : tier.trailerUrl;
                        if (!url) return null;
                        const isVid = /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(url));
                        if (!isVid) return null;
                        return (
                          <Box
                            key={kind}
                            minWidth={{ base: "320px", md: "440px" }}
                            maxWidth={{ base: "100%", md: "480px" }}
                            borderWidth={1}
                            borderRadius="md"
                            borderColor="#b7a27d"
                            overflow="hidden"
                            position="relative"
                            bg="black"
                            style={{ scrollSnapAlign: "start" }}
                          >
                            <video
                              src={toAbsoluteUrl(String(url))}
                              controls
                              playsInline
                              disablePictureInPicture
                              controlsList="nodownload noplaybackrate"
                              style={{
                                display: "block",
                                width: "100%",
                                height: "auto",
                                aspectRatio: "16/9" as any,
                              }}
                              onContextMenu={(e) => e.preventDefault()}
                              onEnded={() =>
                                materialsVideosRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                })
                              }
                            />
                          </Box>
                        );
                      })}
                    </HStack>
                  </>
                )}

                {/* Fallback links for non-video preview/trailer */}
                {tier.previewUrl && !/\.(mp4|webm|ogg)(\?|#|$)/i.test(String(tier.previewUrl)) && (
                  <a
                    href={String(tier.previewUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b7a27d" }}
                  >
                    {t("learn.materials.preview")}
                  </a>
                )}
                {tier.trailerUrl && !/\.(mp4|webm|ogg)(\?|#|$)/i.test(String(tier.trailerUrl)) && (
                  <a
                    href={String(tier.trailerUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b7a27d" }}
                  >
                    {t("learn.materials.trailer")}
                  </a>
                )}

                {/* External community links (use exact URLs) */}
                {tier.telegramUrl && (
                  <a
                    href={String(tier.telegramUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b7a27d" }}
                  >
                    {t("learn.materials.telegram")}
                  </a>
                )}
                {tier.discordInviteUrl && (
                  <a
                    href={String(tier.discordInviteUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b7a27d" }}
                  >
                    {t("learn.materials.discord")}
                  </a>
                )}
                {tier.twitterTimelineUrl && (
                  <a
                    href={String(tier.twitterTimelineUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b7a27d" }}
                  >
                    {t("learn.materials.twitter")}
                  </a>
                )}

                {!tier.previewUrl &&
                  !tier.trailerUrl &&
                  !tier.telegramUrl &&
                  !tier.discordInviteUrl &&
                  !tier.twitterTimelineUrl && (
                    <Text color="text.muted">{t("learn.materials.empty")}</Text>
                  )}
              </VStack>
            )}
          </Box>

          {/* Documents (PDFs) — strict language prefix only */}
          <Box borderWidth={1} borderRadius="lg" borderColor="#b7a27d" p={5} bg="bg.surface">
            <HStack justify="space-between" mb={2}>
              <Heading size="md">{t("learn.documents.title")}</Heading>
              <Button
                size="sm"
                variant="solid"
                bg="#b7a27d"
                onClick={() => setShowDocuments((s) => !s)}
              >
                {showDocuments ? t("common.hide") : t("common.show")}
              </Button>
            </HStack>
            {showDocuments && (
              <>
                {pdfsForRender.length > 0 ? (
                  <VStack align="stretch" gap={5}>
                    {pdfsForRender.map((doc: any, idx: number) => {
                      const blob = pdfBlobUrls[String(doc.url)];
                      const src = blob
                        ? `${blob}#toolbar=0&navpanes=0`
                        : `${toAbsoluteUrl(String(doc.url))}#toolbar=0&navpanes=0`;
                      return (
                        <Box
                          key={idx}
                          position="relative"
                          onContextMenu={preventContext}
                          onDragStart={preventContext}
                        >
                          <Box
                            position="relative"
                            borderRadius="md"
                            borderColor="#b7a27d"
                            overflow="hidden"
                            borderWidth={1}
                          >
                            {blob ? (
                              <object
                                data={src}
                                type="application/pdf"
                                style={{ width: "100%", height: "70vh", maxHeight: 900 }}
                              >
                                <embed
                                  src={src}
                                  type="application/pdf"
                                  style={{ width: "100%", height: "70vh", maxHeight: 900 }}
                                />
                              </object>
                            ) : (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                height="40vh"
                              >
                                <Spinner />
                                <Text ml={2}>{t("learn.documents.loading")}</Text>
                              </Box>
                            )}
                            <Box position="absolute" inset={0} pointerEvents="none" zIndex={1} />
                            <Watermark
                              text={
                                user?.email || user?.id
                                  ? t("learn.watermark.user", { user: user?.email || user?.id })
                                  : undefined
                              }
                            />
                          </Box>
                          <Text mt={2} fontSize="sm" color="text.muted">
                            {t("learn.guard.note")}
                          </Text>
                        </Box>
                      );
                    })}
                  </VStack>
                ) : (
                  <Text color="text.muted">{t("learn.materials.empty")}</Text>
                )}
              </>
            )}
          </Box>

          {/* External links only & non-localhost */}
          {isExternalSafe(tier.telegramUrl) && (
            <a
              href={tier.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#b7a27d" }}
            >
              {t("learn.materials.telegram")}
            </a>
          )}
          {isExternalSafe(tier.discordInviteUrl) && (
            <a
              href={tier.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#b7a27d" }}
            >
              {t("learn.materials.discord")}
            </a>
          )}
          {isExternalSafe(tier.twitterTimelineUrl) && (
            <a
              href={tier.twitterTimelineUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#b7a27d" }}
            >
              {t("learn.materials.twitter")}
            </a>
          )}

          {/* Three widgets side-by-side when available */}
          {(tier.telegramEmbedUrl || tier.discordWidgetId || tier.twitterTimelineUrl) && (
            <HStack align="start" gap={4} flexWrap="wrap" w="100%">
              {tier.telegramEmbedUrl && (
                <Box
                  flex="1 1 360px"
                  minW={{ base: "100%", md: "360px" }}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor="#b7a27d"
                  bg="bg.surface"
                  overflow="hidden"
                >
                  <iframe
                    src={String(tier.telegramEmbedUrl)}
                    title="Telegram"
                    style={{ width: "100%", height: 400, border: 0 }}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </Box>
              )}
              {tier.discordWidgetId && (
                <Box
                  flex="1 1 360px"
                  minW={{ base: "100%", md: "360px" }}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor="#b7a27d"
                  bg="bg.surface"
                  overflow="hidden"
                >
                  <iframe
                    src={`https://discord.com/widget?id=${encodeURIComponent(
                      String(tier.discordWidgetId)
                    )}&theme=dark`}
                    title="Discord"
                    width="100%"
                    height="400"
                    allowTransparency
                    frameBorder={0}
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  />
                </Box>
              )}
              {tier.twitterTimelineUrl && (
                <Box
                  flex="1 1 360px"
                  minW={{ base: "100%", md: "360px" }}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor="#b7a27d"
                  bg="bg.surface"
                  overflow="hidden"
                >
                  {/* Simple iframe; if you use official widgets.js, add it globally once */}
                  <iframe
                    src={String(tier.twitterTimelineUrl)}
                    title="Twitter"
                    style={{ width: "100%", height: 400, border: 0 }}
                  />
                </Box>
              )}
            </HStack>
          )}

          {/* Videos — compact carousel (materials videos near PDFs) */}
          {videos.length > 0 && (
            <Box
              ref={materialsVideosRef}
              borderWidth={1}
              borderRadius="lg"
              borderColor="#b7a27d"
              p={5}
              bg="bg.surface"
            >
              <HStack justify="space-between" mb={2}>
                <Heading size="md">{t("learn.videos.title")}</Heading>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="solid"
                    bg="#b7a27d"
                    onClick={() => setShowVideos((s) => !s)}
                  >
                    {showVideos ? t("common.hide") : t("common.show")}
                  </Button>
                  {showVideos && (
                    <>
                      <Button
                        aria-label={t("common.prev")}
                        size="sm"
                        variant="outline"
                        onClick={() => scrollByCard("left")}
                      >
                        <HStack gap={2}>
                          <ChevronLeft size={18} />
                          <Text>{t("common.prev")}</Text>
                        </HStack>
                      </Button>
                      <Button
                        aria-label={t("common.next")}
                        size="sm"
                        variant="outline"
                        onClick={() => scrollByCard("right")}
                      >
                        <HStack gap={2}>
                          <ChevronRight size={18} />
                          <Text>{t("common.next")}</Text>
                        </HStack>
                      </Button>
                    </>
                  )}
                </HStack>
              </HStack>

              {showVideos && (
                <>
                  <HStack
                    ref={carouselRef}
                    gap={4}
                    overflowX="auto"
                    pb={2}
                    style={{
                      scrollSnapType: "x mandatory",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    {videos.map((vid: any, idx: number) => {
                      const vsrc = toAbsoluteUrl(String(vid.url));
                      return (
                        <Box
                          key={idx}
                          minWidth={"440px"}
                          maxWidth={"480px"}
                          borderWidth={1}
                          borderRadius="md"
                          borderColor="#b7a27d"
                          overflow="hidden"
                          position="relative"
                          onContextMenu={(e) => e.preventDefault()}
                          bg="black"
                          style={{ scrollSnapAlign: "start" }}
                        >
                          <video
                            src={vsrc}
                            controls
                            playsInline
                            disablePictureInPicture
                            controlsList="nodownload noplaybackrate"
                            style={{
                              display: "block",
                              width: "100%",
                              height: "auto",
                              aspectRatio: "16/9" as any,
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                          <Box position="absolute" inset={0} pointerEvents="none" zIndex={1} />
                          <Watermark
                            text={
                              user?.email || user?.id
                                ? t("learn.watermark.user", { user: user?.email || user?.id })
                                : undefined
                            }
                          />
                        </Box>
                      );
                    })}
                  </HStack>
                  <Text mt={2} fontSize="sm" color="text.muted">
                    {t("learn.guard.note")}
                  </Text>
                </>
              )}
            </Box>
          )}

          {/* Support / Purchase info */}
          <Box borderWidth={1} borderRadius="lg" borderColor="#b7a27d" p={5} bg="bg.surface">
            <HStack justify="space-between" mb={2}>
              <Heading size="sm">{t("learn.support.title")}</Heading>
              <Button
                size="sm"
                variant="solid"
                bg="#b7a27d"
                onClick={() => setShowSupport((s) => !s)}
              >
                {showSupport ? t("common.hide") : t("common.show")}
              </Button>
            </HStack>
            {showSupport && (
              <>
                <Text fontSize="sm">{t("learn.support.body")}</Text>
                <style>{`@media print { body * { display: none !important; } }`}</style>
              </>
            )}
          </Box>
        </VStack>
      </Container>
      {/* <-- put this OUTSIDE the certOpen block */}
        {reviewOpen && (
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1100}
            p={4}
          >
            <Box
              bg={mode === "dark" ? "gray.900" : "white"}
              borderRadius="xl"
              borderColor="#b7a27d"
              borderWidth={1}
              p={4}
              maxW="560px"
              w="100%"
            >
              <VStack align="stretch" gap={4}>
                <Heading size="md">
                  {t("reviews.leave_review", { defaultValue: "Leave a review" })}
                </Heading>

                {/* Rating */}
                <Box>
                  <Text mb={2}>{t("reviews.rating", { defaultValue: "Rating" })}</Text>
                  <HStack>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        variant="ghost"
                        onClick={() => setMyRating(n)}
                        aria-label={`rate-${n}`}
                        p={1.5}
                      >
                        <Icon
                          as={Star}
                          fill={n <= myRating ? "#b7a27d" : "transparent"}
                          color="#b7a27d"
                        />
                      </Button>
                    ))}
                  </HStack>
                </Box>

                {/* Comment */}
                <Box>
                  <Text mb={2}>{t("reviews.comment", { defaultValue: "Comment" })}</Text>
                  <Textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    rows={5}
                    placeholder={t("reviews.comment_ph", {
                      defaultValue: "What did you think of the course?",
                    })}
                    borderColor="#b7a27d"
                    _hover={{ borderColor: "#b7a27d" }}
                    _focus={{ borderColor: "#b7a27d", boxShadow: "0 0 0 1px #b7a27d" }}
                  />
                </Box>

                <HStack justify="flex-end" gap={3}>
                  <Button variant="ghost" onClick={() => setReviewOpen(false)}>
                    {t("reviews.cancel", { defaultValue: "Cancel" })}
                  </Button>
                  <Button
                    bg="#b7a27d"
                    color="black"
                    _hover={{ opacity: 0.9 }}
                    isLoading={submittingReview}
                    onClick={async () => {
                      if (!myRating) {
                        alert(t("learn.reviews.rating_required") || "Please select a rating");
                        return;
                      }
                      await handleSubmitReview();
                      if (isCompleted) {
                        setReviewOpen(false);
                        handleGenerateCertificate();
                      }
                    }}
                  >
                    {t("reviews.submit", { defaultValue: "Submit review" })}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

      {certOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          p={4}
        >
          <Box
            bg={mode === "dark" ? "gray.900" : "white"}
            borderRadius="xl"
            borderColor="#b7a27d"
            p={4}
            maxW="90vw"
            maxH="90vh"
          >
            <VStack gap={4}>
              <Heading size="md">{t("learn.certificate.preview") || "Certificate Preview"}</Heading>
              <Box
                overflow="auto"
                maxH="70vh"
                borderWidth={1}
                borderColor="#b7a27d"
                borderRadius="lg"
              >
                {certDataUrl && (
                  <img
                    src={certDataUrl}
                    alt="Certificate"
                    style={{ display: "block", maxWidth: "100%" }}
                  />
                )}
              </Box>
              <HStack gap={3}>
                <Button onClick={handleDownload} bg="#b7a27d" color="white">
                  {t("learn.certificate.download") || "Download PNG"}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  borderColor="#b7a27d"
                  color="#b7a27d"
                >
                  {t("learn.certificate.share") || "Share"}
                </Button>
                <Button variant="ghost" onClick={() => setCertOpen(false)}>
                  {t("common.close") || "Close"}
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </>
  );
};

// Watermark component (kept)
const Watermark: React.FC<{ text?: string }> = ({ text = "Protected Content" }) => (
  <Box position="absolute" inset={0} pointerEvents="none" opacity={0.1}>
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%) rotate(-15deg)"
      fontWeight={800}
      fontSize={{ base: "2xl", md: "4xl" }}
      color="blackAlpha.700"
      textAlign="center"
    >
      {text}
    </Box>
  </Box>
);

export default Learn;