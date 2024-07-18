import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { enableLayoutAnimations } from "react-native-reanimated";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import BottomTabNavigation from "./navigation/BottomTabNavigation";
import Toast from "react-native-toast-message";
import {
  Cart,
  ProductDetails,
  Products,
  LoginPage,
  Favourites,
  Orders,
  Register,
  Categories,
  Checkout,
  UserDetails,
} from "./screens";
import { AuthProvider } from "./components/auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishProvider } from "./contexts/WishContext";

enableScreens();
enableLayoutAnimations(true);

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
    <AuthProvider>
      <CartProvider>
        <WishProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Bottom Navigation" component={BottomTabNavigation} options={{ headerShown: false }} />
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
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </WishProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
