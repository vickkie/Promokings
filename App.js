import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import toastConfig from "./utils/toastConfig";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundary2 from "./screens_options/ErrorBoundary";

import { AuthProvider } from "./components/auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProfileCompletionProvider } from "./components/auth/ProfileCompletionContext";
import { WishProvider } from "./contexts/WishContext";
import { chatScreenOptions, systemScreenOptions } from "./screens_options/AppHeaderOptions";

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
  FinalBids,
  EditBid,
  MySupply,
  SupplyPayments,
  BidDetails,
  SupplyDetails,
  SupplierPayments,
  SupplierPaymentsDetails,
  EditSupplierPaymentDetails,
  TransactionReceiptScreen,
  SupplyReceiptScreen,
  SupplierRegister,
  SupplierPaymentProfile,
  CompanyProfile,
  BestProductList,
  HelpListScreen,
  HelpAgentChatScreen,
  SalesReportScreen,
  FinanceReportScreen,
} from "./screens";

import BottomTabNavigation from "./navigation/BottomTabNavigation";
import InventoryTabNavigation from "./navigation/InventoryTabNavigation";
import SalesTabNavigation from "./navigation/SalesTabNavigation";
import UpdateCheck from "./components/UpdateCheck";
import DriverTabNavigation from "./navigation/DriverTabNavigator";
import FinanceTabNavigation from "./navigation/FinanceTabNavigator";
import SupplierTabNavigation from "./navigation/SupplierTabNavigation";
import DispatcherTabNavigation from "./navigation/DispatcherTabNavigation";

import PushNotification from "./components/auth/pushNotification";
import OneSignalId from "./components/auth/OneSignalId";
import NoAccessScreen from "./components/auth/NoAccessScreen";
import { requireRole } from "./components/auth/RoleGuard";
import Routes from "./navigation/routes";
import { ROLES } from "./constants";

enableScreens();

const Stack = createNativeStackNavigator();

