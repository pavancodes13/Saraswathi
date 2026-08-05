import ActivityItem from "@/components/home/ActivityItem";
import Header from "@/components/home/Header";
import QuickAction from "@/components/home/QuickAction";
import SummaryCard from "@/components/home/SummaryCard";
import TaskItem from "@/components/home/TaskItem";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Total Workers
      const { count: workerCount, error: workerError } = await supabase
        .from("profiles")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (workerError) throw workerError;

      // Total Projects
      const { count: totalProjectCount, error: totalProjectError } =
        await supabase.from("projects").select("*", {
          count: "exact",
          head: true,
        });

      if (totalProjectError) throw totalProjectError;

      // Completed Projects
      const { count: completedProjectCount, error: completedProjectError } =
        await supabase
          .from("projects")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("status", "Completed");

      if (completedProjectError) throw completedProjectError;

      setTotalProjects(totalProjectCount ?? 0);
      setCompletedProjects(completedProjectCount ?? 0);

      // Today's Attendance
      const { count: presentCount, error: attendanceError } = await supabase
        .from("attendance")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("attendance_date", today)
        .eq("status", "Present");

      if (attendanceError) throw attendanceError;

      setTotalWorkers(workerCount ?? 0);
      setTodayPresent(presentCount ?? 0);
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Dashboard */}

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

        {/* Quick Actions */}

        <Text style={styles.heading}>Quick Actions</Text>

        <View style={styles.quickActions}>
          <QuickAction title="Worker" icon="person-add" color="#2563EB" />

          <QuickAction title="Project" icon="briefcase" color="#10B981" />

          <QuickAction title="Item" icon="cube" color="#F59E0B" />

          <QuickAction title="Rack" icon="grid" color="#8B5CF6" />
        </View>

        {/* Tasks */}

        <Text style={styles.heading}>Today's Tasks</Text>

        <TaskItem title="Paint Machine" completed />

        <TaskItem title="Steel Cutting" />

        <TaskItem title="Repair Generator" />

        {/* Activity */}

        <Text style={styles.heading}>Recent Activity</Text>

        <ActivityItem title="Rahul marked attendance" time="10 min ago" />

        <ActivityItem title="Paint stock updated" time="35 min ago" />

        <ActivityItem title="Steel moved to Rack A-03" time="1 hour ago" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1f2123",
    backgroundImage: "./assets/images/bg.jpg",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

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
});
