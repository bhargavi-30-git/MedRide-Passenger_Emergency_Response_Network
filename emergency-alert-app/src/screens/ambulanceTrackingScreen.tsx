import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { resolveEmergency } from "../services/emergencyService";

export default function AmbulanceTrackingScreen({
  emergency,
}: {
  emergency: any;
}) {
  if (!emergency) return null;

  const handleResolve = async () => {
    await resolveEmergency();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={{
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
          title="Your Location"
        />
      </MapView>

      <View style={styles.bottomContainer}>
        <Text style={styles.message}>
          🚑 Ambulance is on the way
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleResolve}>
          <Text style={styles.buttonText}>RESOLVE EMERGENCY</Text>
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