import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigation from './navigation/BottomTabNavigation';
import { Cart, Home, NewRivals, ProductDetails } from './screens'; // Import the screens properly
import LoginPage from './screens/LoginPage';
import Orders from './screens/Orders';
import Favourties from './screens/Favourties';
import SignUp from './screens/SignUp';
import HomePage from './screens/HomePage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    bold: require('./assets/fonts/Poppins-Bold.ttf'),
    regular: require('./assets/fonts/Poppins-Regular.ttf'),
    semibold: require('./assets/fonts/Poppins-SemiBold.ttf'),
    extrabold: require('./assets/fonts/Poppins-ExtraBold.ttf'),
    medium: require('./assets/fonts/Poppins-Medium.ttf'),
    light: require('./assets/fonts/Poppins-Light.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar />
      <Stack.Navigator>
        <Stack.Screen
          name='Bottom Navigation'
          component={BottomTabNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={Cart}
          name='Cart'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={ProductDetails}
          name='ProductDetails'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={NewRivals}
          name='ProductList'
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          component={LoginPage}
          name='Login'
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          component={Orders}
          name='Orders'
          options={{
            headerShown: false,
          }}
        />


        <Stack.Screen
          component={Favourties}
          name='Favourite'
          options={{
            headerShown: false,
          }}
        />



        <Stack.Screen
          component={SignUp}
          name='Register'
          options={{
            headerShown: false,
          }}
        />

<Stack.Screen
          component={HomePage}
          name='Home'
          options={{
            headerShown: false,
          }}
        />



      </Stack.Navigator>
    </NavigationContainer>
  );
}
