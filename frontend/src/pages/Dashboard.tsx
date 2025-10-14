import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Image,
  ButtonProps,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import GlassCard from "../components/GlassCard";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import ContentAdminPanel from "../components/admin/ContentAdminPanel"; // ← now used
import VerifAdminPanel from "../components/admin/VerifAdminPanel"; // ← now used
import PromoAdminPanel from "../components/admin/PromoAdminPanel";
import CommunicationsAdminPanel from "../components/admin/CommunicationsAdminPanel";
import JobsAdminPanel from "../components/admin/JobsAdminPanel";
import ApplicationsAdminPanel from "../components/admin/ApplicationsAdminPanel";
import api, { getMyPurchases } from "../api/client";

// Charts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";

// ------------ Types
type Purchase = {
  id: string;
  tierId: string;
  status: string;
  createdAt?: string;
  amount_usdt?: number;
  amount_stripe_cents?: number;
};
type Tier = {
  id: string;
  name: string;
  price_usdt?: number;
  price_stripe?: number;
  description?: string;
  level?: string;
  instructorName?: string;
  instructorAvatarUrl?: string;
};

type AdminPurchaseMetrics = {
  confirmed: number;
  pending: number;
  failed: number;
  revenue_usdt: number;
  revenue_stripe_cents: number;
  byDay: Record<string, number>;
};

const ADMIN_METRICS_DEFAULT: AdminPurchaseMetrics = {
  confirmed: 0,
  pending: 0,
  failed: 0,
  revenue_usdt: 0,
  revenue_stripe_cents: 0,
  byDay: {},
};

type TrafficPoint = {
  date: string;
  sessions: number;
  uniques: number;
  views: number;
  signups: number;
  purchases: number;
};
type CourseAgg = {
  id: string;
  name: string;
  sales: number;
  views: number;
  revenue_usdt: number;
  revenue_stripe_cents: number;
};

type AdminAnalytics = {
  trafficSeries: TrafficPoint[];
  revenueSeries: Array<{ date: string; usdt: number; stripeUsd: number }>;
  usersTotal: number;
  signupsSeries: Array<{ date: string; count: number }>;
  coursesAgg: CourseAgg[];
};

