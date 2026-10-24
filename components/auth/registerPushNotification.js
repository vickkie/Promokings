import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Push identity now registers with the backend as OneSignal subscription
// ids via /api/notification/updateOneSignal (OneSignalId.jsx). The expo
// push-token POST to /api/notification/updatePushToken is retired so the
// same device can no longer double-register. What remains is the OS
// permission request plus the Android channel the in-app foreground
// banner still relies on.

export async function ensureNotificationPermission() {
  if (!Device.isDevice) {
    console.log("Must use a physical device for push notifications");
    return;
  }

  const lastCheck = await AsyncStorage.getItem("lastNotificationPermissionCheck");
  const now = Date.now();
  const CHECK_INTERVAL = 60000;

  if (lastCheck && now - parseInt(lastCheck) < CHECK_INTERVAL) {
    return;
  }

  let { status } = await Notifications.getPermissionsAsync();

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const { status: androidStatus } = await Notifications.requestPermissionsAsync();
    status = androidStatus;
  } else if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("alarms", {
      name: "Scheduled Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#a7e7fa",
    });
  }

  if (status !== "granted") {
    console.log("Notification permission not granted");
    return;
  }

  await AsyncStorage.setItem("lastNotificationPermissionCheck", now.toString());
}

export function startPermissionCheck() {
  const interval = setInterval(async () => {
    console.log("Checking notification permission...");

    const { status } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      console.log("Permission granted, stopping checks.");
      clearInterval(interval);
      ensureNotificationPermission();
    } else if (status === "denied") {
      console.log("Permission denied. User needs to enable manually.");
    } else {
      console.log("Permission status is unknown or not determined yet.");
    }
  }, 30000);
}
