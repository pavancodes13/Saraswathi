import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  completed?: boolean;
  onPress?: () => void;
};

export default function TaskItem({ title, completed = false, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons
        name={completed ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={completed ? "#22C55E" : "#2563EB"}
      />

      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
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

    elevation: 3,
  },

  title: {
    marginLeft: 14,

    fontSize: 16,

    color: "#111827",

    fontWeight: "500",
  },
});
