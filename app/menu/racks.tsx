import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Racks() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rack, setRack] = useState("A1");
  const [image, setImage] = useState<any>(null);
  const [showRackDropdown, setShowRackDropdown] = useState(false);

  const RACKS = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  ).flatMap((letter) => [1, 2, 3, 4].map((num) => `${letter}${num}`));

  useEffect(() => {
    loadItems();
  }, [search]);

  async function loadItems() {
    let query = supabase
      .from("rack_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (search) query = query.ilike("item_name", `%${search}%`);
    const { data, error } = await query;
    if (!error) setItems(data || []);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function uploadImage() {
    if (!image) return null;
    const fileName = `${Date.now()}.jpg`;
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const { error } = await supabase.storage
      .from("rack-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
      });
    if (error) {
      console.log(error);
      return null;
    }
    const { data } = supabase.storage
      .from("rack-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function saveItem() {
    if (!itemName || !rack) {
      Alert.alert("Enter item details");
      return;
    }
    let imageUrl = null;
    if (image) imageUrl = await uploadImage();

    const { error } = await supabase.from("rack_items").insert({
      item_name: itemName,
      category,
      quantity: Number(quantity),
      rack_no: rack,
      image: imageUrl,
    });

    if (error) {
      Alert.alert(error.message);
      return;
    }
    setModal(false);
    setItemName("");
    setCategory("");
    setQuantity("");
    setImage(null);
    loadItems();
  }

  async function deleteItem(id: string) {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await supabase.from("rack_items").delete().eq("id", id);
          loadItems();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: "Rack Finder" }} />
      <View style={styles.container}>
        <Text style={styles.title}>🗄 Rack Finder</Text>
        <TextInput
          placeholder="Search Item..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
        <TouchableOpacity style={styles.add} onPress={() => setModal(true)}>
          <Text style={styles.addText}>+ Add Item</Text>
        </TouchableOpacity>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No Items Found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.image} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text>Category : {item.category}</Text>
                <Text>Quantity : {item.quantity}</Text>
                <Text>Rack : {item.rack_no}</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.update}
                    onPress={() => Alert.alert("Update coming next")}
                  >
                    <Text style={styles.btnText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />

        <Modal visible={modal} animationType="slide" statusBarTranslucent>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              style={styles.modal}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Item</Text>
                <TouchableOpacity
                  onPress={() => setModal(false)}
                  style={styles.closeBtn}
                >
                  <Text style={{ fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Item Name"
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
              />
              <TextInput
                placeholder="Category"
                style={styles.input}
                value={category}
                onChangeText={setCategory}
              />
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
              />

              <Text style={styles.label}>Select Rack</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowRackDropdown(true)}
              >
                <Text style={styles.dropdownText}>{rack}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* IMAGE BESIDE BUTTON */}
              <Text style={styles.label}>Item Image</Text>
              <View style={styles.imageRow}>
                <TouchableOpacity
                  style={styles.imageBtnFlex}
                  onPress={pickImage}
                >
                  <Text style={{ fontWeight: "700", color: "#fff" }}>
                    {image ? "Change Image" : "Select Image"}
                  </Text>
                </TouchableOpacity>

                {image ? (
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewThumb}
                  />
                ) : (
                  <View style={styles.previewEmpty}>
                    <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                      No Image
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.save} onPress={saveItem}>
                <Text style={styles.btnText}>Save Item</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        <Modal visible={showRackDropdown} transparent animationType="fade">
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowRackDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownTitle}>Select Rack</Text>
              <FlatList
                data={RACKS}
                numColumns={4}
                keyExtractor={(item) => item}
                style={{ maxHeight: 400 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.rackBtn, rack === item && styles.activeRack]}
                    onPress={() => {
                      setRack(item);
                      setShowRackDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.rackText,
                        rack === item && { color: "#fff" },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 15,
    color: "#111827",
  },
  search: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  add: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
    color: "#111827",
  },
  row: { flexDirection: "row", marginTop: 12, gap: 10 },
  update: {
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  delete: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 50, color: "#6B7280", fontSize: 16 },
  modal: { flex: 1, backgroundColor: "#F5F7FA", padding: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 26, fontWeight: "800" },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: { fontWeight: "700", marginBottom: 6, color: "#374151" },
  dropdown: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownText: { fontSize: 16, fontWeight: "600" },
  dropdownArrow: { color: "#6B7280" },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  rackBtn: {
    flex: 1,
    margin: 4,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeRack: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  rackText: { fontWeight: "600" },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },
  imageBtnFlex: {
    flex: 1,
    backgroundColor: "#F59E0B",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  previewThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewEmpty: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  save: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
});
