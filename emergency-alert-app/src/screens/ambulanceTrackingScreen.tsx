import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function AmbulanceTrackingScreen({ emergency }: any) {
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
          title="Emergency Location"
        />
      </MapView>

      <View style={styles.bottom}>
        <Text style={styles.text}>
          🚑 Ambulance is on the way
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 8,
  },
  text: { color: "#fff", fontWeight: "bold" },
});