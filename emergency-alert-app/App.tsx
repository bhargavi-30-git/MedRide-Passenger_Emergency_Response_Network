import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue } from "firebase/database";

import { auth, db } from "./src/firebase/firebaseConfig";
import LoginScreen from "./src/screens/loginScreen";
import RegisterScreen from "./src/screens/registerScreen";
import MapScreen from "./src/screens/mapScreen";
import EmergencyScreen from "./src/screens/emergencyScreen";
import { startLiveLocationUpdates } from "./src/services/locationService";
import { registerForPushNotifications } from "./src/services/notificationService";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [activeEmergency, setActiveEmergency] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    startLiveLocationUpdates();
    registerForPushNotifications();

    onValue(ref(db, `users/${user.uid}/activeEmergencyId`), (snap) => {
      setActiveEmergency(snap.exists() ? snap.val() : null);
    });
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return showLogin ? (
      <LoginScreen onSwitch={() => setShowLogin(false)} />
    ) : (
      <RegisterScreen onSwitch={() => setShowLogin(true)} />
    );
  }

  if (activeEmergency) {
    return <EmergencyScreen />;
  }

  return <MapScreen />;
}
