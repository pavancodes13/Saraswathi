import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.logo}>🏭 Saraswati Enterprises</Text>

          {/* <View style={styles.avatar}>
            <Text style={styles.avatarText}>PK</Text>
          </View> */}
        </View>

        <Text style={styles.date}>{today}</Text>

        <Text style={styles.greeting}>{greeting} 👋</Text>

        <Text style={styles.name}>Pavan Kumar</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.background,
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  date: {
    marginTop: 18,
    color: "#6B7280",
    fontSize: 15,
  },

  greeting: {
    marginTop: 12,
    fontSize: 18,
    color: "#6B7280",
  },

  name: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
});
