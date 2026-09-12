import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Monthly() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    workingDays: 0,
    sundays: 0,
    present: 0,
    absent: 0,
  });

  useEffect(() => {
    loadMonthly();
  }, []);

  function getMonthInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const totalDays = new Date(year, month + 1, 0).getDate();

    let sundays = 0;
    for (let d = 1; d <= totalDays; d++) {
      if (new Date(year, month, d).getDay() === 0) sundays++;
    }
    const workingDays = totalDays - sundays;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const format = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

    return {
      totalDays,
      workingDays,
      sundays,
      start: format(firstDay),
      end: format(lastDay),
      monthName: now.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    };
  }

  const loadMonthly = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const { start, end, totalDays, workingDays, sundays } = getMonthInfo();

      const { data, error } = await supabase
        .from("attendance")
        .select("status, attendance_date")
        .eq("profile_id", userId)
        .gte("attendance_date", start)
        .lte("attendance_date", end);

      if (error) throw error;

      const present = data.filter((a) => a.status === "Present").length;

      // Absent = working days that have passed and are not present
      const today = new Date().getDate();
      let pastWorkingDays = 0;
      const now = new Date();
      for (let d = 1; d <= today; d++) {
        if (new Date(now.getFullYear(), now.getMonth(), d).getDay() !== 0) {
          pastWorkingDays++;
        }
      }
      const absent =
        pastWorkingDays - present < 0 ? 0 : pastWorkingDays - present;

      setStats({ totalDays, workingDays, sundays, present, absent });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const { monthName } = getMonthInfo();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📅 {monthName}</Text>
      <Text style={styles.subHeading}>Attendance Summary</Text>

      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: "#E0E7FF" }]}>
          <Text style={styles.value}>{stats.totalDays}</Text>
          <Text style={styles.label}>Total Days</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#FEF3C7" }]}>
          <Text style={styles.value}>{stats.workingDays}</Text>
          <Text style={styles.label}>Working Days</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#F3E8FF" }]}>
          <Text style={styles.value}>{stats.sundays}</Text>
          <Text style={styles.label}>Sundays Off</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#DCFCE7" }]}>
          <Text style={[styles.value, { color: "#16A34A" }]}>
            {stats.present}
          </Text>
          <Text style={[styles.label, { color: "#16A34A" }]}>Present</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#FEE2E2" }]}>
          <Text style={[styles.value, { color: "#DC2626" }]}>
            {stats.absent}
          </Text>
          <Text style={[styles.label, { color: "#DC2626" }]}>Absent</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#DBEAFE" }]}>
          <Text style={[styles.value, { color: "#2563EB" }]}>
            {stats.workingDays - stats.present - stats.absent}
          </Text>
          <Text style={[styles.label, { color: "#2563EB" }]}>Remaining</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 28, fontWeight: "800", marginTop: 20 },
  subHeading: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 30,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: {
    width: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
  value: { fontSize: 32, fontWeight: "800", color: "#111827" },
  label: { fontSize: 14, fontWeight: "700", marginTop: 8, color: "#6B7280" },
});
