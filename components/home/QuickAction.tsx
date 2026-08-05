import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
};

export default function QuickAction({ title, icon, color, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name={icon} size={26} color={color} />

      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "23%",

    backgroundColor: "#fff",

    alignItems: "center",

    paddingVertical: 18,

    borderRadius: 16,

    elevation: 3,
  },

  title: {
    marginTop: 10,

    fontSize: 13,

    fontWeight: "600",

    textAlign: "center",

    color: "#111827",
  },
});
