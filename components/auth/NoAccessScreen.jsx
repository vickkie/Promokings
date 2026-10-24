import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { AuthContext } from "./AuthContext";
import Icon from "../../constants/icons";
import CustomButton from "../Button";
import Routes from "../../navigation/routes";
import { COLORS, SIZES } from "../../constants";

// Fallback shown by RoleGuard when the session role claim does not match a
// staff-only screen (MB-UI-003). Also registered as a root screen so it can
// be navigated to directly.
const NoAccessScreen = () => {
  const navigation = useNavigation();
  const { userLogin, userLogout } = useContext(AuthContext);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: Routes.BottomNavigation }],
    });
  };

  const signOut = () => {
    userLogout();
    navigation.reset({
      index: 0,
      routes: [{ name: Routes.Login }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name="close" size={44} color={COLORS.red} />
        </View>
        <Text style={styles.title}>No Access</Text>
        <Text style={styles.message}>
          You do not have access to this section. Head back, or sign in with an authorized account.
        </Text>
        <CustomButton title="G O  B A C K" onPress={goBack} isValid={true} loader={false} />
        {userLogin && (
          <TouchableOpacity onPress={signOut} style={styles.signOut}>
            <Icon name="logout" size={18} color={COLORS.themeb} />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default NoAccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    justifyContent: "center",
    padding: SIZES.medium,
  },
  card: {
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    padding: SIZES.large,
    alignItems: "center",
  },
  iconWrap: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    padding: 18,
    marginBottom: SIZES.medium,
  },
  title: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
    color: COLORS.themeb,
    marginBottom: SIZES.small,
  },
  message: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SIZES.small,
  },
  signOutText: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.themeb,
  },
});
