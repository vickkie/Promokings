// AsyncStorage key registry - one place to keep key strings in sync
// across readers and writers.
export const STORAGE_KEYS = {
  USER_ID: "id",
  CART: "cart",
  WISHLIST: "wishlist",
  SHIPPING_DATA: "shippingdata",
  CACHED_FAQS: "cachedFaqs",
  PROFILE_COMPLETION: "profileCompletion",
  LAST_NOTIFICATION_PERMISSION_CHECK: "lastNotificationPermissionCheck",
  SKIPPED_VERSION: "skipped_version",
};

export const userProfileKey = (userId) => `user${userId}`;
