import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState("");
  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!myAttendance?.check_in || myAttendance?.check_out) return;
    const timer = setInterval(() => {
      const diff =
        new Date().getTime() - new Date(myAttendance.check_in).getTime();
      setLiveSeconds(Math.floor(diff / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [myAttendance]);

  function getISTDateString() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());
  }

  async function init() {
    const id = await AsyncStorage.getItem("userId");
    if (!id) {
      Alert.alert("Login Required");
      return;
    }
    setUserId(id);
    await loadAttendance(id);
    setLoading(false);
  }

  async function loadAttendance(id: string) {
    try {
      const todayIST = getISTDateString();

      const { data: myData, error: myError } = await supabase
        .from("attendance")
        .select("*")
        .eq("profile_id", id)
        .eq("attendance_date", todayIST)
        .maybeSingle();
      if (myError) throw myError;
      setMyAttendance(myData);

      if (myData?.check_in && !myData?.check_out) {
        const diff = new Date().getTime() - new Date(myData.check_in).getTime();
        setLiveSeconds(Math.floor(diff / 1000));
      }

      const { data: workerData, error: workerError } = await supabase
        .from("attendance")
        .select(`*, profiles (name)`)
        .eq("attendance_date", todayIST)
        .order("check_in", { ascending: true });
      if (workerError) throw workerError;
      setWorkers(workerData || []);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  async function checkIn() {
    try {
      if (myAttendance?.check_in) {
        Alert.alert("Already Checked In");
        return;
      }
      const { error } = await supabase.from("attendance").insert({
        profile_id: userId,
        attendance_date: getISTDateString(),
        status: "Present",
        check_in: new Date().toISOString(),
      });
      if (error) throw error;
      Alert.alert("Success", "Checked In Successfully");
      await loadAttendance(userId);
    } catch (e: any) {
      Alert.alert("Check In Failed", e.message);
    }
  }

  async function checkOut() {
    try {
      if (!myAttendance) {
        Alert.alert("Please Check In First");
        return;
      }
      if (myAttendance.check_out) {
        Alert.alert("Already Checked Out");
        return;
      }
      const now = new Date();
      const diffMs = now.getTime() - new Date(myAttendance.check_in).getTime();
      const hours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

      const { error } = await supabase
        .from("attendance")
        .update({
          check_out: now.toISOString(),
          total_hours: hours,
        })
        .eq("id", myAttendance.id);
      if (error) throw error;
      Alert.alert("Success", "Checked Out Successfully");
      await loadAttendance(userId);
    } catch (e: any) {
      Alert.alert("Check Out Failed", e.message);
    }
  }

  function formatTimeIST(time: string | null) {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatHMS(totalSeconds: number) {
    if (totalSeconds <= 0) return "00h 00m 00s";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }

  function getDisplayHours(item: any) {
    if (!item?.check_in) return "--";
    if (item.id === myAttendance?.id && item.check_in && !item.check_out) {
      return formatHMS(liveSeconds);
    }
    if (item.check_in && item.check_out) {
      const diff =
        new Date(item.check_out).getTime() - new Date(item.check_in).getTime();
      return formatHMS(Math.floor(diff / 1000));
    }
    return item.total_hours
      ? formatHMS(Math.floor(item.total_hours * 3600))
      : "Working...";
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <FlatList
      data={workers}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadAttendance(userId);
            setRefreshing(false);
          }}
        />
      }
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>📅 Attendance</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <View style={styles.card}>
            <Text style={styles.title}>My Attendance</Text>

            <View style={styles.row}>
              <Text>Check In</Text>
              <Text style={styles.timeVal}>
                {formatTimeIST(myAttendance?.check_in)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                myAttendance?.check_in && { opacity: 0.5 },
              ]}
              onPress={checkIn}
              disabled={!!myAttendance?.check_in}
            >
              <Text style={styles.buttonText}>CHECK IN</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <Text>Check Out</Text>
              <Text style={styles.timeVal}>
                {formatTimeIST(myAttendance?.check_out)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#DC2626" },
                (myAttendance?.check_out || !myAttendance?.check_in) && {
                  opacity: 0.5,
                },
              ]}
              onPress={checkOut}
              disabled={!!myAttendance?.check_out || !myAttendance?.check_in}
            >
              <Text style={styles.buttonText}>CHECK OUT</Text>
            </TouchableOpacity>

            <View style={styles.totalRow}>
              <Text style={{ fontWeight: "700" }}>Total Hours</Text>
              <Text style={{ fontWeight: "800", color: "#2563EB" }}>
                {myAttendance ? getDisplayHours(myAttendance) : "--"}
              </Text>
            </View>
          </View>

          <Text style={styles.heading2}>
            Today's Workers ({workers.length})
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.workerCard}>
          <Text style={styles.workerName}>{item.profiles?.name}</Text>
          <Text>In : {formatTimeIST(item.check_in)}</Text>
          <Text>Out : {formatTimeIST(item.check_out)}</Text>
          <Text style={{ fontWeight: "700", marginTop: 4 }}>
            Hours : {getDisplayHours(item)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginHorizontal: 20,
  },
  heading2: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  date: { color: "#666", marginHorizontal: 20, marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
  },
  timeVal: { fontWeight: "700", fontSize: 15 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  workerCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  workerName: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
});
