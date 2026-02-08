import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { signOut } from "firebase/auth";

import { auth, db } from "../firebase/firebaseConfig";
import { unregisterPushNotifications } from "../services/notificationService";

export default function AdminDashboard() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);

  useEffect(() => {
    const emRef = ref(db, "emergencies");
    const unsub = onValue(emRef, (snap) => {
      if (!snap.exists()) {
        setEmergencies([]);
        return;
      }

      const data = snap.val();
      const list = Object.keys(data)
        .map((id) => ({ id, ...data[id] }))
        .filter((e) => e.status === "active");

      setEmergencies(list);
    });

    return () => unsub();
  }, []);

  if (selectedEmergency) {
    const AdminEmergencyMap = require("./adminEmergencyMap").default;
    return (
      <AdminEmergencyMap
        emergency={selectedEmergency}
        onBack={() => setSelectedEmergency(null)}
      />
    );
  }

  const logout = async () => {
    await unregisterPushNotifications(); // 🔴 KEY FIX
    await signOut(auth);
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <FlatList
          data={emergencies}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ marginTop: 20 }}>No active emergencies</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => setSelectedEmergency(item)}
            >
              <Text>ID: {item.id}</Text>
              <Text>Verified: {item.verifiedByAdmin ? "YES" : "NO"}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",   // 🔴 CENTER FIX
    alignItems: "center",       // 🔴 CENTER FIX
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#c62828",
    padding: 12,
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
