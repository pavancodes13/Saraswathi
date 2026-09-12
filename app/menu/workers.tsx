import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "ALL" | "PRESENT" | "ABSENT";

export default function Workers() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("ALL");

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, tab, workers]);

  function getISTDateString() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());
  }

  async function loadWorkers() {
    setLoading(true);
    try {
      const todayIST = getISTDateString();

      // 1. Fetch all profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (profileError) throw profileError;

      // 2. Fetch today's attendance
      const { data: attendanceData, error: attError } = await supabase
        .from("attendance")
        .select("profile_id, status")
        .eq("attendance_date", todayIST);

      if (attError) throw attError;

      // 3. Map attendance by profile_id
      const attendanceMap = new Map();
      attendanceData?.forEach((att) => {
        attendanceMap.set(att.profile_id, att.status);
      });

      // 4. Merge status into workers
      const merged = (profiles || []).map((w) => ({
        ...w,
        todayStatus: attendanceMap.get(w.id) || "Absent", // If no record -> Absent
      }));

      setWorkers(merged);
    } catch (e) {
      console.log("Load workers error", e);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = [...workers];

    // Filter by Tab
    if (tab === "PRESENT") {
      result = result.filter((w) => w.todayStatus === "Present");
    } else if (tab === "ABSENT") {
      result = result.filter((w) => w.todayStatus !== "Present");
    }

    // Filter by Search
    if (search.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(result);
  }

  function searchWorker(text: string) {
    setSearch(text);
  }

  const presentCount = workers.filter(
    (w) => w.todayStatus === "Present",
  ).length;
  const absentCount = workers.length - presentCount;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>👷 Workers</Text>

      <TextInput
        placeholder="Search Worker..."
        value={search}
        onChangeText={searchWorker}
        style={styles.search}
      />

      {/* Tabs for Present / Absent */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "ALL" && styles.tabActive]}
          onPress={() => setTab("ALL")}
        >
          <Text style={[styles.tabText, tab === "ALL" && styles.tabTextActive]}>
            All ({workers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "PRESENT" && styles.tabActiveGreen]}
          onPress={() => setTab("PRESENT")}
        >
          <Text
            style={[styles.tabText, tab === "PRESENT" && styles.tabTextActive]}
          >
            Present ({presentCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "ABSENT" && styles.tabActiveRed]}
          onPress={() => setTab("ABSENT")}
        >
          <Text
            style={[styles.tabText, tab === "ABSENT" && styles.tabTextActive]}
          >
            Absent ({absentCount})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={loadWorkers} />
        }
        renderItem={({ item }) => {
          const isPresent = item.todayStatus === "Present";
          return (
            <View
              style={[
                styles.card,
                {
                  borderLeftWidth: 5,
                  borderLeftColor: isPresent ? "#16A34A" : "#DC2626",
                },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>📞 {item.phone}</Text>
                <Text>👤 {item.role}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isPresent ? "#DCFCE7" : "#FEE2E2" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isPresent ? "#16A34A" : "#DC2626" },
                    ]}
                  >
                    {isPresent ? "Present" : "Absent"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#888"
                  style={{ marginTop: 8 }}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  search: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  tabActiveGreen: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  tabActiveRed: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  tabText: {
    fontWeight: "700",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontWeight: "800",
    fontSize: 12,
  },
});
