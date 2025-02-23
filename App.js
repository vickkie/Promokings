import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundary2 from "./screens_options/ErrorBoundary";

import { AuthProvider } from "./components/auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishProvider } from "./contexts/WishContext";
import {
  chatScreenOptions,
  systemScreenOptions,
  successScreenOptions,
  AboutScreenOptions,
} from "./screens_options/AppHeaderOptions";
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
} from "./screens";

import BottomTabNavigation from "./navigation/BottomTabNavigation";
import InventoryTabNavigation from "./navigation/InventoryTabNavigation";

// const InventoryTabNavigation = React.lazy(() => import("./navigation/InventoryTabNavigation"));
// const BottomTabNavigation = React.lazy(() => import("./navigation/BottomTabNavigation"));

import BrokenComponent from "./screens_options/BrokenComponent";
import SalesTabNavigation from "./navigation/SalesTabNavigation";

enableScreens();
const Stack = createNativeStackNavigator();

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
        <BottomSheetModalProvider>
          <AuthProvider>
            <CartProvider>
              <WishProvider>
                <NavigationContainer>
                  <Stack.Navigator>
                    <Stack.Screen
                      name="Bottom Navigation"
                      component={BottomTabNavigation}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="Inventory Navigation"
                      component={InventoryTabNavigation}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="Sales Navigation"
                      component={SalesTabNavigation}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="EditCategoriesList"
                      component={EditCategoriesList}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                    <Stack.Screen name="EditCategory" component={EditCategory} options={{ headerShown: false }} />
                    <Stack.Screen name="AddCategory" component={AddCategory} options={{ headerShown: false }} />
                    <Stack.Screen name="StaffSettings" component={StaffSettings} options={{ headerShown: false }} />
                    <Stack.Screen
                      name="EditProductsList"
                      component={EditProductList}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="PreviewProduct" component={PreviewProduct} options={{ headerShown: false }} />
                    <Stack.Screen name="EditProduct" component={EditProduct} options={{ headerShown: false }} />
                    <Stack.Screen name="Add Product" component={AddProduct} options={{ headerShown: false }} />

                    <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
                    <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
                    <Stack.Screen name="ProductList" component={Products} options={{ headerShown: false }} />
                    <Stack.Screen name="Favourites" component={Favourites} options={{ headerShown: false }} />
                    <Stack.Screen name="Categories" component={Categories} options={{ headerShown: true }} />
                    <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
                    <Stack.Screen name="Checkout" component={Checkout} options={{ headerShown: false }} />
                    <Stack.Screen name="Orders" component={Orders} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                    <Stack.Screen name="UserDetails" component={UserDetails} options={{ headerShown: false }} />
                    <Stack.Screen name="Message" component={MessageCenter} options={{ headerShown: false }} />
                    <Stack.Screen name="Help" component={Help} options={chatScreenOptions} />
                    <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
                    <Stack.Screen name="Faqs" component={Faqs} options={{ headerShown: false }} />
                    <Stack.Screen name="SystemMessages" component={SystemMessages} options={systemScreenOptions} />
                    <Stack.Screen name="OrderSuccess" component={OrderSuccess} options={{ headerShown: false }} />
                    <Stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: false }} />
                    <Stack.Screen
                      name="InventoryDashboard"
                      component={InventoryDashboard}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="SalesDashboard" component={SalesDashboard} options={{ headerShown: false }} />
                    <Stack.Screen
                      name="OrderSalesDetails"
                      component={OrderSalesDetails}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="EditSalesOrder" component={EditSalesOrder} options={{ headerShown: false }} />
                    <Stack.Screen name="SalesOverview" component={SalesOverview} options={{ headerShown: false }} />
                    <Stack.Screen name="OrdersSales" component={OrdersSales} options={{ headerShown: false }} />
                    <Stack.Screen name="SalesData" component={SalesData} options={{ headerShown: false }} />
                    <Stack.Screen name="SalesShipments" component={SalesShipments} options={{ headerShown: false }} />
                    <Stack.Screen name="DeliveryDetails" component={DeliveryDetails} options={{ headerShown: false }} />
                    <Stack.Screen name="SalesProfile" component={SalesProfile} options={{ headerShown: false }} />
                    <Stack.Screen name="SalesSettings" component={SalesSettings} options={{ headerShown: false }} />
                    <Stack.Screen
                      name="InventoryProfile"
                      component={InventoryProfile}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="DriverList" component={DriverList} options={{ headerShown: false }} />
                    <Stack.Screen name="DriverDetails" component={DriverDetails} options={{ headerShown: false }} />
                  </Stack.Navigator>
                  <Toast />
                  {/* <BrokenComponent /> */}
                </NavigationContainer>
              </WishProvider>
            </CartProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary2>
  );
}
