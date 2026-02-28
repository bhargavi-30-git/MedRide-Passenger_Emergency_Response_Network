import { ref, push, set, update, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

/* ================= TRIGGER ================= */
export async function triggerEmergency() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const userSnap = await get(ref(db, `users/${user.uid}`));
  if (!userSnap.exists()) throw new Error("User data missing");

  const userData = userSnap.val();

  const locSnap = await get(ref(db, `locations/${user.uid}`));
  if (!locSnap.exists()) throw new Error("Location missing");

  if (userData.activeEmergencyId)
    throw new Error("Emergency already active");

  const { lat, lng } = locSnap.val();
  const emergencyRef = push(ref(db, "emergencies"));

  await set(emergencyRef, {
    userId: user.uid,
    name: userData.name,
    vehicleNo: userData.vehicleNo,
    phone: userData.phone,
    lat,
    lng,
    status: "pending",
    ambulanceAssigned: false,
    createdAt: Date.now(),
  });

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: emergencyRef.key,
  });
}

/* ================= RESOLVE ================= */
export async function resolveEmergency() {
  const user = auth.currentUser;
  if (!user) return;

  const userSnap = await get(ref(db, `users/${user.uid}`));
  if (!userSnap.exists()) return;

  const emergencyId = userSnap.val().activeEmergencyId;
  if (!emergencyId) return;

  await update(ref(db, `emergencies/${emergencyId}`), {
    status: "resolved",
  });

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: null,
  });
}