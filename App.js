import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useContext } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import toastConfig from "./utils/toastConfig";

import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import DispatcherTabNavigation from "./navigation/DispatcherTabNavigation ";

import PushNotification from "./components/auth/pushNotification";
import NoAccessScreen from "./components/auth/NoAccessScreen";
import { requireRole } from "./components/auth/RoleGuard";
import Routes from "./navigation/routes";

enableScreens();

const Stack = createNativeStackNavigator();

// Array of screen definitions
const screens = [
  { name: Routes.FinanceNavigation, component: requireRole("finance", FinanceTabNavigation), options: { headerShown: false } },
  { name: Routes.SupplierNavigation, component: requireRole("supplier", SupplierTabNavigation), options: { headerShown: false } },
  { name: Routes.BottomNavigation, component: BottomTabNavigation, options: { headerShown: false } },
  { name: Routes.InventoryNavigation, component: requireRole("inventory", InventoryTabNavigation), options: { headerShown: false } },
  { name: Routes.SalesNavigation, component: requireRole("sales", SalesTabNavigation), options: { headerShown: false } },
  { name: Routes.DriverNavigation, component: requireRole("driver", DriverTabNavigation), options: { headerShown: false } },
  { name: Routes.DispatchNavigation, component: requireRole("dispatcher", DispatcherTabNavigation), options: { headerShown: false } },
  { name: Routes.EditCategoriesList, component: requireRole("inventory", EditCategoriesList), options: { headerShown: false } },
  { name: Routes.Home, component: Home, options: { headerShown: false } },
  { name: Routes.EditCategory, component: requireRole("inventory", EditCategory), options: { headerShown: false } },
  { name: Routes.AddCategory, component: requireRole("inventory", AddCategory), options: { headerShown: false } },
  { name: Routes.StaffSettings, component: requireRole("inventory", StaffSettings), options: { headerShown: false } },
  { name: Routes.EditProductsList, component: requireRole("inventory", EditProductList), options: { headerShown: false } },
  { name: Routes.BidList, component: requireRole("inventory", BidList), options: { headerShown: false } },
  { name: Routes.PreviewProduct, component: requireRole(["inventory", "driver", "sales"], PreviewProduct), options: { headerShown: false } },
  { name: Routes.EditProduct, component: requireRole(["inventory", "sales", "supplier"], EditProduct), options: { headerShown: false } },
  { name: Routes.AddProduct, component: requireRole("inventory", AddProduct), options: { headerShown: false } },
  { name: Routes.AddBid, component: requireRole(["inventory", "supplier"], AddBid), options: { headerShown: false } },
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
  { name: Routes.InventoryDashboard, component: requireRole("inventory", InventoryDashboard), options: { headerShown: false } },
  { name: Routes.InventoryMaincenter, component: requireRole("inventory", MainCenter), options: { headerShown: false } },
  { name: Routes.SalesDashboard, component: requireRole("sales", SalesDashboard), options: { headerShown: false } },
  { name: Routes.OrderSalesDetails, component: requireRole("sales", OrderSalesDetails), options: { headerShown: false } },
  { name: Routes.EditSalesOrder, component: requireRole("sales", EditSalesOrder), options: { headerShown: false } },
  { name: Routes.SalesOverview, component: requireRole("sales", SalesOverview), options: { headerShown: false } },
  { name: Routes.OrdersSales, component: requireRole("sales", OrdersSales), options: { headerShown: false } },
  { name: Routes.BestProductList, component: requireRole("sales", BestProductList), options: { headerShown: false } },
  { name: Routes.InvoiceScreen, component: InvoiceScreen, options: { headerShown: false } },
  { name: Routes.SalesData, component: requireRole("sales", SalesData), options: { headerShown: false } },
  { name: Routes.SalesShipments, component: requireRole("sales", SalesShipments), options: { headerShown: false } },
  { name: Routes.DeliveryDetails, component: requireRole("sales", DeliveryDetails), options: { headerShown: false } },
  { name: Routes.SalesProfile, component: requireRole("sales", SalesProfile), options: { headerShown: false } },
  { name: Routes.SalesSettings, component: requireRole("sales", SalesSettings), options: { headerShown: false } },
  { name: Routes.InventoryProfile, component: requireRole("inventory", InventoryProfile), options: { headerShown: false } },
  { name: Routes.DriverList, component: requireRole("dispatcher", DriverList), options: { headerShown: false } },
  { name: Routes.DriverDetails, component: requireRole("dispatcher", DriverDetails), options: { headerShown: false } },
  { name: Routes.DriverSettings, component: requireRole("driver", DriverSettings), options: { headerShown: false } },
  { name: Routes.DriverProfile, component: requireRole("driver", DriverProfile), options: { headerShown: false } },
  { name: Routes.ShipmentHistory, component: requireRole("driver", ShipmentHistory), options: { headerShown: false } },
  { name: Routes.ShipmentSearch, component: requireRole("driver", ShipmentSearch), options: { headerShown: false } },
  { name: Routes.ShipmentDetails, component: requireRole("driver", ShipmentDetails), options: { headerShown: false } },
  { name: Routes.EditShipmentDriver, component: requireRole("driver", EditShipmentDriver), options: { headerShown: false } },
  { name: Routes.ShipmentList, component: requireRole("driver", ShipmentList), options: { headerShown: false } },
  { name: Routes.FinanceDashboard, component: requireRole("finance", FinanceDashboard), options: { headerShown: false } },
  { name: Routes.OrderPaymentDetails, component: requireRole(["finance", "supplier"], OrderPaymentDetails), options: { headerShown: false } },
  { name: Routes.EditPaymentDetails, component: requireRole("finance", EditPaymentDetails), options: { headerShown: false } },
  { name: Routes.PaymentList, component: requireRole("finance", PaymentList), options: { headerShown: false } },
  { name: Routes.Payments, component: requireRole(["finance", "supplier"], Payments), options: { headerShown: false } },
  { name: Routes.PaymentsHistory, component: requireRole("finance", PaymentsHistory), options: { headerShown: false } },
  { name: Routes.FinanceProfile, component: requireRole("finance", FinanceProfile), options: { headerShown: false } },
  { name: Routes.FinanceSettings, component: requireRole("finance", FinanceSettings), options: { headerShown: false } },
  { name: Routes.ChatListScreen, component: ChatListScreen, options: { headerShown: false } },
  { name: Routes.ChatScreen, component: ChatScreen, options: { headerShown: false } },
  { name: Routes.EditDispatchOrder, component: requireRole("dispatcher", EditDispatchOrder), options: { headerShown: false } },
  { name: Routes.OrderDispatchDetails, component: requireRole("dispatcher", OrderDispatchDetails), options: { headerShown: false } },
  { name: Routes.OrderDispatch, component: requireRole("dispatcher", OrdersDispatch), options: { headerShown: false } },
  { name: Routes.DispatchShipments, component: requireRole("dispatcher", DispatchShipments), options: { headerShown: false } },
  { name: Routes.DispatchSettings, component: requireRole("dispatcher", DispatcherSettings), options: { headerShown: false } },
  { name: Routes.DispatcherProfile, component: requireRole("dispatcher", DispatcherProfile), options: { headerShown: false } },
  { name: Routes.DeliveryDispatchDetails, component: requireRole("dispatcher", DeliveryDispatchDetails), options: { headerShown: false } },
  { name: Routes.SupplierProfile, component: requireRole("supplier", SupplierProfile), options: { headerShown: false } },
  { name: Routes.SupplierDashboard, component: requireRole("supplier", SupplierDashboard), options: { headerShown: false } },
  { name: Routes.SupplierSettings, component: requireRole("supplier", SupplierSettings), options: { headerShown: false } },
  { name: Routes.InventoryRequests, component: requireRole("supplier", InventoryRequests), options: { headerShown: false } },
  { name: Routes.FinalBids, component: requireRole("inventory", FinalBids), options: { headerShown: false } },
  { name: Routes.EditBid, component: requireRole("inventory", EditBid), options: { headerShown: false } },
  { name: Routes.MySupply, component: requireRole("supplier", MySupply), options: { headerShown: false } },
  { name: Routes.SupplyPayments, component: requireRole("supplier", SupplyPayments), options: { headerShown: false } },
  { name: Routes.BidDetails, component: requireRole("inventory", BidDetails), options: { headerShown: false } },
  { name: Routes.SupplyDetails, component: requireRole("supplier", SupplyDetails), options: { headerShown: false } },
  { name: Routes.SupplierPayments, component: requireRole("finance", SupplierPayments), options: { headerShown: false } },
  { name: Routes.SupplierPaymentsDetails, component: requireRole("finance", SupplierPaymentsDetails), options: { headerShown: false } },
  { name: Routes.EditSupplierPaymentDetails, component: requireRole("finance", EditSupplierPaymentDetails), options: { headerShown: false } },
  { name: Routes.TransactionReceiptScreen, component: requireRole("finance", TransactionReceiptScreen), options: { headerShown: false } },
  { name: Routes.SupplyReceiptScreen, component: requireRole("supplier", SupplyReceiptScreen), options: { headerShown: false } },
  { name: Routes.SupplierRegister, component: SupplierRegister, options: { headerShown: false } },
  { name: Routes.SupplierPaymentProfile, component: requireRole("supplier", SupplierPaymentProfile), options: { headerShown: false } },
  { name: Routes.CompanyProfile, component: requireRole("supplier", CompanyProfile), options: { headerShown: false } },
  { name: Routes.HelpListScreen, component: HelpListScreen, options: { headerShown: false } },
  { name: Routes.HelpAgentChatScreen, component: HelpAgentChatScreen, options: { headerShown: false } },
  { name: Routes.SalesReportScreen, component: requireRole("sales", SalesReportScreen), options: { headerShown: false } },
  { name: Routes.FinanceReportScreen, component: requireRole("finance", FinanceReportScreen), options: { headerShown: false } },
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
