import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { ref, onValue, push, set, update } from "firebase/database";
import MapView, { Marker } from "react-native-maps";
import { signOut } from "firebase/auth";

import { db, auth } from "../firebase/firebaseConfig";
import { unregisterPushNotifications } from "../services/notificationService";

export default function HospitalDashboard() {
  const [emergencies, setEmergencies] = useState<any[]>([]);

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
        .filter((e) => e.status === "verified");

      setEmergencies(list);
    });

    return () => unsub();
  }, []);

  const sendAmbulance = async (item: any) => {
    try {
      const ambulanceRef = push(ref(db, "ambulances"));

      await set(ambulanceRef, {
        emergencyId: item.id,
        hospitalId: auth.currentUser?.uid,
        lat: item.lat,
        lng: item.lng,
        status: "enroute",
        createdAt: Date.now(),
      });

      await update(ref(db, `emergencies/${item.id}`), {
        status: "ambulance_enroute",
        ambulanceAssigned: true,
        ambulanceId: ambulanceRef.key,
      });

      Alert.alert("Ambulance Sent");
    } catch {
      Alert.alert("Error sending ambulance");
    }
  };

  const logout = async () => {
    await unregisterPushNotifications();
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hospital Dashboard</Text>

      <FlatList
        contentContainerStyle={{ paddingBottom: 150 }}
        data={emergencies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              🚑 Emergency ID: {item.id}
            </Text>

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

            <TouchableOpacity
              style={styles.ambulanceBtn}
              onPress={() => sendAmbulance(item)}
            >
              <Text style={styles.btnText}>
                SEND AMBULANCE
              </Text>
            </TouchableOpacity>
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
    backgroundColor: "#f4f8ff",
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
    fontWeight: "bold",
    marginBottom: 10,
  },
  map: {
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  ambulanceBtn: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 10,
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