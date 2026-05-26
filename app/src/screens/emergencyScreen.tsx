import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { resolveEmergency } from "../services/emergencyService";

export default function EmergencyScreen({
  emergency,
}: {
  emergency: any;
}) {
  if (!emergency) return null;

  let message = "";

  if (emergency.status === "pending")
    message = "Waiting for admin verification...";
  else if (emergency.status === "verified")
    message = "Emergency verified. Hospital notified.";
  else if (emergency.status === "ambulance_enroute")
    message = "Ambulance is on the way.";

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.button} onPress={resolveEmergency}>
        <Text style={styles.buttonText}>RESOLVE EMERGENCY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});