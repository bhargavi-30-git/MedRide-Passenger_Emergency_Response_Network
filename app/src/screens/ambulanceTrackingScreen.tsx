import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";

import { db, auth } from "../firebase/firebaseConfig";
import { resolveEmergency } from "../services/emergencyService";

export default function AmbulanceTrackingScreen({
  emergency,
}: {
  emergency: any;
}) {
  const mapRef = useRef<MapView>(null);

  const [ambulanceLocation, setAmbulanceLocation] =
    useState<any>(null);
  const [myLocation, setMyLocation] = useState<any>(null);

  const user = auth.currentUser;

  /* ================= USER LIVE LOCATION ================= */
  useEffect(() => {
    if (!user) return;

    const locRef = ref(db, `locations/${user.uid}`);

    const unsub = onValue(locRef, (snap) => {
      if (snap.exists()) {
        setMyLocation(snap.val());
      }
    });

    return () => unsub();
  }, [user]);

  /* ================= AMBULANCE LIVE LOCATION ================= */
  useEffect(() => {
    if (!emergency?.ambulanceId) return;

    const ambRef = ref(
      db,
      `ambulances/${emergency.ambulanceId}`
    );

    const unsub = onValue(ambRef, (snap) => {
      if (snap.exists()) {
        setAmbulanceLocation(snap.val());
      }
    });

    return () => unsub();
  }, [emergency]);

  /* ================= AUTO FIT BOTH MARKERS ================= */
  useEffect(() => {
    if (!mapRef.current || !myLocation || !ambulanceLocation)
      return;

    mapRef.current.fitToCoordinates(
      [
        {
          latitude: myLocation.lat,
          longitude: myLocation.lng,
        },
        {
          latitude: ambulanceLocation.lat,
          longitude: ambulanceLocation.lng,
        },
      ],
      {
        edgePadding: {
          top: 100,
          right: 100,
          bottom: 100,
          left: 100,
        },
        animated: true,
      }
    );
  }, [myLocation, ambulanceLocation]);

  if (!myLocation) return null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: myLocation.lat,
          longitude: myLocation.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* 🔵 USER MARKER */}
        <Marker
          coordinate={{
            latitude: myLocation.lat,
            longitude: myLocation.lng,
          }}
          pinColor="blue"
          title="Your Location"
        />

        {/* 🚑 AMBULANCE MARKER */}
        {ambulanceLocation && (
          <Marker
            coordinate={{
              latitude: ambulanceLocation.lat,
              longitude: ambulanceLocation.lng,
            }}
            title="Ambulance"
          >
            <Text style={{ fontSize: 25 }}>🚑</Text>
          </Marker>
        )}
      </MapView>

      <View style={styles.bottomContainer}>
        <Text style={styles.message}>
          🚑 Ambulance is on the way
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={resolveEmergency}
        >
          <Text style={styles.buttonText}>
            RESOLVE EMERGENCY
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});