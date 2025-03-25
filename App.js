import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useContext } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundary2 from "./screens_options/ErrorBoundary";

import { AuthProvider } from "./components/auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProfileCompletionProvider } from "./components/auth/ProfileCompletionContext";
import { WishProvider } from "./contexts/WishContext";
import { chatScreenOptions, systemScreenOptions } from "./screens_options/AppHeaderOptions";

import { navigationRef } from "./Helpers/NavigationService";

// Screens from ./screens
import {
  Cart,
  OrderDetails,
  ProductDetails,
  Products,
  OrderSuccess,
  LoginPage,
  Favourites,
  Orders,
  Register,
  Categories,
  Checkout,
  UserDetails,
  MessageCenter,
  Help,
  About,
  AboutUs,
  Faqs,
  Home,
  SystemMessages,
  InventoryDashboard,
  AddProduct,
  EditProductList,
  StaffSettings,
  EditProduct,
  EditCategoriesList,
  AddCategory,
  EditCategory,
  PreviewProduct,
  SalesDashboard,
  OrdersSales,
  OrderSalesDetails,
  EditSalesOrder,
  SalesOverview,
  SalesData,
  SalesShipments,
  DeliveryDetails,
  SalesProfile,
  SalesSettings,
  InventoryProfile,
  DriverList,
  DriverDetails,
  DriverSettings,
  DriverProfile,
  ShipmentList,
  InvoiceScreen,
  ShipmentHistory,
  ShipmentSearch,
  ShipmentDetails,
  EditShipmentDriver,
  FinanceDashboard,
  OrderPaymentDetails,
  EditPaymentDetails,
  PaymentList,
  Payments,
  PaymentsHistory,
  FinanceProfile,
  FinanceSettings,
  ChatListScreen,
  ChatScreen,
  EditDispatchOrder,
  OrderDispatchDetails,
  OrdersDispatch,
  DispatchShipments,
  DispatcherSettings,
  DispatcherProfile,
  DeliveryDispatchDetails,
  MainCenter,
  AddBid,
  SupplierProfile,
  SupplierDashboard,
  SupplierSettings,
  BidList,
  InventoryRequests,
} from "./screens";

import BottomTabNavigation from "./navigation/BottomTabNavigation";
import InventoryTabNavigation from "./navigation/InventoryTabNavigation";
import SalesTabNavigation from "./navigation/SalesTabNavigation";
import UpdateCheck from "./components/UpdateCheck";
import DriverTabNavigation from "./navigation/DriverTabNavigator";
import FinanceTabNavigation from "./navigation/FinanceTabNavigator";
import SupplierTabNavigation from "./navigation/SupplierTabNavigation";
// import OneSignalId from "./components/auth/oneSignal";
import DispatcherTabNavigation from "./navigation/DispatcherTabNavigation ";

import PushNotification from "./components/auth/pushNotification";

enableScreens();

const Stack = createNativeStackNavigator();

