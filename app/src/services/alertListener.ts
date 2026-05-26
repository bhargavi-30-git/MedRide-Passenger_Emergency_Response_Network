import { ref, onValue, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";
import { getDistanceInMeters } from "./geoUtils";

const TEST_DISTANCE_METERS = 20; // 🔥 use 20–50 meters outdoors

export function startAlertListener(
  setActiveEmergency: (e: any | null) => void
) {
  const user = auth.currentUser;
  if (!user) return;

  onValue(ref(db, "emergencies"), async (snapshot) => {
    if (!snapshot.exists()) {
      setActiveEmergency(null);
      return;
    }

    const myLocSnap = await get(ref(db, `locations/${user.uid}`));
    if (!myLocSnap.exists()) {
      setActiveEmergency(null);
      return;
    }

    const { lat: myLat, lng: myLng } = myLocSnap.val();
    const emergencies = snapshot.val();

    for (const id of Object.keys(emergencies)) {
      const e = emergencies[id];

      if (e.status !== "active") continue;
      if (e.userId === user.uid) continue;

      const distance = getDistanceInMeters(
        e.lat,
        e.lng,
        myLat,
        myLng
      );

      console.log("📏 Distance:", distance);

      if (distance <= TEST_DISTANCE_METERS) {
        setActiveEmergency({ id, ...e });
        return;
      }
    }

    setActiveEmergency(null);
  });
}
