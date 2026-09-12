import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        router.replace("/(auth)/login");
        return;
      }

      // Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, role, phone")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("attendance_date, status")
        .eq("profile_id", userId)
        .order("attendance_date", { ascending: true });

      if (attendanceError) throw attendanceError;

      const present = attendanceData.filter(
        (item) => item.status === "Present",
      ).length;

      const absent = attendanceData.filter(
        (item) => item.status === "Absent",
      ).length;

      // Joined date = First Present record
      const firstPresent = attendanceData.find(
        (item) => item.status === "Present",
      );

      const joinedDate = firstPresent ? firstPresent.attendance_date : null;

      // Calculate current streak
      const presentDates = attendanceData
        .filter((item) => item.status === "Present")
        .map((item) => item.attendance_date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;

      if (presentDates.length > 0) {
        streak = 1;

        for (let i = 1; i < presentDates.length; i++) {
          const current = new Date(presentDates[i - 1]);
          const previous = new Date(presentDates[i]);

          const diff =
            (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }

      setProfile({
        ...profileData,
        total_present: present,
        total_absent: absent,
        streak,
        joinedDate,
      });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userId", "userName", "userRole"]);

          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const joinedDate = profile?.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {profile?.name?.charAt(0)?.toUpperCase() || "U"}
        </Text>
      </View>

      <Text style={styles.name}>{profile?.name || "Unknown User"}</Text>

      <Text style={styles.role}>{profile?.role || "No Role"}</Text>

      <View style={styles.card}>
        <Item title="🔥 Streak" value={`${profile?.streak ?? 0} Days`} />

        <Item title="✅ Present" value={`${profile?.total_present ?? 0}`} />

        <Item title="❌ Absent" value={`${profile?.total_absent ?? 0}`} />

        <Item title="📱 Phone" value={profile?.phone || "-"} />

        <Item title="📅 Joined" value={joinedDate} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function Item({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 15,
  },

  role: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 5,
    textTransform: "capitalize",
  },

  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  value: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "700",
  },

  logoutButton: {
    marginTop: 40,
    backgroundColor: "#EF4444",
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
