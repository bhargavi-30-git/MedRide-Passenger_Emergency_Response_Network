import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { ref, set, remove } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/* ================= REGISTER PUSH ================= */
export async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  const user = auth.currentUser;
  if (user) {
    await set(ref(db, `pushTokens/${user.uid}`), token);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("emergency", {
      name: "Emergency Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 800, 400, 800],
      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
}

/* ================= UNREGISTER ================= */
export async function unregisterPushNotifications() {
  const user = auth.currentUser;
  if (!user) return;

  await remove(ref(db, `pushTokens/${user.uid}`));
}