import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";
import { triggerEmergency } from "../services/emergencyService";

export default function MapScreen() {
  const [myLocation, setMyLocation] = useState<any>(null);
  const [emergency, setEmergency] = useState<any>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // 🔵 My live location
    onValue(ref(db, `locations/${user.uid}`), (snap) => {
      if (snap.exists()) setMyLocation(snap.val());
    });

    // 🚨 Active emergency (other users)
    onValue(ref(db, "emergencies"), (snap) => {
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
  }, []);

  if (!myLocation) return null;

  const startEmergency = async () => {
    try {
      await triggerEmergency();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        region={{
          latitude: myLocation.lat,
          longitude: myLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {/* 🚨 EMERGENCY VEHICLE WITH SIREN ICON */}
        {emergency && (
          <Marker
            coordinate={{
              latitude: emergency.lat,
              longitude: emergency.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={require("../../assets/siren.png")}
              style={styles.sirenIcon}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>

      {/* 🚨 EMERGENCY BUTTON */}
      <TouchableOpacity style={styles.emergencyButton} onPress={startEmergency}>
        <Text style={styles.emergencyText}>🚨 EMERGENCY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  emergencyButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  emergencyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  sirenIcon: {
    width: 50,
    height: 50,
  },
});