// Array of screen definitions
const screens = [
  { name: Routes.FinanceNavigation, component: requireRole(ROLES.FINANCE, FinanceTabNavigation), options: { headerShown: false } },
  { name: Routes.SupplierNavigation, component: requireRole(ROLES.SUPPLIER, SupplierTabNavigation), options: { headerShown: false } },
  { name: Routes.BottomNavigation, component: BottomTabNavigation, options: { headerShown: false } },
  { name: Routes.InventoryNavigation, component: requireRole(ROLES.INVENTORY, InventoryTabNavigation), options: { headerShown: false } },
  { name: Routes.SalesNavigation, component: requireRole(ROLES.SALES, SalesTabNavigation), options: { headerShown: false } },
  { name: Routes.DriverNavigation, component: requireRole(ROLES.DRIVER, DriverTabNavigation), options: { headerShown: false } },
  { name: Routes.DispatchNavigation, component: requireRole(ROLES.DISPATCHER, DispatcherTabNavigation), options: { headerShown: false } },
  { name: Routes.EditCategoriesList, component: requireRole(ROLES.INVENTORY, EditCategoriesList), options: { headerShown: false } },
  { name: Routes.Home, component: Home, options: { headerShown: false } },
  { name: Routes.EditCategory, component: requireRole(ROLES.INVENTORY, EditCategory), options: { headerShown: false } },
  { name: Routes.AddCategory, component: requireRole(ROLES.INVENTORY, AddCategory), options: { headerShown: false } },
  { name: Routes.StaffSettings, component: requireRole(ROLES.INVENTORY, StaffSettings), options: { headerShown: false } },
  { name: Routes.EditProductsList, component: requireRole(ROLES.INVENTORY, EditProductList), options: { headerShown: false } },
  { name: Routes.BidList, component: requireRole(ROLES.INVENTORY, BidList), options: { headerShown: false } },
  { name: Routes.PreviewProduct, component: requireRole([ROLES.INVENTORY, ROLES.DRIVER, ROLES.SALES], PreviewProduct), options: { headerShown: false } },
  { name: Routes.EditProduct, component: requireRole([ROLES.INVENTORY, ROLES.SALES, ROLES.SUPPLIER], EditProduct), options: { headerShown: false } },
  { name: Routes.AddProduct, component: requireRole(ROLES.INVENTORY, AddProduct), options: { headerShown: false } },
  { name: Routes.AddBid, component: requireRole([ROLES.INVENTORY, ROLES.SUPPLIER], AddBid), options: { headerShown: false } },
  { name: Routes.Login, component: LoginPage, options: { headerShown: false } },
  { name: Routes.NoAccess, component: NoAccessScreen, options: { headerShown: false } },
  { name: Routes.ProductDetails, component: ProductDetails, options: { headerShown: false } },
  { name: Routes.ProductList, component: Products, options: { headerShown: false } },
  { name: Routes.Favourites, component: Favourites, options: { headerShown: false } },
  { name: Routes.Categories, component: Categories, options: { headerShown: true } },
  { name: Routes.Cart, component: Cart, options: { headerShown: false } },
  { name: Routes.Checkout, component: Checkout, options: { headerShown: false } },
  { name: Routes.Orders, component: Orders, options: { headerShown: false } },
  { name: Routes.Register, component: Register, options: { headerShown: false } },
  { name: Routes.UserDetails, component: UserDetails, options: { headerShown: false } },
  { name: Routes.Message, component: MessageCenter, options: { headerShown: false } },
  { name: Routes.Help, component: Help, options: chatScreenOptions },
  { name: Routes.About, component: About, options: { headerShown: false } },
  { name: Routes.AboutUs, component: AboutUs, options: { headerShown: false } },
  { name: Routes.Faqs, component: Faqs, options: { headerShown: false } },
  { name: Routes.SystemMessages, component: SystemMessages, options: systemScreenOptions },
  { name: Routes.OrderSuccess, component: OrderSuccess, options: { headerShown: false } },
  { name: Routes.OrderDetails, component: OrderDetails, options: { headerShown: false } },
  { name: Routes.InventoryDashboard, component: requireRole(ROLES.INVENTORY, InventoryDashboard), options: { headerShown: false } },
  { name: Routes.InventoryMaincenter, component: requireRole(ROLES.INVENTORY, MainCenter), options: { headerShown: false } },
  { name: Routes.SalesDashboard, component: requireRole(ROLES.SALES, SalesDashboard), options: { headerShown: false } },
  { name: Routes.OrderSalesDetails, component: requireRole(ROLES.SALES, OrderSalesDetails), options: { headerShown: false } },
  { name: Routes.EditSalesOrder, component: requireRole(ROLES.SALES, EditSalesOrder), options: { headerShown: false } },
  { name: Routes.SalesOverview, component: requireRole(ROLES.SALES, SalesOverview), options: { headerShown: false } },
  { name: Routes.OrdersSales, component: requireRole(ROLES.SALES, OrdersSales), options: { headerShown: false } },
  { name: Routes.BestProductList, component: requireRole(ROLES.SALES, BestProductList), options: { headerShown: false } },
  { name: Routes.InvoiceScreen, component: InvoiceScreen, options: { headerShown: false } },
  { name: Routes.SalesData, component: requireRole(ROLES.SALES, SalesData), options: { headerShown: false } },
  { name: Routes.SalesShipments, component: requireRole(ROLES.SALES, SalesShipments), options: { headerShown: false } },
  { name: Routes.DeliveryDetails, component: requireRole(ROLES.SALES, DeliveryDetails), options: { headerShown: false } },
  { name: Routes.SalesProfile, component: requireRole(ROLES.SALES, SalesProfile), options: { headerShown: false } },
  { name: Routes.SalesSettings, component: requireRole(ROLES.SALES, SalesSettings), options: { headerShown: false } },
  { name: Routes.InventoryProfile, component: requireRole(ROLES.INVENTORY, InventoryProfile), options: { headerShown: false } },
  { name: Routes.DriverList, component: requireRole(ROLES.DISPATCHER, DriverList), options: { headerShown: false } },
  { name: Routes.DriverDetails, component: requireRole(ROLES.DISPATCHER, DriverDetails), options: { headerShown: false } },
  { name: Routes.DriverSettings, component: requireRole(ROLES.DRIVER, DriverSettings), options: { headerShown: false } },
  { name: Routes.DriverProfile, component: requireRole(ROLES.DRIVER, DriverProfile), options: { headerShown: false } },
  { name: Routes.ShipmentHistory, component: requireRole(ROLES.DRIVER, ShipmentHistory), options: { headerShown: false } },
  { name: Routes.ShipmentSearch, component: requireRole(ROLES.DRIVER, ShipmentSearch), options: { headerShown: false } },
  { name: Routes.ShipmentDetails, component: requireRole(ROLES.DRIVER, ShipmentDetails), options: { headerShown: false } },
  { name: Routes.EditShipmentDriver, component: requireRole(ROLES.DRIVER, EditShipmentDriver), options: { headerShown: false } },
  { name: Routes.ShipmentList, component: requireRole(ROLES.DRIVER, ShipmentList), options: { headerShown: false } },
  { name: Routes.FinanceDashboard, component: requireRole(ROLES.FINANCE, FinanceDashboard), options: { headerShown: false } },
  { name: Routes.OrderPaymentDetails, component: requireRole([ROLES.FINANCE, ROLES.SUPPLIER], OrderPaymentDetails), options: { headerShown: false } },
  { name: Routes.EditPaymentDetails, component: requireRole(ROLES.FINANCE, EditPaymentDetails), options: { headerShown: false } },
  { name: Routes.PaymentList, component: requireRole(ROLES.FINANCE, PaymentList), options: { headerShown: false } },
  { name: Routes.Payments, component: requireRole([ROLES.FINANCE, ROLES.SUPPLIER], Payments), options: { headerShown: false } },
  { name: Routes.PaymentsHistory, component: requireRole(ROLES.FINANCE, PaymentsHistory), options: { headerShown: false } },
  { name: Routes.FinanceProfile, component: requireRole(ROLES.FINANCE, FinanceProfile), options: { headerShown: false } },
  { name: Routes.FinanceSettings, component: requireRole(ROLES.FINANCE, FinanceSettings), options: { headerShown: false } },
  { name: Routes.ChatListScreen, component: ChatListScreen, options: { headerShown: false } },
  { name: Routes.ChatScreen, component: ChatScreen, options: { headerShown: false } },
  { name: Routes.EditDispatchOrder, component: requireRole(ROLES.DISPATCHER, EditDispatchOrder), options: { headerShown: false } },
  { name: Routes.OrderDispatchDetails, component: requireRole(ROLES.DISPATCHER, OrderDispatchDetails), options: { headerShown: false } },
  { name: Routes.OrderDispatch, component: requireRole(ROLES.DISPATCHER, OrdersDispatch), options: { headerShown: false } },
  { name: Routes.DispatchShipments, component: requireRole(ROLES.DISPATCHER, DispatchShipments), options: { headerShown: false } },
  { name: Routes.DispatchSettings, component: requireRole(ROLES.DISPATCHER, DispatcherSettings), options: { headerShown: false } },
  { name: Routes.DispatcherProfile, component: requireRole(ROLES.DISPATCHER, DispatcherProfile), options: { headerShown: false } },
  { name: Routes.DeliveryDispatchDetails, component: requireRole(ROLES.DISPATCHER, DeliveryDispatchDetails), options: { headerShown: false } },
  { name: Routes.SupplierProfile, component: requireRole(ROLES.SUPPLIER, SupplierProfile), options: { headerShown: false } },
  { name: Routes.SupplierDashboard, component: requireRole(ROLES.SUPPLIER, SupplierDashboard), options: { headerShown: false } },
  { name: Routes.SupplierSettings, component: requireRole(ROLES.SUPPLIER, SupplierSettings), options: { headerShown: false } },
  { name: Routes.InventoryRequests, component: requireRole(ROLES.SUPPLIER, InventoryRequests), options: { headerShown: false } },
  { name: Routes.FinalBids, component: requireRole(ROLES.INVENTORY, FinalBids), options: { headerShown: false } },
  { name: Routes.EditBid, component: requireRole(ROLES.INVENTORY, EditBid), options: { headerShown: false } },
  { name: Routes.MySupply, component: requireRole(ROLES.SUPPLIER, MySupply), options: { headerShown: false } },
  { name: Routes.SupplyPayments, component: requireRole(ROLES.SUPPLIER, SupplyPayments), options: { headerShown: false } },
  { name: Routes.BidDetails, component: requireRole(ROLES.INVENTORY, BidDetails), options: { headerShown: false } },
  { name: Routes.SupplyDetails, component: requireRole(ROLES.SUPPLIER, SupplyDetails), options: { headerShown: false } },
  { name: Routes.SupplierPayments, component: requireRole(ROLES.FINANCE, SupplierPayments), options: { headerShown: false } },
  { name: Routes.SupplierPaymentsDetails, component: requireRole(ROLES.FINANCE, SupplierPaymentsDetails), options: { headerShown: false } },
  { name: Routes.EditSupplierPaymentDetails, component: requireRole(ROLES.FINANCE, EditSupplierPaymentDetails), options: { headerShown: false } },
  { name: Routes.TransactionReceiptScreen, component: requireRole(ROLES.FINANCE, TransactionReceiptScreen), options: { headerShown: false } },
  { name: Routes.SupplyReceiptScreen, component: requireRole(ROLES.SUPPLIER, SupplyReceiptScreen), options: { headerShown: false } },
  { name: Routes.SupplierRegister, component: SupplierRegister, options: { headerShown: false } },
  { name: Routes.SupplierPaymentProfile, component: requireRole(ROLES.SUPPLIER, SupplierPaymentProfile), options: { headerShown: false } },
  { name: Routes.CompanyProfile, component: requireRole(ROLES.SUPPLIER, CompanyProfile), options: { headerShown: false } },
  { name: Routes.HelpListScreen, component: HelpListScreen, options: { headerShown: false } },
  { name: Routes.HelpAgentChatScreen, component: HelpAgentChatScreen, options: { headerShown: false } },
  { name: Routes.SalesReportScreen, component: requireRole(ROLES.SALES, SalesReportScreen), options: { headerShown: false } },
  { name: Routes.FinanceReportScreen, component: requireRole(ROLES.FINANCE, FinanceReportScreen), options: { headerShown: false } },
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
            <ProfileCompletionProvider>
              <CartProvider>
                <WishProvider>
                  <NavigationContainer>
                    <PushNotification />
                    <OneSignalId />
                    <Stack.Navigator initialRouteName={Routes.BottomNavigation}>
                      {screens.map((screen, index) => (
                        <Stack.Screen
                          key={index}
                          name={screen.name}
                          component={screen.component}
                          options={screen.options}
                        />
                      ))}
                    </Stack.Navigator>
                    <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
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
