import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { ref, onValue, update, push, set, get } from "firebase/database";
import MapView, { Marker } from "react-native-maps";
import { signOut } from "firebase/auth";

import { auth, db } from "../firebase/firebaseConfig";
import { unregisterPushNotifications } from "../services/notificationService";

export default function HospitalDashboard() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const emRef = ref(db, "emergencies");

    const unsub = onValue(emRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.val();
      const list = Object.keys(data)
        .map((id) => ({ id, ...data[id] }))
        .filter(
          (e) =>
            e.status === "verified" &&
            e.assignedHospitalId === user.uid
        );

      setEmergencies(list);
    });

    return () => unsub();
  }, [user]);

  const sendAmbulance = async (emergency: any) => {
    try {
      const ambulanceRef = push(ref(db, "ambulances"));

      await set(ambulanceRef, {
        emergencyId: emergency.id,
        hospitalId: user?.uid,
        lat: emergency.lat,
        lng: emergency.lng,
        status: "enroute",
        createdAt: Date.now(),
      });

      await update(ref(db, `emergencies/${emergency.id}`), {
        ambulanceAssigned: true,
        status: "ambulance_enroute",
      });

      // 🔥 Notify User
      const tokenSnap = await get(
        ref(db, `pushTokens/${emergency.userId}`)
      );

      if (tokenSnap.exists()) {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: tokenSnap.val(),
            sound: "default",
            title: "Ambulance Dispatched",
            body: "Ambulance is on the way.",
          }),
        });
      }

      Alert.alert("Ambulance Sent");
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    await unregisterPushNotifications();
    await signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hospital Dashboard</Text>

      <TouchableOpacity onPress={logout}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>

      <FlatList
        data={emergencies}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No assigned emergencies
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.bold}>Emergency: {item.name}</Text>

            <MapView
              style={{ height: 200, marginTop: 10 }}
              initialRegion={{
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
                title="Emergency Location"
              />
            </MapView>

            <TouchableOpacity
              style={styles.button}
              onPress={() => sendAmbulance(item)}
            >
              <Text style={styles.buttonText}>
                SEND AMBULANCE
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  logout: {
    textAlign: "right",
    color: "red",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  bold: { fontWeight: "bold", marginBottom: 5 },
  button: {
    marginTop: 10,
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});