import Header from "@/components/home/Header";
import QuickAction from "@/components/home/QuickAction";
import SummaryCard from "@/components/home/SummaryCard";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadActivity();

    // Realtime - auto refresh when someone marks attendance
    const channel = supabase
      .channel("attendance-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        () => {
          loadDashboard();
          loadActivity();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getISTToday = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(),
    );

  const timeAgo = (iso: string) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s} sec ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    return `${Math.floor(h / 24)} days ago`;
  };

  const formatIST = (t: string | null) => {
    if (!t) return "--";
    return new Date(t).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function loadDashboard() {
    const today = getISTToday();
    const { count: w } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const { count: tp } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    const { count: cp } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed");
    const { count: present } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("status", "Present");
    setTotalWorkers(w ?? 0);
    setTotalProjects(tp ?? 0);
    setCompletedProjects(cp ?? 0);
    setTodayPresent(present ?? 0);
  }

  async function loadActivity() {
    setLoading(true);
    const today = getISTToday();
    const { data } = await supabase
      .from("attendance")
      .select("*, profiles(name)")
      .eq("attendance_date", today)
      .order("check_in", { ascending: false })
      .limit(15);
    setRecent(data || []);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.grid}>
          <SummaryCard
            icon="people"
            title="Workers"
            value={`${todayPresent} / ${totalWorkers}`}
            color="#3B82F6"
            onPress={() => router.push("/menu/workers")}
          />
          <SummaryCard
            icon="briefcase"
            title="Projects"
            value="6 Running"
            color="#10B981"
            onPress={() => router.push("/menu/projects")}
          />
          <SummaryCard
            icon="cube"
            title="Finalized"
            value={`${completedProjects} / ${totalProjects}`}
            color="#F59E0B"
            onPress={() => router.push("/menu/finalized")}
          />
          <SummaryCard
            icon="grid"
            title="Rack Finder"
            value="Search"
            color="#8B5CF6"
            onPress={() => router.push("/menu/racks")}
          />
        </View>

        <Text style={styles.heading}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction title="Worker" icon="person-add" color="#2563EB" />
          <QuickAction title="Project" icon="briefcase" color="#10B981" />
          <QuickAction title="Item" icon="cube" color="#F59E0B" />
          <QuickAction title="Rack" icon="grid" color="#8B5CF6" />
        </View>

        <Text style={styles.heading}>Recent Attendance</Text>

        {loading ? (
          <ActivityIndicator color="#2563EB" />
        ) : recent.length === 0 ? (
          <Text style={{ color: "#888" }}>No attendance today</Text>
        ) : (
          recent.map((item) => (
            <View key={item.id} style={styles.activityCard}>
              <View style={styles.greenDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aTitle}>
                  {item.profiles?.name} marked attendance
                </Text>
                <Text style={styles.aSub}>
                  In: {formatIST(item.check_in)} | Out:{" "}
                  {formatIST(item.check_out)} •{" "}
                  {formatIST(item.check_in) !== "--"
                    ? `${item.total_hours || "0"} hrs`
                    : ""}
                </Text>
              </View>
              <Text style={styles.aTime}>{timeAgo(item.check_in)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16A34A",
    marginRight: 12,
  },
  aTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  aSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  aTime: { fontSize: 11, color: "#9CA3AF", fontWeight: "700", marginLeft: 10 },
});