// Array of screen definitions
const screens = [
  { name: "Finance Navigation", component: FinanceTabNavigation, options: { headerShown: false } },
  { name: "Supplier Navigation", component: SupplierTabNavigation, options: { headerShown: false } },
  { name: "Bottom Navigation", component: BottomTabNavigation, options: { headerShown: false } },
  { name: "Inventory Navigation", component: InventoryTabNavigation, options: { headerShown: false } },
  { name: "Sales Navigation", component: SalesTabNavigation, options: { headerShown: false } },
  { name: "Driver Navigation", component: DriverTabNavigation, options: { headerShown: false } },
  { name: "Dispatch Navigation", component: DispatcherTabNavigation, options: { headerShown: false } },
  { name: "EditCategoriesList", component: EditCategoriesList, options: { headerShown: false } },
  { name: "Home", component: Home, options: { headerShown: false } },
  { name: "EditCategory", component: EditCategory, options: { headerShown: false } },
  { name: "AddCategory", component: AddCategory, options: { headerShown: false } },
  { name: "StaffSettings", component: StaffSettings, options: { headerShown: false } },
  { name: "EditProductsList", component: EditProductList, options: { headerShown: false } },
  { name: "BidList", component: BidList, options: { headerShown: false } },
  { name: "PreviewProduct", component: PreviewProduct, options: { headerShown: false } },
  { name: "EditProduct", component: EditProduct, options: { headerShown: false } },
  { name: "Add Product", component: AddProduct, options: { headerShown: false } },
  { name: "AddBid", component: AddBid, options: { headerShown: false } },
  { name: "Login", component: LoginPage, options: { headerShown: false } },
  { name: "ProductDetails", component: ProductDetails, options: { headerShown: false } },
  { name: "ProductList", component: Products, options: { headerShown: false } },
  { name: "Favourites", component: Favourites, options: { headerShown: false } },
  { name: "Categories", component: Categories, options: { headerShown: true } },
  { name: "Cart", component: Cart, options: { headerShown: false } },
  { name: "Checkout", component: Checkout, options: { headerShown: false } },
  { name: "Orders", component: Orders, options: { headerShown: false } },
  { name: "Register", component: Register, options: { headerShown: false } },
  { name: "UserDetails", component: UserDetails, options: { headerShown: false } },
  { name: "Message", component: MessageCenter, options: { headerShown: false } },
  { name: "Help", component: Help, options: chatScreenOptions },
  { name: "About", component: About, options: { headerShown: false } },
  { name: "AboutUs", component: AboutUs, options: { headerShown: false } },
  { name: "Faqs", component: Faqs, options: { headerShown: false } },
  { name: "SystemMessages", component: SystemMessages, options: systemScreenOptions },
  { name: "OrderSuccess", component: OrderSuccess, options: { headerShown: false } },
  { name: "OrderDetails", component: OrderDetails, options: { headerShown: false } },
  { name: "InventoryDashboard", component: InventoryDashboard, options: { headerShown: false } },
  { name: "InventoryMaincenter", component: MainCenter, options: { headerShown: false } },
  { name: "SalesDashboard", component: SalesDashboard, options: { headerShown: false } },
  { name: "OrderSalesDetails", component: OrderSalesDetails, options: { headerShown: false } },
  { name: "EditSalesOrder", component: EditSalesOrder, options: { headerShown: false } },
  { name: "SalesOverview", component: SalesOverview, options: { headerShown: false } },
  { name: "OrdersSales", component: OrdersSales, options: { headerShown: false } },
  { name: "InvoiceScreen", component: InvoiceScreen, options: { headerShown: false } },
  { name: "SalesData", component: SalesData, options: { headerShown: false } },
  { name: "SalesShipments", component: SalesShipments, options: { headerShown: false } },
  { name: "DeliveryDetails", component: DeliveryDetails, options: { headerShown: false } },
  { name: "SalesProfile", component: SalesProfile, options: { headerShown: false } },
  { name: "SalesSettings", component: SalesSettings, options: { headerShown: false } },
  { name: "InventoryProfile", component: InventoryProfile, options: { headerShown: false } },
  { name: "DriverList", component: DriverList, options: { headerShown: false } },
  { name: "DriverDetails", component: DriverDetails, options: { headerShown: false } },
  { name: "DriverSettings", component: DriverSettings, options: { headerShown: false } },
  { name: "DriverProfile", component: DriverProfile, options: { headerShown: false } },
  { name: "ShipmentHistory", component: ShipmentHistory, options: { headerShown: false } },
  { name: "ShipmentSearch", component: ShipmentSearch, options: { headerShown: false } },
  { name: "ShipmentDetails", component: ShipmentDetails, options: { headerShown: false } },
  { name: "EditShipmentDriver", component: EditShipmentDriver, options: { headerShown: false } },
  { name: "ShipmentList", component: ShipmentList, options: { headerShown: false } },
  { name: "FinanceDashboard", component: FinanceDashboard, options: { headerShown: false } },
  { name: "OrderPaymentDetails", component: OrderPaymentDetails, options: { headerShown: false } },
  { name: "EditPaymentDetails", component: EditPaymentDetails, options: { headerShown: false } },
  { name: "PaymentList", component: PaymentList, options: { headerShown: false } },
  { name: "Payments", component: Payments, options: { headerShown: false } },
  { name: "PaymentsHistory", component: PaymentsHistory, options: { headerShown: false } },
  { name: "FinanceProfile", component: FinanceProfile, options: { headerShown: false } },
  { name: "FinanceSettings", component: FinanceSettings, options: { headerShown: false } },
  { name: "ChatListScreen", component: ChatListScreen, options: { headerShown: false } },
  { name: "ChatScreen", component: ChatScreen, options: { headerShown: false } },
  { name: "EditDispatchOrder", component: EditDispatchOrder, options: { headerShown: false } },
  { name: "OrderDispatchDetails", component: OrderDispatchDetails, options: { headerShown: false } },
  { name: "OrderDispatch", component: OrdersDispatch, options: { headerShown: false } },
  { name: "DispatchShipments", component: DispatchShipments, options: { headerShown: false } },
  { name: "DispatchSettings", component: DispatcherSettings, options: { headerShown: false } },
  { name: "DispatcherProfile", component: DispatcherProfile, options: { headerShown: false } },
  { name: "DeliveryDispatchDetails", component: DeliveryDispatchDetails, options: { headerShown: false } },
  { name: "SupplierProfile", component: SupplierProfile, options: { headerShown: false } },
  { name: "SupplierDashboard", component: SupplierDashboard, options: { headerShown: false } },
  { name: "SupplierSettings", component: SupplierSettings, options: { headerShown: false } },
  { name: "InventoryRequests", component: InventoryRequests, options: { headerShown: false } },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    bold: require("./assets/fonts/Outfit/Outfit-Bold.ttf"),
    extrabold: require("./assets/fonts/Outfit/Outfit-ExtraBold.ttf"),
    light: require("./assets/fonts/Outfit/Outfit-Light.ttf"),
    medium: require("./assets/fonts/Outfit/Outfit-Medium.ttf"),
    semibold: require("./assets/fonts/Outfit/Outfit-SemiBold.ttf"),
    regular: require("./assets/fonts/Outfit/Outfit-Regular.ttf"),
    thin: require("./assets/fonts/Outfit/Outfit-Thin.ttf"),
    GtAlpine: require("./assets/fonts/GT-Alpina-Light-Italic.ttf"),
  });

  useEffect(() => {
    const prepare = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary2>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UpdateCheck />

        <BottomSheetModalProvider>
          <AuthProvider>
            {/* <OneSignalId /> */}
            <ProfileCompletionProvider>
              <CartProvider>
                <WishProvider>
                  <NavigationContainer>
                    <PushNotification />
                    <Stack.Navigator initialRouteName="Bottom Navigation">
                      {screens.map((screen, index) => (
                        <Stack.Screen
                          key={index}
                          name={screen.name}
                          component={screen.component}
                          options={screen.options}
                        />
                      ))}
                    </Stack.Navigator>
                    <Toast />
                  </NavigationContainer>
                </WishProvider>
              </CartProvider>
            </ProfileCompletionProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary2>
  );
}
