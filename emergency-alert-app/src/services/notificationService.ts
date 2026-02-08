import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { ref, set, remove, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // needed for iOS foreground
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,   // REQUIRED (SDK 53+)
    shouldShowList: true,     // REQUIRED (SDK 53+)
  }),
});

export async function registerForPushNotifications() {
  // Must be physical device
  if (!Device.isDevice) {
    console.log("❌ Push notifications need physical device");
    return;
  }

  const user = auth.currentUser;
  if (!user) return;

  //  ROLE CHECK — ADMIN NEVER REGISTERS
  const roleSnap = await get(ref(db, `users/${user.uid}/role`));
  if (!roleSnap.exists() || roleSnap.val() !== "USER") {
    console.log("ℹ️ Push skipped (not USER role)");
    return;
  }

  //  Permissions
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("❌ Notification permission denied");
    return;
  }

  // Expo Push Token
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  

  // Save token (per USER only)
  await set(ref(db, `pushTokens/${user.uid}`), token);

  // Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF0000",
    });
  }
}


export async function unregisterPushNotifications() {
  const user = auth.currentUser;
  if (!user) return;

  console.log("🧹 Removing push token for user:", user.uid);

  await remove(ref(db, `pushTokens/${user.uid}`));
  await Notifications.cancelAllScheduledNotificationsAsync();
}
