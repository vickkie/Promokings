import { useEffect, useContext, useRef } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./registerPushNotification";
import { AuthContext } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";

// Ensure notifications are handled correctly
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PushNotification() {
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation();

  // Store listeners to prevent duplicate subscriptions
  const notificationListenerRef = useRef(null);
  const responseListenerRef = useRef(null);

  useEffect(() => {
    if (!userData || !userData._id) return;

    registerForPushNotificationsAsync(userData._id);

    // Ensure listeners are not re-registered
    if (!notificationListenerRef.current) {
      notificationListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);

        Notifications.scheduleNotificationAsync({
          content: {
            title: notification.request.content.title || "New Message",
            body: notification.request.content.body || "You have a new message!",
            data: notification.request.content.data || {},
          },
          trigger: null, // Immediately display in foreground
        });
      });
    }

    if (!responseListenerRef.current) {
      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked:", response);
        const data = response.notification.request.content.data;
        if (data?.conversationId) {
          navigation.navigate("ChatScreen", { conversationId: data.conversationId });
        }
      });
    }

    return () => {
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
        notificationListenerRef.current = null;
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
        responseListenerRef.current = null;
      }
    };
  }, [userData]);

  return null;
}
