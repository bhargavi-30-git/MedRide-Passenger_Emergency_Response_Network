import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";
import * as Notifications from "expo-notifications";

import { auth, db } from "./src/firebase/firebaseConfig";
import LoginScreen from "./src/screens/loginScreen";
import RegisterScreen from "./src/screens/registerScreen";
import MapScreen from "./src/screens/mapScreen";
import EmergencyScreen from "./src/screens/emergencyScreen";
import AdminDashboard from "./src/screens/adminDashboard";

import { startLiveLocationUpdates } from "./src/services/locationService";
import { registerForPushNotifications } from "./src/services/notificationService";

type Role = "ADMIN" | "USER";

/* ✅ SDK 54+ CORRECT HANDLER */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // REQUIRED
    shouldShowList: true,     // REQUIRED
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [activeEmergency, setActiveEmergency] = useState<string | null>(null);

  // 🔹 Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      const snap = await get(ref(db, `users/${u.uid}/role`));
      if (snap.exists()) {
        setUserRole(snap.val());
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  // 🔹 USER-only services
  useEffect(() => {
    if (!user || userRole !== "USER") return;

    startLiveLocationUpdates();
    registerForPushNotifications();

    const emergencyRef = ref(db, `users/${user.uid}/activeEmergencyId`);
    const unsub = onValue(emergencyRef, (snap) => {
      setActiveEmergency(snap.exists() ? snap.val() : null);
    });

    return () => unsub();
  }, [user, userRole]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔹 Not logged in
  if (!user) {
    return showLogin ? (
      <LoginScreen
        onSwitch={() => setShowLogin(false)}
        onLoginSuccess={(role) => setUserRole(role)}
      />
    ) : (
      <RegisterScreen onSwitch={() => setShowLogin(true)} />
    );
  }

  // 🔹 ADMIN FLOW
  if (userRole === "ADMIN") {
    return <AdminDashboard />;
  }

  // 🔹 USER FLOW
  if (activeEmergency) {
    return <EmergencyScreen />;
  }

  return <MapScreen />;
}
