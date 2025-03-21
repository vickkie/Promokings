import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_PORT, EAS_PROJECT_ID } from "@env";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    console.log("Must use a physical device for push notifications");
    return;
  }

  const lastCheck = await AsyncStorage.getItem("lastNotificationPermissionCheck");
  const now = Date.now();
  const CHECK_INTERVAL = 60000;

  if (lastCheck && now - parseInt(lastCheck) < CHECK_INTERVAL) {
    console.log("Skipping permission check: Checked recently.");
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
    console.log("Failed to get push token for push notification");
    return;
  }

  console.log("Notification permission granted:", status);

  await AsyncStorage.setItem("lastNotificationPermissionCheck", now.toString());

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? EAS_PROJECT_ID;
  if (!projectId) {
    console.error("Missing EAS Project ID! Push notifications may fail.");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log("Expo Push Token:", token);

  try {
    const response = await axios.post(`${BACKEND_PORT}/api/notification/updatePushToken`, {
      userId,
      expoPushToken: token,
    });

    console.log("Push token updated successfully", response.data);
  } catch (err) {
    console.error("Error updating push token:", err);
  }
}

export function startPermissionCheck(userId) {
  const interval = setInterval(async () => {
    console.log("Checking notification permission...");

    const { status } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      console.log("Permission granted, stopping checks.");
      clearInterval(interval);
      registerForPushNotificationsAsync(userId);
    } else if (status === "denied") {
      console.log("Permission denied. User needs to enable manually.");
    } else {
      console.log("Permission status is unknown or not determined yet.");
    }
  }, 30000);
}
