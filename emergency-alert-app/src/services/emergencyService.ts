import { ref, push, set, update, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

export async function triggerEmergency() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const userSnap = await get(ref(db, `users/${user.uid}`));
  if (userSnap.exists() && userSnap.val().activeEmergencyId) {
    throw new Error("Emergency already active");
  }

  const locSnap = await get(ref(db, `locations/${user.uid}`));
  if (!locSnap.exists()) throw new Error("Location missing");

  const { lat, lng } = locSnap.val();

  const emergencyRef = push(ref(db, "emergencies"));
  await set(emergencyRef, {
    userId: user.uid,
    lat,
    lng,
    status: "active",
    createdAt: Date.now(),
  });

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: emergencyRef.key,
  });

  // 🔔 SEND PUSH NOTIFICATION TO LISTENERS
  const tokensSnap = await get(ref(db, "pushTokens"));
  if (tokensSnap.exists()) {
    const tokens = Object.values(tokensSnap.val());

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        tokens.map((token: any) => ({
          to: token,
          sound: "default",
          title: "🚨 Emergency Nearby",
          body: "An emergency vehicle is approaching. Please give way.",
        }))
      ),
    });
  }
}

export async function resolveEmergency() {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await get(ref(db, `users/${user.uid}`));
  if (!snap.exists()) return;

  const { activeEmergencyId } = snap.val();
  if (!activeEmergencyId) return;

  await update(ref(db, `emergencies/${activeEmergencyId}`), {
    status: "resolved",
  });

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: null,
  });
}
