import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";

// ✅ FIXED notification handler (Expo SDK 50+ compatible)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // ✅ REQUIRED NOW
    shouldShowList: true,   // ✅ REQUIRED NOW
  }),
});

export async function registerForPushNotifications() {
  // Push notifications require physical device
  if (!Device.isDevice) {
    console.log("❌ Must use physical device for push notifications");
    return;
  }

  // Permissions
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

  // Expo push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("🔔 Expo Push Token:", token);

  // Save token in Firebase
  const user = auth.currentUser;
  if (user) {
    await set(ref(db, `pushTokens/${user.uid}`), token);
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF0000",
    });
  }
}
