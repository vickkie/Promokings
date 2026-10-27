// Shared jest environment: storage mocks plus stubs for the push registration
// and native side effects a render must never trigger.
jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("./components/auth/registerPushNotification", () => ({
  ensureNotificationPermission: jest.fn(async () => true),
  startPermissionCheck: jest.fn(),
}));

jest.mock("react-native-onesignal", () => ({
  OneSignal: {
    initialize: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    User: { pushSubscription: { id: null } },
    Notifications: { addEventListener: jest.fn() },
  },
}));

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
