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
import Routes from "./navigation/routes";

enableScreens();

const Stack = createNativeStackNavigator();

// Array of screen definitions
const screens = [
  { name: Routes.FinanceNavigation, component: FinanceTabNavigation, options: { headerShown: false } },
  { name: Routes.SupplierNavigation, component: SupplierTabNavigation, options: { headerShown: false } },
  { name: Routes.BottomNavigation, component: BottomTabNavigation, options: { headerShown: false } },
  { name: Routes.InventoryNavigation, component: InventoryTabNavigation, options: { headerShown: false } },
  { name: Routes.SalesNavigation, component: SalesTabNavigation, options: { headerShown: false } },
  { name: Routes.DriverNavigation, component: DriverTabNavigation, options: { headerShown: false } },
  { name: Routes.DispatchNavigation, component: DispatcherTabNavigation, options: { headerShown: false } },
  { name: Routes.EditCategoriesList, component: EditCategoriesList, options: { headerShown: false } },
  { name: Routes.Home, component: Home, options: { headerShown: false } },
  { name: Routes.EditCategory, component: EditCategory, options: { headerShown: false } },
  { name: Routes.AddCategory, component: AddCategory, options: { headerShown: false } },
  { name: Routes.StaffSettings, component: StaffSettings, options: { headerShown: false } },
  { name: Routes.EditProductsList, component: EditProductList, options: { headerShown: false } },
  { name: Routes.BidList, component: BidList, options: { headerShown: false } },
  { name: Routes.PreviewProduct, component: PreviewProduct, options: { headerShown: false } },
  { name: Routes.EditProduct, component: EditProduct, options: { headerShown: false } },
  { name: Routes.AddProduct, component: AddProduct, options: { headerShown: false } },
  { name: Routes.AddBid, component: AddBid, options: { headerShown: false } },
  { name: Routes.Login, component: LoginPage, options: { headerShown: false } },
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
  { name: Routes.InventoryDashboard, component: InventoryDashboard, options: { headerShown: false } },
  { name: Routes.InventoryMaincenter, component: MainCenter, options: { headerShown: false } },
  { name: Routes.SalesDashboard, component: SalesDashboard, options: { headerShown: false } },
  { name: Routes.OrderSalesDetails, component: OrderSalesDetails, options: { headerShown: false } },
  { name: Routes.EditSalesOrder, component: EditSalesOrder, options: { headerShown: false } },
  { name: Routes.SalesOverview, component: SalesOverview, options: { headerShown: false } },
  { name: Routes.OrdersSales, component: OrdersSales, options: { headerShown: false } },
  { name: Routes.BestProductList, component: BestProductList, options: { headerShown: false } },
  { name: Routes.InvoiceScreen, component: InvoiceScreen, options: { headerShown: false } },
  { name: Routes.SalesData, component: SalesData, options: { headerShown: false } },
  { name: Routes.SalesShipments, component: SalesShipments, options: { headerShown: false } },
  { name: Routes.DeliveryDetails, component: DeliveryDetails, options: { headerShown: false } },
  { name: Routes.SalesProfile, component: SalesProfile, options: { headerShown: false } },
  { name: Routes.SalesSettings, component: SalesSettings, options: { headerShown: false } },
  { name: Routes.InventoryProfile, component: InventoryProfile, options: { headerShown: false } },
  { name: Routes.DriverList, component: DriverList, options: { headerShown: false } },
  { name: Routes.DriverDetails, component: DriverDetails, options: { headerShown: false } },
  { name: Routes.DriverSettings, component: DriverSettings, options: { headerShown: false } },
  { name: Routes.DriverProfile, component: DriverProfile, options: { headerShown: false } },
  { name: Routes.ShipmentHistory, component: ShipmentHistory, options: { headerShown: false } },
  { name: Routes.ShipmentSearch, component: ShipmentSearch, options: { headerShown: false } },
  { name: Routes.ShipmentDetails, component: ShipmentDetails, options: { headerShown: false } },
  { name: Routes.EditShipmentDriver, component: EditShipmentDriver, options: { headerShown: false } },
  { name: Routes.ShipmentList, component: ShipmentList, options: { headerShown: false } },
  { name: Routes.FinanceDashboard, component: FinanceDashboard, options: { headerShown: false } },
  { name: Routes.OrderPaymentDetails, component: OrderPaymentDetails, options: { headerShown: false } },
  { name: Routes.EditPaymentDetails, component: EditPaymentDetails, options: { headerShown: false } },
  { name: Routes.PaymentList, component: PaymentList, options: { headerShown: false } },
  { name: Routes.Payments, component: Payments, options: { headerShown: false } },
  { name: Routes.PaymentsHistory, component: PaymentsHistory, options: { headerShown: false } },
  { name: Routes.FinanceProfile, component: FinanceProfile, options: { headerShown: false } },
  { name: Routes.FinanceSettings, component: FinanceSettings, options: { headerShown: false } },
  { name: Routes.ChatListScreen, component: ChatListScreen, options: { headerShown: false } },
  { name: Routes.ChatScreen, component: ChatScreen, options: { headerShown: false } },
  { name: Routes.EditDispatchOrder, component: EditDispatchOrder, options: { headerShown: false } },
  { name: Routes.OrderDispatchDetails, component: OrderDispatchDetails, options: { headerShown: false } },
  { name: Routes.OrderDispatch, component: OrdersDispatch, options: { headerShown: false } },
  { name: Routes.DispatchShipments, component: DispatchShipments, options: { headerShown: false } },
  { name: Routes.DispatchSettings, component: DispatcherSettings, options: { headerShown: false } },
  { name: Routes.DispatcherProfile, component: DispatcherProfile, options: { headerShown: false } },
  { name: Routes.DeliveryDispatchDetails, component: DeliveryDispatchDetails, options: { headerShown: false } },
  { name: Routes.SupplierProfile, component: SupplierProfile, options: { headerShown: false } },
  { name: Routes.SupplierDashboard, component: SupplierDashboard, options: { headerShown: false } },
  { name: Routes.SupplierSettings, component: SupplierSettings, options: { headerShown: false } },
  { name: Routes.InventoryRequests, component: InventoryRequests, options: { headerShown: false } },
  { name: Routes.FinalBids, component: FinalBids, options: { headerShown: false } },
  { name: Routes.EditBid, component: EditBid, options: { headerShown: false } },
  { name: Routes.MySupply, component: MySupply, options: { headerShown: false } },
  { name: Routes.SupplyPayments, component: SupplyPayments, options: { headerShown: false } },
  { name: Routes.BidDetails, component: BidDetails, options: { headerShown: false } },
  { name: Routes.SupplyDetails, component: SupplyDetails, options: { headerShown: false } },
  { name: Routes.SupplierPayments, component: SupplierPayments, options: { headerShown: false } },
  { name: Routes.SupplierPaymentsDetails, component: SupplierPaymentsDetails, options: { headerShown: false } },
  { name: Routes.EditSupplierPaymentDetails, component: EditSupplierPaymentDetails, options: { headerShown: false } },
  { name: Routes.TransactionReceiptScreen, component: TransactionReceiptScreen, options: { headerShown: false } },
  { name: Routes.SupplyReceiptScreen, component: SupplyReceiptScreen, options: { headerShown: false } },
  { name: Routes.SupplierRegister, component: SupplierRegister, options: { headerShown: false } },
  { name: Routes.SupplierPaymentProfile, component: SupplierPaymentProfile, options: { headerShown: false } },
  { name: Routes.CompanyProfile, component: CompanyProfile, options: { headerShown: false } },
  { name: Routes.HelpListScreen, component: HelpListScreen, options: { headerShown: false } },
  { name: Routes.HelpAgentChatScreen, component: HelpAgentChatScreen, options: { headerShown: false } },
  { name: Routes.SalesReportScreen, component: SalesReportScreen, options: { headerShown: false } },
  { name: Routes.FinanceReportScreen, component: FinanceReportScreen, options: { headerShown: false } },
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
