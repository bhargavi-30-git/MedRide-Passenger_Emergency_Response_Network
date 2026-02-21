import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { resolveEmergency } from "../services/emergencyService";

export default function EmergencyScreen({
  emergency,
}: {
  emergency: any;
}) {
  if (!emergency) {
    return (
      <View style={styles.container}>
        <Text>Loading emergency...</Text>
      </View>
    );
  }

  const handleResolve = async () => {
    await resolveEmergency();
  };

  let message = "";

  switch (emergency.status) {
    case "pending":
      message = "🚑 Emergency sent. Waiting for admin verification...";
      break;
    case "verified":
      message = "✅ Emergency verified. Hospital notified.";
      break;
    case "ambulance_enroute":
      message = "🚑 Ambulance is on the way!";
      break;
    default:
      message = "Processing emergency...";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>

      {/* 🔥 ALWAYS SHOW RESOLVE BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleResolve}>
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
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#d32f2f",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});