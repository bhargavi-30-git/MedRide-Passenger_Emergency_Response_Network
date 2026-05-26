import * as Location from "expo-location";
import { ref, set, update, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

let interval: any = null;

export async function startLiveLocationUpdates() {
  const user = auth.currentUser;
  if (!user || interval) return;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return;

  interval = setInterval(async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    await set(ref(db, `locations/${user.uid}`), {
      lat: latitude,
      lng: longitude,
      lastUpdated: Date.now(),
    });

    const userSnap = await get(ref(db, `users/${user.uid}`));
    if (userSnap.exists()) {
      const { activeEmergencyId } = userSnap.val();
      if (activeEmergencyId) {
        await update(ref(db, `emergencies/${activeEmergencyId}`), {
          lat: latitude,
          lng: longitude,
        });
      }
    }
  }, 5000);
}
