import { View, Text, Button, StyleSheet } from "react-native";
import { resolveEmergency } from "../services/emergencyService";

export default function EmergencyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 EMERGENCY ACTIVE</Text>

      <Text style={styles.subtitle}>
        Your live location is being shared
      </Text>

      <Button title="✅ RESOLVE EMERGENCY" onPress={resolveEmergency} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b00020",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 26,
    marginBottom: 20,
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 40,
  },
});
