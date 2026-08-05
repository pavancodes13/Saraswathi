import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  time?: string;
};

export default function ActivityItem({ title, time }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="time-outline" size={18} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>

        {time && <Text style={styles.time}>{time}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#fff",

    padding: 16,

    borderRadius: 15,

    marginBottom: 12,

    elevation: 2,
  },

  icon: {
    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: "#EFF6FF",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 12,
  },

  title: {
    fontSize: 15,

    fontWeight: "600",

    color: "#111827",
  },

  time: {
    marginTop: 4,

    fontSize: 13,

    color: "#6B7280",
  },
});
