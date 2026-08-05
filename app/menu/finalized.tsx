import { supabase } from "@/lib/supabase";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function FinalizedProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedProjects();
  }, []);

  async function loadCompletedProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "Completed")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Finalized Projects",
        }}
      />

      <View style={styles.container}>
        <Text style={styles.heading}>✅ Completed Projects</Text>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>No completed projects found</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.project_name}</Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Completed</Text>
                </View>
              </View>

              <Text style={styles.text}>Client: {item.client_name || "-"}</Text>

              <Text style={styles.text}>Progress: {item.progress}%</Text>

              <Text style={styles.text}>Started: {item.start_date || "-"}</Text>

              <Text style={styles.text}>Finished: {item.end_date || "-"}</Text>
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },

  badge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  text: {
    marginTop: 8,
    color: "#374151",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
    fontSize: 16,
  },
});
