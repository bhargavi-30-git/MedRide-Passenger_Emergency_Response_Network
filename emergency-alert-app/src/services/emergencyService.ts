import {
  ref,
  push,
  set,
  update,
  get,
} from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

const RADIUS_METERS = 1000;

/* ================= DISTANCE FUNCTION ================= */
function getDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ================= SEND PUSH ================= */
async function sendPush(
  tokens: string[],
  title: string,
  body: string
) {
  if (!tokens.length) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      tokens.map((token) => ({
        to: token,
        sound: "default",
        title,
        body,
        priority: "high",
        channelId: "emergency",
      }))
    ),
  });
}

/* ================= TRIGGER EMERGENCY ================= */
export async function triggerEmergency() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const locSnap = await get(ref(db, `locations/${user.uid}`));
  if (!locSnap.exists()) throw new Error("Location missing");

  const { lat, lng } = locSnap.val();

  const emergencyRef = push(ref(db, "emergencies"));

  await set(emergencyRef, {
    userId: user.uid,
    lat,
    lng,
    status: "pending",
    ambulanceAssigned: false,
    createdAt: Date.now(),
  });

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: emergencyRef.key,
  });

  const usersSnap = await get(ref(db, "users"));
  const tokensSnap = await get(ref(db, "pushTokens"));
  const locationsSnap = await get(ref(db, "locations"));

  const tokens: string[] = [];

  if (usersSnap.exists() && tokensSnap.exists()) {
    const usersData = usersSnap.val();
    const tokenData = tokensSnap.val();
    const locationsData = locationsSnap?.val() || {};

    Object.keys(usersData).forEach((uid) => {
      const role = usersData[uid].role;

      // ADMIN always notified
      if (role === "ADMIN" && tokenData[uid]) {
        tokens.push(tokenData[uid]);
      }

      // LISTENER within radius
      if (role === "LISTENER" && locationsData[uid]) {
        const distance = getDistanceInMeters(
          lat,
          lng,
          locationsData[uid].lat,
          locationsData[uid].lng
        );

        if (distance <= RADIUS_METERS && tokenData[uid]) {
          tokens.push(tokenData[uid]);
        }
      }
    });
  }

  await sendPush(
    tokens,
    "🚨 Emergency Alert",
    "Emergency reported nearby. Please respond immediately."
  );
}

/* ================= VERIFY EMERGENCY ================= */
export async function verifyEmergency(emergencyId: string) {
  await update(ref(db, `emergencies/${emergencyId}`), {
    status: "verified",
  });

  const usersSnap = await get(ref(db, "users"));
  const tokensSnap = await get(ref(db, "pushTokens"));

  const tokens: string[] = [];

  if (usersSnap.exists() && tokensSnap.exists()) {
    const usersData = usersSnap.val();
    const tokenData = tokensSnap.val();

    Object.keys(usersData).forEach((uid) => {
      if (usersData[uid].role === "HOSPITAL" && tokenData[uid]) {
        tokens.push(tokenData[uid]);
      }
    });
  }

  await sendPush(
    tokens,
    "🚑 Emergency Verified",
    "Emergency verified. Please dispatch ambulance."
  );
}

/* ================= RESOLVE ================= */
export async function resolveEmergency() {
  const user = auth.currentUser;
  if (!user) return;

  const userSnap = await get(ref(db, `users/${user.uid}`));
  if (!userSnap.exists()) return;

  const activeEmergencyId =
    userSnap.val().activeEmergencyId;

  if (!activeEmergencyId) return;

  await update(
    ref(db, `emergencies/${activeEmergencyId}`),
    {
      status: "resolved",
      ambulanceAssigned: false,
    }
  );

  await update(ref(db, `users/${user.uid}`), {
    activeEmergencyId: null,
  });
}