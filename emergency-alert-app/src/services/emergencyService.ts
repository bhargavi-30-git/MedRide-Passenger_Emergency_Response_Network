import { ref, push, set, update, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

/* ================= TRIGGER EMERGENCY ================= */
export async function triggerEmergency() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  // Get user data
  const userSnap = await get(ref(db, `users/${user.uid}`));
  if (!userSnap.exists()) throw new Error("User data missing");

  const userData = userSnap.val();

  // Get live location
  const locSnap = await get(ref(db, `locations/${user.uid}`));
  if (!locSnap.exists()) throw new Error("Location missing");

  const { lat, lng } = locSnap.val();

  // Prevent multiple active emergencies
  if (userData.activeEmergencyId) {
    throw new Error("Emergency already active");
  }

  const emergencyRef = push(ref(db, "emergencies"));

  await set(emergencyRef, {
    userId: user.uid,
    name: userData.name,
    vehicleNo: userData.vehicleNo,
    phone: userData.phone,
    lat,
    lng,
    status: "pending",            // pending → verified → ambulance_enroute → resolved
    verified: false,
    ambulanceAssigned: false,
    assignedHospitalId: null,
    createdAt: Date.now(),
  });

  // Save emergency reference in user
  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: emergencyRef.key,
  });
}

/* ================= RESOLVE EMERGENCY ================= */
export async function resolveEmergency() {
  const user = auth.currentUser;
  if (!user) return;

  const userSnap = await get(ref(db, `users/${user.uid}`));
  if (!userSnap.exists()) return;

  const activeEmergencyId = userSnap.val().activeEmergencyId;

  if (!activeEmergencyId) return;

  // Update emergency status
  await update(ref(db, `emergencies/${activeEmergencyId}`), {
    status: "resolved",
  });

  // Clear user's active emergency
  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: null,
  });
}