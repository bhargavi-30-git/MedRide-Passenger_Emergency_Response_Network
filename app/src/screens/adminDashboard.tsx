import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import MapView, { Marker } from "react-native-maps";
import { signOut } from "firebase/auth";

import { db, auth } from "../firebase/firebaseConfig";
import { unregisterPushNotifications } from "../services/notificationService";
import { verifyEmergency } from "../services/emergencyService";

export default function AdminDashboard() {
  const [emergencies, setEmergencies] = useState<any[]>([]);

  useEffect(() => {
    const emRef = ref(db, "emergencies");

    const unsub = onValue(emRef, async (snap) => {
      if (!snap.exists()) {
        setEmergencies([]);
        return;
      }

      const data = snap.val();
      const list: any[] = [];

      for (const id of Object.keys(data)) {
        const e = data[id];

        if (e.status === "pending") {
          const userSnap = await get(ref(db, `users/${e.userId}`));
          const userData = userSnap.exists() ? userSnap.val() : {};

          list.push({
            id,
            ...e,
            name: userData.name || "Unknown",
            vehicleNo: userData.vehicleNo || "N/A",
            phone: userData.phone || "N/A",
          });
        }
      }

      setEmergencies(list);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await unregisterPushNotifications();
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <FlatList
        contentContainerStyle={{ paddingBottom: 150 }}
        data={emergencies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>🚨 {item.name}</Text>
            <Text style={styles.detail}>📞 {item.phone}</Text>
            <Text style={styles.detail}>🚗 {item.vehicleNo}</Text>

            <MapView
              style={styles.map}
              region={{
                latitude: item.lat,
                longitude: item.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: item.lat,
                  longitude: item.lng,
                }}
              />
            </MapView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() => verifyEmergency(item.id)}
              >
                <Text style={styles.btnText}>VERIFY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() =>
                  update(ref(db, `emergencies/${item.id}`), {
                    status: "rejected",
                  })
                }
              >
                <Text style={styles.btnText}>REJECT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    marginBottom: 4,
  },
  map: {
    height: 180,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verifyBtn: {
    backgroundColor: "#1e88e5",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutBtn: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 8,
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});