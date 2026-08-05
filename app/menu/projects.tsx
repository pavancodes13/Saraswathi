import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProjects(data || []);
    }
  }

  async function createProject() {
    if (!projectName) {
      Alert.alert("Enter Project Name");
      return;
    }

    const { error } = await supabase.from("projects").insert({
      project_name: projectName,
      client_name: clientName,
      description,
      progress: 0,
      status: "Upcoming",
    });

    if (error) {
      Alert.alert(error.message);
      return;
    }

    setVisible(false);
    setProjectName("");
    setClientName("");
    setDescription("");

    loadProjects();
  }

  async function updateStatus(project: any, status: string) {
    let progress = project.progress;

    if (status === "Upcoming") progress = 0;
    if (status === "Running") progress = 50;
    if (status === "Completed") progress = 100;

    const { error } = await supabase
      .from("projects")
      .update({
        status,
        progress,
      })
      .eq("id", project.id);

    if (error) {
      Alert.alert(error.message);
      return;
    }

    loadProjects();
  }

  function getColor(status: string) {
    switch (status) {
      case "Upcoming":
        return "#F59E0B";

      case "Running":
        return "#10B981";

      case "Completed":
        return "#2563EB";

      default:
        return "#999";
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.addText}>+ Create Project</Text>
      </TouchableOpacity>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.project_name}</Text>

            <Text>Client : {item.client_name}</Text>

            <Text>{item.description}</Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: getColor(item.status),
                },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>

            <Text
              style={{
                marginTop: 10,
                fontWeight: "700",
              }}
            >
              Progress : {item.progress}%
            </Text>

            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: "#F59E0B",
                  },
                ]}
                onPress={() => updateStatus(item, "Upcoming")}
              >
                <Text style={styles.buttonText}>Upcoming</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: "#10B981",
                  },
                ]}
                onPress={() => updateStatus(item, "Running")}
              >
                <Text style={styles.buttonText}>Running</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: "#2563EB",
                  },
                ]}
                onPress={() => updateStatus(item, "Completed")}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={visible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.heading}>Create Project</Text>

          <TextInput
            placeholder="Project Name"
            value={projectName}
            onChangeText={setProjectName}
            style={styles.input}
          />

          <TextInput
            placeholder="Client Name"
            value={clientName}
            onChangeText={setClientName}
            style={styles.input}
          />

          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={[
              styles.input,
              {
                height: 120,
              },
            ]}
            multiline
          />

          <TouchableOpacity style={styles.save} onPress={createProject}>
            <Text style={styles.saveText}>Save Project</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },

  addButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },

  addText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 3,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  save: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  cancel: {
    textAlign: "center",
    marginTop: 20,
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
  },
});
