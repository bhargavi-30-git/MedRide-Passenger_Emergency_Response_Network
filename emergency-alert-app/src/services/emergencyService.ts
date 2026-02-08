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

  // 🚨 CREATE EMERGENCY
  const emergencyRef = push(ref(db, "emergencies"));
  await set(emergencyRef, {
    userId: user.uid,
    lat,
    lng,
    status: "active",
    verifiedByAdmin: false,
    createdAt: Date.now(),
  });

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: emergencyRef.key,
  });

  // 🔔 SEND PUSH ONLY TO USERS (NOT ADMIN)
  const usersSnap = await get(ref(db, "users"));
  const tokensSnap = await get(ref(db, "pushTokens"));

  if (!usersSnap.exists() || !tokensSnap.exists()) return;

  const users = usersSnap.val();
  const tokens = tokensSnap.val();

  const pushMessages: any[] = [];

  for (const uid of Object.keys(tokens)) {
    // 🔒 ROLE CHECK
    if (!users[uid] || users[uid].role !== "USER") continue;

    // 🔒 DO NOT NOTIFY EMERGENCY CREATOR
    if (uid === user.uid) continue;

    pushMessages.push({
      to: tokens[uid],
      sound: "default",
      title: "🚨 Emergency Nearby",
      body: "An emergency vehicle is approaching. Please give way.",
    });
  }

  if (pushMessages.length === 0) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pushMessages),
  });
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
