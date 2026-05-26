import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from "react";
import { triggerEmergency, resolveEmergency } from "../services/emergencyService";
import { startAlertListener } from "../services/alertListener";
import { startLiveLocationUpdates } from "../services/locationService";

export default function HomeScreen() {
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);

  useEffect(() => {
    startLiveLocationUpdates();
    startAlertListener(setActiveEmergency);
  }, []);

  const startEmergency = async () => {
    try {
      await triggerEmergency();
      Alert.alert("🚨 Emergency started");
    } catch (err: any) {
      Alert.alert("Cannot start emergency", err.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {activeEmergency && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            🚨 Emergency vehicle nearby. Please give way.
          </Text>
        </View>
      )}

      <View style={styles.container}>
        <Text style={styles.title}>Emergency Control</Text>

        <Button title="🚨 START EMERGENCY" onPress={startEmergency} />

        <View style={{ marginTop: 10 }}>
          <Button title="✅ RESOLVE EMERGENCY" onPress={resolveEmergency} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  alertBanner: {
    backgroundColor: "red",
    padding: 15,
  },
  alertText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
