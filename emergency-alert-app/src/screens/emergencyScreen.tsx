import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

export default function EmergencyScreen() {
  const [status, setStatus] = useState<
    "pending" | "verified" | "ended"
  >("pending");
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);

    const unsub = onValue(userRef, (snap) => {
      if (!snap.exists() || !snap.val().activeEmergencyId) {
        // Emergency cleared (by admin or user)
        setStatus("ended");
        setLoading(false);
        return;
      }

      const emergencyId = snap.val().activeEmergencyId;
      const emRef = ref(db, `emergencies/${emergencyId}`);

      onValue(emRef, (emSnap) => {
        if (!emSnap.exists()) return;

        const em = emSnap.val();

        if (em.status === "resolved") {
          setStatus("ended");
        } else if (em.verifiedByAdmin) {
          setStatus("verified");
        } else {
          setStatus("pending");
        }

        setLoading(false);
      });
    });

    return () => unsub();
  }, []);

  const resolveByUser = async () => {
    if (!user) return;

    Alert.alert(
      "Resolve Emergency",
      "Are you sure the emergency is over?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const userSnap = await new Promise<any>((res) =>
              onValue(
                ref(db, `users/${user.uid}`),
                (s) => res(s),
                { onlyOnce: true }
              )
            );

            if (!userSnap.exists()) return;
            const emergencyId = userSnap.val().activeEmergencyId;
            if (!emergencyId) return;

            await update(ref(db, `emergencies/${emergencyId}`), {
              status: "resolved",
            });

            await update(ref(db, `users/${user.uid}`), {
              activeEmergencyId: null,
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {status === "pending" && (
        <Text style={styles.pending}>
          🚑 Emergency sent. Waiting for admin verification…
        </Text>
      )}

      {status === "verified" && (
        <Text style={styles.verified}>
          ✅ Emergency verified by traffic control
        </Text>
      )}

      {status === "ended" && (
        <Text style={styles.ended}>
          ❌ Emergency ended
        </Text>
      )}

      {status !== "ended" && (
        <TouchableOpacity
          style={styles.resolveBtn}
          onPress={resolveByUser}
        >
          <Text style={styles.btnText}>RESOLVE EMERGENCY</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pending: {
    fontSize: 18,
    color: "#f57c00",
    textAlign: "center",
    marginBottom: 20,
  },
  verified: {
    fontSize: 18,
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 20,
  },
  ended: {
    fontSize: 18,
    color: "#c62828",
    textAlign: "center",
    marginBottom: 20,
  },
  resolveBtn: {
    backgroundColor: "#c62828",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
