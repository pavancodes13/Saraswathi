import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ActivityItem({
  title,
  subtitle,
  time,
  isPresent,
}: any) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.dot,
          { backgroundColor: isPresent ? "#16A34A" : "#9CA3AF" },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  title: { fontSize: 15, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  time: { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginLeft: 10 },
});