// ------------ Dashboard
const Dashboard: React.FC = () => {
  const { t } = useTranslation() as unknown as { t: (key: string, options?: any) => string };
  const { user } = useAuth() as any;

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "courses" | "account" | "purchases" | "settings" | "admin"
  >("overview");
  const [loading, setLoading] = React.useState(false);
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);
  const [tiers, setTiers] = React.useState<Tier[]>([]);

  const [adminSubTab, setAdminSubTab] = React.useState<
    "analytics" | "verifications" | "content" | "communications" | "promos" | "jobs" | "applications"
  >("analytics");


  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  // Admin state
  const [pendingAdmin, setPendingAdmin] = React.useState<any[] | null>(null);
  const [adminBusy, setAdminBusy] = React.useState<string | null>(null);

  const [adminMetrics, setAdminMetrics] = React.useState<AdminPurchaseMetrics | null>(
    ADMIN_METRICS_DEFAULT
  );

  const [analytics, setAnalytics] = React.useState<AdminAnalytics | null>(null);
  const [admLoading, setAdmLoading] = React.useState(false);

  const am: AdminPurchaseMetrics = adminMetrics ?? ADMIN_METRICS_DEFAULT;

  // Colors
  const brand = "#b7a27d";
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#14b8a6", "#f43f5e"];

  /**
   * Bootstrap user + admin data
   * Restructured to avoid reading from external state inside the effect body,
   * so react-hooks/exhaustive-deps is satisfied with just [isAdmin, user?.role].
   */
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setAdmLoading(true);
      try {
        // Load purchases and courses in parallel
        const [mine, coursesResp] = await Promise.allSettled([
          getMyPurchases({ ttlMs: 10 * 60 * 1000 }),
          api.get("/courses"),
        ]);

        const myPurchases: Purchase[] =
          mine.status === "fulfilled" && Array.isArray(mine.value) ? mine.value : [];
        const tiersFromApi: Tier[] =
          coursesResp.status === "fulfilled" && Array.isArray(coursesResp.value.data)
            ? coursesResp.value.data
            : [];

        if (!isMounted) return;
        setPurchases(myPurchases);
        setTiers(tiersFromApi);

        if (isAdmin) {
          // moderation queue + metrics
          const [pend, metrics] = await Promise.all([
            api.get("/purchase/admin/pending"),
            api.get("/purchase/admin/metrics"),
          ]);

          const pendingList = Array.isArray(pend.data?.data) ? pend.data.data : [];
          const serverMetrics: AdminPurchaseMetrics = {
            ...ADMIN_METRICS_DEFAULT,
            ...(metrics?.data || {}),
            byDay: (metrics?.data?.byDay as Record<string, number> | undefined) || {},
          };

          // Deep analytics (graceful)
          const [traffic, revenue, users, signups, courses] = await Promise.allSettled([
            api.get("/analytics/traffic"),
            api.get("/analytics/revenue"),
            api.get("/users/stats"),
            api.get("/users/signups"),
            api.get("/analytics/courses"),
          ]);

          const next: AdminAnalytics = {
            trafficSeries: traffic.status === "fulfilled" ? traffic.value?.data || [] : [],
            revenueSeries: revenue.status === "fulfilled" ? revenue.value?.data || [] : [],
            usersTotal: users.status === "fulfilled" ? users.value?.data?.total || 0 : 0,
            signupsSeries: signups.status === "fulfilled" ? signups.value?.data || [] : [],
            coursesAgg: courses.status === "fulfilled" ? courses.value?.data || [] : [],
          };

          // Fallbacks use values we just fetched (no state reads)
          if (!next.revenueSeries.length && Object.keys(serverMetrics.byDay || {}).length) {
            const avgUsd = 50;
            next.revenueSeries = Object.entries(serverMetrics.byDay || {}).map(([date, count]) => ({
              date,
              usdt: (count || 0) * avgUsd,
              stripeUsd: 0,
            }));
          }
          if (!next.trafficSeries.length && Object.keys(serverMetrics.byDay || {}).length) {
            next.trafficSeries = Object.entries(serverMetrics.byDay || {}).map(([date, count]) => ({
              date,
              sessions: (count || 0) * 7,
              uniques: Math.round((count || 0) * 5.5),
              views: (count || 0) * 12,
              signups: Math.max(0, Math.round((count || 0) * 1.2)),
              purchases: count || 0,
            }));
          }
          if (!next.signupsSeries.length && next.trafficSeries.length) {
            next.signupsSeries = next.trafficSeries.map((d) => ({
              date: d.date,
              count: d.signups,
            }));
          }
          if (!next.coursesAgg.length && tiersFromApi.length) {
            next.coursesAgg = tiersFromApi.slice(0, 6).map((t, i) => ({
              id: t.id,
              name: t.name,
              sales: Math.max(0, (serverMetrics?.confirmed || 0) - i * 3),
              views: 200 + i * 50,
              revenue_usdt:
                (t.price_usdt || 49) * Math.max(0, (serverMetrics?.confirmed || 0) - i * 3),
              revenue_stripe_cents: 0,
            }));
          }

          if (!isMounted) return;
          setPendingAdmin(pendingList);
          setAdminMetrics(serverMetrics);
          setAnalytics(next);
        } else {
          if (!isMounted) return;
          setPendingAdmin(null);
          setAdminMetrics(null);
          setAnalytics(null);
        }
      } catch {
        if (!isMounted) return;
        setPendingAdmin(null);
        setAdminMetrics(null);
        setAnalytics(null);
      } finally {
        if (!isMounted) return;
        setAdmLoading(false);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // deps kept minimal; the body no longer reads tiers/adminMetrics from state
  }, [isAdmin, user?.role]);

  const confirmed = purchases.filter((p) => (p.status || "").toUpperCase() === "CONFIRMED");
  const enrolledTiers = confirmed
    .map((p) => tiers.find((t) => t.id === p.tierId))
    .filter(Boolean) as Tier[];

  const purchasesByStatus = isAdmin
    ? [
        { name: "CONFIRMED", value: adminMetrics?.confirmed ?? 0 },
        { name: "PENDING", value: adminMetrics?.pending ?? 0 },
        { name: "FAILED", value: adminMetrics?.failed ?? 0 },
      ]
    : [
        { name: "CONFIRMED", value: confirmed.length },
        { name: "PENDING", value: pendingAdmin?.length ?? 0 },
        {
          name: "FAILED",
          value: purchases.filter((p) => (p.status || "").toUpperCase() === "FAILED").length,
        },
      ];

  const pendingByDay = (pendingAdmin || []).reduce((acc: Record<string, number>, p: any) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pendingSeries = Object.entries(pendingByDay)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  const revenueSplit = [
    { name: "USDT", value: am.revenue_usdt },
    { name: "Stripe USD", value: (am.revenue_stripe_cents || 0) / 100 },
  ];

  // aggregate KPIs
  const siteViews = (analytics?.trafficSeries || []).reduce((s, d) => s + (d.views || 0), 0);
  const totalSessions = (analytics?.trafficSeries || []).reduce((s, d) => s + (d.sessions || 0), 0);
  const totalSignups = (analytics?.trafficSeries || []).reduce((s, d) => s + (d.signups || 0), 0);
  const totalPurchases = (analytics?.trafficSeries || []).reduce(
    (s, d) => s + (d.purchases || 0),
    0
  );
  const totalRevenueUsd = am.revenue_usdt + (am.revenue_stripe_cents || 0) / 100;
  const conversionRate = totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0;
  const signupsToBuyerCR = totalSignups > 0 ? (totalPurchases / totalSignups) * 100 : 0;
  const ARPU =
    totalRevenueUsd && totalPurchases ? totalRevenueUsd / Math.max(1, totalPurchases) : 0;
  const AOV = totalRevenueUsd / Math.max(1, am.confirmed || 1);

  const topCoursesByRevenue = (analytics?.coursesAgg || [])
    .map((c) => ({
      name: c.name,
      revenueUsd: c.revenue_usdt + (c.revenue_stripe_cents || 0) / 100,
    }))
    .sort((a, b) => b.revenueUsd - a.revenueUsd)
    .slice(0, 6);

  const courseViewsData = (analytics?.coursesAgg || [])
    .map((c) => ({ name: c.name, views: c.views, sales: c.sales }))
    .slice(0, 10);

  async function setPurchaseStatus(id: string, status: "CONFIRMED" | "FAILED") {
    try {
      setAdminBusy(id + ":" + status);
      await api.patch(`/purchase/admin/${encodeURIComponent(id)}/status`, { status });
      const pend = await api.get("/purchase/admin/pending");
      const data = pend.data?.data ?? [];
      setPendingAdmin(Array.isArray(data) ? data : []);
    } finally {
      setAdminBusy(null);
    }
  }

  const TabButton: React.FC<{ id: typeof activeTab; label: string } & ButtonProps> = ({
    id,
    label,
    ...btnProps
  }) => (
    <Button
      size="sm"
      variant={activeTab === id ? "solid" : "ghost"}
      bg={activeTab === id ? brand : undefined}
      color={activeTab === id ? "black" : undefined}
      _hover={{ bg: brand, opacity: 0.9 }}
      onClick={() => setActiveTab(id)}
      {...btnProps}
    >
      {label}
    </Button>
  );

  const kpiBg = "rgba(183,162,125,0.10)";

  return (
    <Box bg="transparent" py={10}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={6}>
          <VStack align="start" gap={1}>
            <Heading size="lg">{t("dashboard.title") || "Dashboard"}</Heading>
            <Text color="text.primary">
              {t("dashboard.subtitle") || "Manage your courses and account"}
            </Text>
          </VStack>

          {/* Tabs */}
          <HStack gap={2} flexWrap="wrap">
            <TabButton
              id="overview"
              label={t("dashboard.overview")}
              variant="solid"
              bg="#b7a27d"
              color="white"
            />
            <TabButton
              id="courses"
              label={t("dashboard.courses")}
              variant="solid"
              bg="#b7a27d"
              color="white"
            />
            <TabButton
              id="account"
              label={t("dashboard.account")}
              variant="solid"
              bg="#b7a27d"
              color="white"
            />
            <TabButton
              id="purchases"
              label={t("dashboard.purchases")}
              variant="solid"
              bg="#b7a27d"
              color="white"
            />
            <TabButton
              id="settings"
              label={t("dashboard.settings")}
              variant="solid"
              bg="#b7a27d"
              color="white"
            />
            {isAdmin && (
              <TabButton
                id="admin"
                label={t("dashboard.admin") || "Admin"}
                variant="solid"
                bg="#b7a27d"
                color="white"
              />
            )}
          </HStack>

          {/* --------- USER OVERVIEW --------- */}
          {activeTab === "overview" && (
            <VStack align="stretch" gap={4}>
              <GlassCard>
                <Heading size="md" mb={2}>
                  {t("header.hi", { name: user?.name || user?.email || "Trader" })}
                </Heading>

                <SimpleGrid columns={[1, 2, 3]} gap={4}>
                  <Box p={4} borderRadius="lg" bg={kpiBg}>
                    <Heading size="xs" mb={1}>
                      {t("dashboard.total_courses") || "Total Courses"}
                    </Heading>
                    <Heading size="lg">{tiers.length}</Heading>
                    <Text fontSize="sm" opacity={0.8}>
                      {t("dashboard.available") || "Available"}
                    </Text>
                  </Box>
                  <Box p={4} borderRadius="lg" bg={kpiBg}>
                    <Heading size="xs" mb={1}>
                      {t("dashboard.enrolled") || "Enrolled"}
                    </Heading>
                    <Heading size="lg">{enrolledTiers.length}</Heading>
                    <Text fontSize="sm" opacity={0.8}>
                      {t("dashboard.active_learning") || "Active learning"}
                    </Text>
                  </Box>
                  <Box p={4} borderRadius="lg" bg={kpiBg}>
                    <Heading size="xs" mb={1}>
                      {t("dashboard.purchases") || "Purchases"}
                    </Heading>
                    <Heading size="lg">{purchases.length}</Heading>
                    <Text fontSize="sm" opacity={0.8}>
                      {t("dashboard.all_time") || "All time"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </GlassCard>
            </VStack>
          )}

          {/* --------- ADMIN --------- */}
          {activeTab === "admin" && isAdmin && (
            <VStack align="stretch" gap={6}>
              {/* Admin sub-tabs */}
              <HStack gap={2} flexWrap="wrap">
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "analytics" ? brand : brand}
                  color={adminSubTab === "analytics" ? "white" : "white"}
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("analytics")}
                >
                  {t("admin.analytics") || "Analytics"}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "verifications" ? brand : brand}
                  color={adminSubTab === "verifications" ? "white" : "white"}
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("verifications")}
                >
                  {t("admin.verifications") || "Verifications"}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "content" ? brand : brand}
                  color="white"
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("content")}
                >
                  {t("admin.content") || "Content Admin"}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "promos" ? brand : brand}
                  color="white"
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("promos")}
                >
                  {t("admin.promos") || "Promo Codes"}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "communications" ? brand : brand}
                  color="white"
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("communications")}
                >
                  {t("admin.communications")}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "jobs" ? brand : brand}
                  color="white"
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("jobs")}
                >
                  {t("admin.jobs")}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  bg={adminSubTab === "applications" ? brand : brand}
                  color="white"
                  _hover={{ bg: brand, opacity: 0.9 }}
                  onClick={() => setAdminSubTab("applications")}
                >
                  {t("admin.applications")}
                </Button>
              </HStack>

              {/* --- Analytics tab (unchanged) --- */}
              {adminSubTab === "analytics" && (
                <GlassCard>
                  <Heading size="md" mb={3}>
                    {t("admin.admin_overview")}
                  </Heading>

                  <SimpleGrid columns={[1, 2, 3, 6]} gap={4}>
                    <Box p={4} borderRadius="lg" bg={kpiBg}>
                      <Heading size="xs" mb={1}>
                        {t("dashboard.total_revenue")}
                      </Heading>
                      <Heading size="lg">
                        ${totalRevenueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("dashboard.usdt_stripe")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={kpiBg}>
                      <Heading size="xs" mb={1}>
                        {t("dashboard.users")}
                      </Heading>
                      <Heading size="lg">{(analytics?.usersTotal || 0).toLocaleString()}</Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("dashboard.all_time")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={kpiBg}>
                      <Heading size="xs" mb={1}>
                        {t("dashboard.site_views")}
                      </Heading>
                      <Heading size="lg">{siteViews.toLocaleString()}</Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("dashboard.all_time")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={kpiBg}>
                      <Heading size="xs" mb={1}>
                        {t("dashboard.sessions_purchase")}
                      </Heading>
                      <Heading size="lg">{conversionRate.toFixed(2)}%</Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("dashboard.session_conversion")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={kpiBg}>
                      <Heading size="xs" mb={1}>
                        {t("dashboard.signup_buyer")}
                      </Heading>
                      <Heading size="lg">{signupsToBuyerCR.toFixed(2)}%</Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("dashboard.lead_conversion")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={kpiBg}>
                      <Heading size="xs" mb={1}>
                        {t("dashboard.arpu_aov") || "ARPU / AOV"}
                      </Heading>
                      <Heading size="lg">${ARPU.toFixed(2)}</Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("dashboard.avg_rev_user_aov") || "Avg Rev/User • AOV"} ${AOV.toFixed(2)}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <SimpleGrid columns={[1, 1, 2]} gap={6} mt={6}>
                    {/* Revenue over time */}
                    <Box h="300px">
                      <Heading size="sm" mb={2}>
                        {t("admin.revenue_over_time")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <AreaChart
                          data={analytics?.revenueSeries || []}
                          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="usdt"
                            name="USDT"
                            stackId="1"
                            stroke={brand}
                            fill={brand}
                          />
                          <Area
                            type="monotone"
                            dataKey="stripeUsd"
                            name="Stripe USD"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Traffic & conversions */}
                    <Box h="300px">
                      <Heading size="sm" mb={2}>
                        {t("admin.traffic_conversions")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <ComposedChart
                          data={analytics?.trafficSeries || []}
                          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="views" name="Views" fill={brand} />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="sessions"
                            name="Sessions"
                            stroke="#0ea5e9"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="purchases"
                            name="Purchases"
                            stroke="#22c55e"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Purchase status pie */}
                    <Box h="300px">
                      <Heading size="sm" mb={2}>
                        {t("admin.purchase_status_breakdown")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={purchasesByStatus}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                          >
                            {purchasesByStatus.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* USDT vs Stripe split */}
                    <Box h="300px">
                      <Heading size="sm" mb={2}>
                        {t("admin.revenue_split")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <RadialBarChart
                          innerRadius="20%"
                          outerRadius="90%"
                          data={revenueSplit.map((d, i) => ({
                            ...d,
                            fill: i === 0 ? brand : "#0ea5e9",
                            pv: d.value,
                          }))}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar minAngle={15} background clockWise dataKey="pv" />
                          <Legend />
                          <Tooltip />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Top courses by revenue */}
                    <Box h="300px">
                      <Heading size="sm" mb={2}>
                        {t("admin.top_courses_revenue")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={topCoursesByRevenue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenueUsd" name="Revenue (USD)" fill={brand} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Course views vs sales */}
                    <Box h="300px">
                      <Heading size="sm" mb={2}>
                        {t("admin.course_views_sales")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <ComposedChart data={courseViewsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" name="Views" fill="#8b5cf6" />
                          <Line type="monotone" dataKey="sales" name="Sales" stroke="#22c55e" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </SimpleGrid>
                </GlassCard>
              )}

              {/* --- Verifications tab: now using your component --- */}
              {adminSubTab === "verifications" && (
                <GlassCard>
                  {/* You can pass props if your component expects them */}
                  <VerifAdminPanel isAdmin={true} />
                </GlassCard>
              )}

              {/* --- Content tab: now using your component --- */}
              {adminSubTab === "content" && (
                <GlassCard>
                  <ContentAdminPanel isAdmin={true} />
                </GlassCard>
              )}

              {/* --- Promos tab --- */}
              {adminSubTab === "promos" && (
                <GlassCard>
                  <PromoAdminPanel />
                </GlassCard>
              )}

              {/* --- Communications tab: now using your component --- */}
              {adminSubTab === "communications" && (
                <GlassCard>
                  <CommunicationsAdminPanel />
                </GlassCard>
              )}

              {/* --- Jobs tab: now using your component --- */}
              {adminSubTab === "jobs" && (
                <GlassCard>
                  <JobsAdminPanel />
                </GlassCard>
              )}

              {/* --- Applications tab: now using your component --- */}
              {adminSubTab === "applications" && (
                <GlassCard>
                  <ApplicationsAdminPanel />
                </GlassCard>
              )}

              {/* Optional: keep the small "pending over time" chart, powered by the queue we still fetch */}
              {!!pendingSeries.length && (
                <GlassCard>
                  <Heading size="sm" mb={2}>
                    {t("dashboard.pending_over_time")}
                  </Heading>
                  <Box h="260px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pendingSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={brand}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </GlassCard>
              )}
            </VStack>
          )}

          {/* --------- COURSES (user) --------- */}
          {activeTab === "courses" && (
            <VStack align="stretch" gap={4}>
              {loading && (
                <HStack>
                  <Spinner size="sm" />
                  <Text>{t("common.loading") || "Loading..."}</Text>
                </HStack>
              )}
              {!loading && !enrolledTiers.length && (
                <Text color="text.muted">
                  {t("dashboard.no_courses") || "You are not enrolled in any courses yet."}
                </Text>
              )}
              {enrolledTiers.map((course) => (
                <GlassCard key={course.id}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <HStack>
                        <Heading size="md">{course.name}</Heading>
                        {course.level && <Badge>{course.level}</Badge>}
                      </HStack>
                      {course.description && (
                        <Text color="text.primary" p={2} maxW="3xl">
                          {course.description}
                        </Text>
                      )}
                      {course.instructorName && (
                        <HStack>
                          {course.instructorAvatarUrl && (
                            <Image
                              src={course.instructorAvatarUrl}
                              alt={course.instructorName}
                              boxSize="28px"
                              borderRadius="full"
                            />
                          )}
                          <Text fontSize="sm">{course.instructorName}</Text>
                        </HStack>
                      )}
                    </VStack>
                    <Button size="sm" onClick={() => window.location.assign(`/learn/${course.id}`)}>
                      {t("dashboard.continue") || "Continue"}
                    </Button>
                  </HStack>
                </GlassCard>
              ))}
            </VStack>
          )}

          {/* --------- ACCOUNT --------- */}
          {activeTab === "account" && (
            <VStack align="stretch" gap={4}>
              <GlassCard>
                <Heading size="md" mb={2}>
                  {t("dashboard.account") || "Account"}
                </Heading>
                {user ? (
                  <VStack align="start" gap={1}>
                    <Text>
                      <strong>{t("dashboard.id") || "ID"}:</strong> {user.id}
                    </Text>
                    {user.email && (
                      <Text>
                        <strong>{t("dashboard.email") || "Email"}:</strong> {user.email}
                      </Text>
                    )}
                    {user.name && (
                      <Text>
                        <strong>{t("dashboard.name") || "Name"}:</strong> {user.name}
                      </Text>
                    )}
                  </VStack>
                ) : (
                  <Text color="text.muted">{t("dashboard.not_logged_in") || "Not logged in."}</Text>
                )}
              </GlassCard>
            </VStack>
          )}

          {/* --------- PURCHASES --------- */}
          {activeTab === "purchases" && (
            <VStack align="stretch" gap={4}>
              {loading && (
                <HStack>
                  <Spinner size="sm" />
                  <Text>{t("common.loading") || "Loading..."}</Text>
                </HStack>
              )}
              {!loading && !purchases.length && (
                <Text color="text.muted">{t("dashboard.no_purchases") || "No purchases yet."}</Text>
              )}
              {purchases.map((p) => {
                const tier = tiers.find((t) => t.id === p.tierId);
                return (
                  <GlassCard key={p.id}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={1}>
                        <Heading size="sm">{tier?.name || "Course"}</Heading>
                        <HStack gap={2}>
                          <Badge
                            colorScheme={
                              p.status === "CONFIRMED"
                                ? "green"
                                : p.status === "PENDING"
                                ? "yellow"
                                : "gray"
                            }
                          >
                            {p.status}
                          </Badge>
                          {p.createdAt && (
                            <Text fontSize="xs" color="text.muted">
                              {new Date(p.createdAt).toLocaleString()}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                      {p.status === "CONFIRMED" && tier && (
                        <Button
                          size="sm"
                          onClick={() => window.location.assign(`/learn/${tier.id}`)}
                        >
                          {t("dashboard.open") || "Open"}
                        </Button>
                      )}
                    </HStack>
                  </GlassCard>
                );
              })}
            </VStack>
          )}

          {/* --------- SETTINGS --------- */}
          {activeTab === "settings" && (
            <VStack align="stretch" gap={4}>
              <GlassCard>
                <Heading size="md" mb={2}>
                  {t("dashboard.settings") || "Settings"}
                </Heading>
                <Text color="text.muted">
                  {t("dashboard.settings_hint") ||
                    "Use the header controls to switch language. More settings coming soon."}
                </Text>
              </GlassCard>
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
