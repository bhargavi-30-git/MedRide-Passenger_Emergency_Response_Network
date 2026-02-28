import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";

import { auth, db } from "./src/firebase/firebaseConfig";
import LoginScreen from "./src/screens/loginScreen";
import RegisterScreen from "./src/screens/registerScreen";
import MapScreen from "./src/screens/mapScreen";
import EmergencyScreen from "./src/screens/emergencyScreen";
import AdminDashboard from "./src/screens/adminDashboard";
import HospitalDashboard from "./src/screens/hospitalDashboard";
import AmbulanceTrackingScreen from "./src/screens/ambulanceTrackingScreen";
import { startLiveLocationUpdates } from "./src/services/locationService";

type Role = "USER" | "ADMIN" | "HOSPITAL";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [activeEmergency, setActiveEmergency] = useState<any>(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setActiveEmergency(null);
        setLoading(false);
        return;
      }

      const snap = await get(ref(db, `users/${u.uid}/role`));
      if (snap.exists()) setRole(snap.val());

      setLoading(false);
    });

    return unsub;
  }, []);

  /* ================= USER REALTIME FLOW ================= */
  useEffect(() => {
    if (!user || role !== "USER") return;

    startLiveLocationUpdates();

    const userRef = ref(db, `users/${user.uid}/activeEmergencyId`);

    const unsubUser = onValue(userRef, (snap) => {
      if (!snap.exists() || !snap.val()) {
        setActiveEmergency(null);
        return;
      }

      const emergencyId = snap.val();
      const emergencyRef = ref(db, `emergencies/${emergencyId}`);

      const unsubEmergency = onValue(emergencyRef, (emSnap) => {
        if (!emSnap.exists()) {
          setActiveEmergency(null);
          return;
        }

        const data = emSnap.val();

        if (data.status === "resolved") {
          setActiveEmergency(null);
          return;
        }

        setActiveEmergency({ id: emergencyId, ...data });
      });

      return () => unsubEmergency();
    });

    return () => unsubUser();
  }, [user, role]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= LOGIN ================= */
  if (!user) {
    return showLogin ? (
      <LoginScreen
        onSwitch={() => setShowLogin(false)}
        onLoginSuccess={(r) => setRole(r as Role)}
      />
    ) : (
      <RegisterScreen onSwitch={() => setShowLogin(true)} />
    );
  }

  /* ================= ROLE ROUTING ================= */
  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "HOSPITAL") return <HospitalDashboard />;

  /* ================= USER ROUTING ================= */

  if (activeEmergency?.status === "ambulance_enroute")
    return <AmbulanceTrackingScreen emergency={activeEmergency} />;

  if (activeEmergency)
    return <EmergencyScreen emergency={activeEmergency} />;

  return <MapScreen />;
}