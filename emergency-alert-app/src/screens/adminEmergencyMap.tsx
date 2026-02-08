import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";
import { getDistanceInMeters } from "../services/geoUtils";

export default function AdminEmergencyMap({
  emergency,
  onBack,
}: {
  emergency: any;
  onBack: () => void;
}) {
  const [adminLocation, setAdminLocation] = useState<any>(null);
  const admin = auth.currentUser;

  useEffect(() => {
    if (!admin) return;

    const locRef = ref(db, `locations/${admin.uid}`);
    const unsub = onValue(locRef, (snap) => {
      if (snap.exists()) {
        setAdminLocation(snap.val());
      }
    });

    return () => unsub();
  }, []);

  if (!adminLocation) {
    return (
      <View style={styles.center}>
        <Text>Loading map…</Text>
      </View>
    );
  }

  const distance = Math.round(
    getDistanceInMeters(
      adminLocation.lat,
      adminLocation.lng,
      emergency.lat,
      emergency.lng
    )
  );

  const verifyEmergency = async () => {
    await update(ref(db, `emergencies/${emergency.id}`), {
      verifiedByAdmin: true,
    });
  };

  const rejectEmergency = async () => {
    // mark emergency resolved
    await update(ref(db, `emergencies/${emergency.id}`), {
      status: "resolved",
      verifiedByAdmin: false,
    });

    // clear user's activeEmergencyId
    const userSnap = await get(
      ref(db, `users/${emergency.userId}`)
    );

    if (userSnap.exists()) {
      await update(ref(db, `users/${emergency.userId}`), {
        activeEmergencyId: null,
      });
    }

    onBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: emergency.lat,
          longitude: emergency.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: emergency.lat,
            longitude: emergency.lng,
          }}
          title="Emergency"
        />

        <Marker
          coordinate={{
            latitude: adminLocation.lat,
            longitude: adminLocation.lng,
          }}
          title="Admin"
          pinColor="blue"
        />

        <Circle
          center={{
            latitude: emergency.lat,
            longitude: emergency.lng,
          }}
          radius={50}
          strokeColor="rgba(255,0,0,0.6)"
          fillColor="rgba(255,0,0,0.15)"
        />
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.info}>Distance: {distance} m</Text>

        <TouchableOpacity style={styles.verify} onPress={verifyEmergency}>
          <Text style={styles.btnText}>VERIFY</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reject} onPress={rejectEmergency}>
          <Text style={styles.btnText}>REJECT / END</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.back} onPress={onBack}>
          <Text>⬅ Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  panel: { padding: 12, backgroundColor: "#fff" },
  info: { fontSize: 16, marginBottom: 8 },
  verify: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  reject: {
    backgroundColor: "#c62828",
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  back: { alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
