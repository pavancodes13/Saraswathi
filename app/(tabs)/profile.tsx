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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
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

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {profile?.name?.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.name}>{profile?.name}</Text>

      <Text style={styles.role}>{profile?.role}</Text>

      <View style={styles.card}>
        <Item title="🔥 Streak" value={`${profile?.streak} Days`} />
        <Item title="✅ Present" value={`${profile?.total_present}`} />
        <Item title="❌ Absent" value={`${profile?.total_absent}`} />
        <Item title="📱 Phone" value={profile?.phone} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function Item({ title, value }: any) {
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
