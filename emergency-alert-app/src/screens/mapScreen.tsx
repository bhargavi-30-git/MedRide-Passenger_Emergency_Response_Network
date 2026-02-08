import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { signOut } from "firebase/auth";

import { auth, db } from "../firebase/firebaseConfig";
import { triggerEmergency } from "../services/emergencyService";
import { unregisterPushNotifications } from "../services/notificationService";

export default function MapScreen() {
  const [myLocation, setMyLocation] = useState<any>(null);
  const [emergency, setEmergency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const locRef = ref(db, `locations/${user.uid}`);
    const emRef = ref(db, "emergencies");

    onValue(locRef, (snap) => {
      if (snap.exists()) {
        setMyLocation(snap.val());
        setLoading(false);
      }
    });

    onValue(emRef, (snap) => {
      if (!snap.exists()) {
        setEmergency(null);
        return;
      }

      const data = snap.val();
      for (const id of Object.keys(data)) {
        const e = data[id];
        if (e.status === "active" && e.userId !== user.uid) {
          setEmergency({ id, ...e });
          return;
        }
      }
      setEmergency(null);
    });

    return () => {
      off(locRef);
      off(emRef);
    };
  }, []);

  const logout = async () => {
    await unregisterPushNotifications(); // 🔴 KEY FIX
    await signOut(auth);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: myLocation.lat,
          longitude: myLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {emergency && (
          <Marker
            coordinate={{
              latitude: emergency.lat,
              longitude: emergency.lng,
            }}
          >
            <Image
              source={require("../../assets/siren.png")}
              style={styles.sirenIcon}
            />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity style={styles.emergencyButton} onPress={triggerEmergency}>
        <Text style={styles.emergencyText}>🚨 EMERGENCY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  logout: { color: "red", fontWeight: "bold" },
  emergencyButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  emergencyText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  sirenIcon: { width: 40, height: 40 },
});
