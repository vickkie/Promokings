import { useEffect, useContext } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./registerPushNotification";
import { AuthContext } from "./AuthContext";

export default function PushNotification() {
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    if (!userData || !userData._id) return;

    registerForPushNotificationsAsync(userData._id);

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification Received:", notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, [userData]);

  return null;
}
