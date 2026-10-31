# Architecture - Promokings (mobile)

Expo SDK 50 / React Native app covering customer shopping and all staff
roles in one binary. Route names are centralized in `navigation/routes.js`.

## Session and auth

- `components/auth/AuthContext.js` - session source of truth. JWT lives in
  `expo-secure-store`; non-secret profile blob in AsyncStorage
  (`constants/storageKeys.js` registry).
- `utils/api.js` - axios instance; `setAuthToken` applies the bearer header
  globally after login/restore.
- Role helpers: `getRole()` decodes the `role` claim; `hasRole()` delegates
  to it (no drift on claim shape).
- `FirebaseSessionSync.jsx` - on session start, mints a Firebase custom
  token via `POST /api/auth/firebase-token` and `signInWithCustomToken` so
  RTDB rules (auth required) allow chat writes; signs out on logout.

## Navigation and role gating

`App.js` registers one stack with customer and staff navigators:

- `RoleGuard` + `NoAccessScreen` gate the six staff navigators
  (inventory/finance/dispatcher/sales/supplier/driver) by token role.
- `SessionRoleRedirect` - after login or session restore, resets the root
  stack to the `ROLE_ROUTES` target while still on the customer landing.
- `navigation/navigationRef.js` exposes navigation outside the tree
  (notification tap → ChatScreen).

## Backend integration

REST under `BACKEND_PORT` (see backend docs/API.md). Chat runs on Firebase
RTDB, not REST: `ChatListScreen`/`ChatScreen` read+write
`messages/{idA_idB}` directly; the backend watcher fans out pushes.

## Push notifications

Two channels reconcile to one inbox:

- `components/auth/OneSignalId.jsx` - OneSignal v5 SDK init (skips Expo Go
  and missing `ONESIGNAL_APP_ID`), `OneSignal.login(userId)`, posts the
  subscription id to `/api/notification/updateOneSignal`.
- `registerPushNotification.js` - permission flow; `pushNotification.js`
  renders the in-app banner card (safe-area aware) with a serial queue;
  tap navigates to ChatScreen via notificationRef.

## Other subsystems

- `contexts/` - Cart, Wishlist, ProfileCompletion (AsyncStorage-backed).
- `components/ProfilePaletteBackdrop.jsx` - shared cached palette
  extraction for profile headers (hidden ColorThief WebView, AsyncStorage
  per-URL cache).
- `components/UpdateCheck.jsx` - polls `/api/version/latest` for forced
  update prompts.
- `components/GoogleSignInButton.jsx` - probes
  `/api/auth/capabilities`, expo-auth-session PKCE, customer audience only.
- `utils/storage.js`, `utils/logger.js` (`__DEV__` gated), error boundaries
  wrapping root navigators.

## Screen inventory

All screens live under `screens/`, organized by role group. Registration
happens in the role navigators under `navigation/`; names come from
`navigation/routes.js`.

### Customer

| Area | Screens |
|---|---|
| Onboarding/auth | `LoginPage`, `Register`, `SupplierRegister`, `UserProfileCompletion` |
| Shopping | `Home`, `Categories`, `Search`, `Products`, `Cart`, `Checkout`, `OrderSuccess`, `Payments` |
| Account | `Profile`, `Orders`, `OrderDetails`, `Favourites`, `UserDetails` |
| Support | `ChatListScreen`, `ChatScreen`, `HelpListScreen`, `HelpAgentChatScreen`, `MessageCenter`, `SystemMessages`, `Faqs`, `Help` |
| Static | `About`, `AboutUs` |

### Staff - shared

| Screen | Purpose |
|---|---|
| `Staff/ProfileCompletion` | Onboarding flow for `staff-pending` accounts |
| `Staff/StaffProfileSettings` | Shared profile editor for all staff roles |

### Staff - Inventory (`navigation/InventoryTabNavigation.jsx`)

| Area | Screens |
|---|---|
| Dashboard and account | `InventoryDashboard`, `InventoryProfile`, `Settings` |
| Overview | `MainCenter`, `LatestProducts` |
| Products | `ProductList`, `ProductListCard`, `PreviewProduct`, `AddProduct`, `EditProduct` |
| Categories | `CategoriesList`, `CategoriesListBox`, `CategoryCardView`, `AddCategory`, `EditCategory` |
| Bids | `BidList`, `BIdListCard`, `BidDetails`, `AddBid`, `EditBid`, `FinalBids` |

### Staff - Dispatcher (`navigation/DispatcherTabNavigation.jsx`)

| Area | Screens |
|---|---|
| Dashboard and account | `DispatchDashboard`, `DispatchProfile`, `DispatchSettings` |
| Shipments | `LatestShipments`, `DispatchShipment` |
| Orders | `OrdersList`, `Orders`, `EditOrder`, `OrderSalesDetails`, `DeliveryDetails` |
| Drivers | `DriversList`, `DriverDetails` |

### Staff - Driver (`navigation/DriverTabNavigator.jsx`)

| Area | Screens |
|---|---|
| Dashboard and account | `DriverDashboard`, `DriverProfile`, `DriverSettings` |
| Shipments | `ShipmentList`, `LatestShipments`, `ShipmentDetails`, `EditShipment`, `ShipmentsHistory`, `ShipmentSearch` |
| Products | `LatestProducts` |

### Staff - Finance (`navigation/FinanceTabNavigator.jsx`)

| Area | Screens |
|---|---|
| Dashboard and account | `FinanceDashboard`, `FinanceProfile`, `FinanceSettings` |
| Reports | `FinanceReportScreen`, `SalesChart` |
| Order payments | `Payments`, `PaymentsList`, `LatestPayments`, `OrderPaymentDetails`, `EditPaymentDetails`, `HistoryList`, `PaymentsHistory` |
| Supplier payments | `SupplierPayments`, `SupplierPaymentList`, `SupplierPaymentDetails`, `EditSupplierPaymentDetails`, `SupplierPaymentTracker`, `SupplierInvoiceScreen` |

### Staff - Sales (`navigation/SalesTabNavigation.jsx`)

| Area | Screens |
|---|---|
| Dashboard and account | `SalesDashboard`, `SalesProfile`, `SalesSettings` |
| Reports | `SalesOverview`, `SalesData`, `SalesChart`, `SalesBest`, `SalesBestCard`, `SalesReportScreen` |
| Orders | `LatestOrders`, `OrdersList`, `Orders`, `OrderSalesDetails`, `EditOrder`, `DeliveryDetails`, `SalesShipment`, `InvoiceScreen` |

### Staff - Supplier (`navigation/SupplierTabNavigation.jsx`)

| Area | Screens |
|---|---|
| Dashboard and account | `SupplierDashboard`, `SupplierProfile`, `SupplierSettings`, `CompanyProfile` |
| Supply | `MySupply`, `SupplyDetails` |
| Requests | `InventoryRequests`, `RequestCard` |
| Orders and reports | `LatestOrders`, `SalesChart` |
| Payments | `PaymentsList`, `SupplyPayments`, `SupplyReceiptScreen`, `SupplierPaymentProfile`, `SupplierPaymentTracker` |


## Build

`babel.config.js`: babel-preset-expo + react-native-dotenv (@env) +
reanimated + `transform-remove-console` in production. EAS profiles in
`eas.json` drive dev-client and production builds; `app.json` holds schemes
(`promokings`, `com.uzitrake.promokings`) and the OneSignal plugin.
