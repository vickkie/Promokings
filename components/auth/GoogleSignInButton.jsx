import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { AuthContext } from "./AuthContext";
import { COLORS, SIZES } from "../../constants";
import { BACKEND_PORT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID_ANDROID, GOOGLE_CLIENT_ID_IOS } from "@env";
import Routes from "../../navigation/routes";

// Required so the system browser auth session can deliver the OAuth redirect
// back into the app on Android (also closes the popup on web).
WebBrowser.maybeCompleteAuthSession();

// Platform-specific Google OAuth client id. GOOGLE_CLIENT_ID is the shared
// fallback; GOOGLE_CLIENT_ID_ANDROID / GOOGLE_CLIENT_ID_IOS override it per
// platform when set. For dev-client/production builds these must be
// native-type OAuth clients (Android client needs package name and SHA-1).
const GOOGLE_PLATFORM_CLIENT_ID = Platform.select({
  android: GOOGLE_CLIENT_ID_ANDROID || GOOGLE_CLIENT_ID,
  ios: GOOGLE_CLIENT_ID_IOS || GOOGLE_CLIENT_ID,
  default: GOOGLE_CLIENT_ID,
});

// Callers should render <GoogleSignInButton /> only when this returns true -
// the hook below requires a truthy client id.
export const isGoogleSignInConfigured = () => Boolean(GOOGLE_PLATFORM_CLIENT_ID);

// Customer-only Google sign-in. Staff/supplier accounts must use the password
// form - the backend rejects Google tokens for those audiences anyway.
const GoogleSignInButton = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_PLATFORM_CLIENT_ID,
    selectAccount: true,
  });

  const exchangeIdToken = async (idToken) => {
    setBusy(true);
    try {
      const endpoint = `${BACKEND_PORT}/api/auth/google`;
      const res = await axios.post(endpoint, { idToken, audience: "customer" });

      if (res.status !== 200 || !res.data || !res.data.TOKEN) {
        Alert.alert("Login Failure", "Unexpected response. Please try again.");
        return;
      }

      // Same {...userData, TOKEN} shape as password login - the shared login
      // path persists SecureStore and AsyncStorage and sets axios defaults.
      await login(res.data);

      navigation.reset({
        index: 0,
        routes: [{ name: Routes.BottomNavigation, params: { screen: Routes.Home } }],
      });
    } catch (error) {
      const status = error.response?.status;
      let errorMsg = error.response?.data?.message;
      if (!errorMsg) {
        if (status === 429) {
          errorMsg = "Too many attempts. Please try again later.";
        } else if (status === 503) {
          errorMsg = "Google sign-in is not available right now.";
        } else if (!error.response) {
          errorMsg = "Network error. Please check your connection and try again.";
        } else {
          errorMsg = "Oops! Error logging in. Please try again.";
        }
      }
      Alert.alert("Login Failure", errorMsg);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === "success") {
      // On native the code flow auto-exchanges via PKCE and exposes
      // authentication.idToken (params.id_token is also populated).
      const idToken = response.authentication?.idToken || response.params?.id_token;
      if (idToken) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy sync-state pattern kept to preserve behavior
        exchangeIdToken(idToken);
      } else {
        setBusy(false);
        Alert.alert("Login Failure", "Google sign-in did not return a credential. Please try again.");
      }
    } else if (response.type === "error") {
      setBusy(false);
      Alert.alert("Login Failure", response.error?.message || "Google sign-in failed. Please try again.");
    } else {
      // 'cancel' / 'dismiss' / 'locked' - user backed out of the browser.
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);


  const handlePress = () => {
    if (!request || busy) {
      return;
    }
    setBusy(true);
    promptAsync().catch(() => {
      setBusy(false);
      Alert.alert("Login Failure", "Could not open Google sign-in. Please try again.");
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity
        style={[styles.googleBtn, (busy || !request) && styles.googleBtnDisabled]}
        onPress={handlePress}
        disabled={busy || !request}
      >
        {busy ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <View style={styles.googleBtnContent}>
            <MaterialCommunityIcons name="google" size={20} color={COLORS.primary} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray2,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.gray,
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
  },
  googleBtn: {
    backgroundColor: COLORS.lightWhite,
    borderColor: COLORS.primary,
    borderWidth: 1,
    height: 50,
    width: "100%",
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.large,
  },
  googleBtnDisabled: {
    opacity: 0.6,
  },
  googleBtnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "medium",
    marginLeft: 8,
  },
});

export default GoogleSignInButton;
