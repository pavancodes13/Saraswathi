import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, role, phone, avatar_url")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("attendance_date, status")
        .eq("profile_id", userId)
        .order("attendance_date", { ascending: true });

      if (attendanceError) throw attendanceError;

      const present = attendanceData.filter(
        (i) => i.status === "Present",
      ).length;
      const absent = attendanceData.filter((i) => i.status === "Absent").length;
      const firstPresent = attendanceData.find((i) => i.status === "Present");
      const joinedDate = firstPresent ? firstPresent.attendance_date : null;

      const presentDates = attendanceData
        .filter((i) => i.status === "Present")
        .map((i) => i.attendance_date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      if (presentDates.length > 0) {
        streak = 1;
        for (let i = 1; i < presentDates.length; i++) {
          const diff =
            (new Date(presentDates[i - 1]).getTime() -
              new Date(presentDates[i]).getTime()) /
            (1000 * 60 * 60 * 24);
          if (diff === 1) streak++;
          else break;
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

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow gallery access");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const fileExt = uri.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Convert uri to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: data.publicUrl }));
      Alert.alert("Success", "Profile photo updated");
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message);
    } finally {
      setUploading(false);
    }
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
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
      {/* Avatar with Gallery Pick */}
      <TouchableOpacity onPress={pickImage} style={styles.avatar}>
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        )}
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.changePhotoText}>Tap to change photo</Text>

      <Text style={styles.name}>{profile?.name || "Unknown User"}</Text>
      <Text style={styles.role}>{profile?.role || "No Role"}</Text>

      <View style={styles.card}>
        <Item title="🔥 Streak" value={`${profile?.streak ?? 0} Days`} />
        <Item title="✅ Present" value={`${profile?.total_present ?? 0}`} />
        <Item title="❌ Absent" value={`${profile?.total_absent ?? 0}`} />
        <Item title="📱 Phone" value={profile?.phone || "-"} />
        <Item title="📅 Joined" value={joinedDate} />
      </View>

      {/* Monthly Attendance Button */}
      <TouchableOpacity
        style={styles.monthlyButton}
        onPress={() => router.push("/monthly")}
      >
        <Text style={styles.monthlyText}>📊 Monthly Attendance</Text>
      </TouchableOpacity>

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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    overflow: "hidden",
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "700" },
  uploadingOverlay: {
    position: "absolute",
    width: 90,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: {
    color: "#2563EB",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  name: { fontSize: 28, fontWeight: "700", marginTop: 15 },
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
  label: { fontSize: 16, fontWeight: "600", color: "#111827" },
  value: { fontSize: 16, color: "#2563EB", fontWeight: "700" },
  monthlyButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  monthlyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  logoutButton: {
    marginTop: 15,
    backgroundColor: "#EF4444",
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
