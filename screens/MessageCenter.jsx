import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { AuthContext } from "../components/auth/AuthContext";

const MessageCenter = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    if (userData && userData._id && userData.TOKEN) {
      setUserId(userData._id);
    } else {
      navigation.navigate("Login");
    }
  }, [userData]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
              <Icon size={30} name="backbutton" />
            </TouchableOpacity>
            <Text style={styles.heading}>Message Center</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ChatListScreen")} style={styles.buttonWrap}>
              <Icon size={30} name="messagefilled" />
            </TouchableOpacity>
          </View>

          <View style={styles.lowerRow}>
            <TouchableOpacity
              onPress={() => {
                if (userId) {
                  navigation.navigate("ChatListScreen");
                }
              }}
            >
              <View style={[styles.menuItem(0.5)]}>
                <View style={styles.itswrap}>
                  <Icon name="message" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Messaging</Text>
                </View>
                <Icon name="forward" size={24} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            {!userData?.position && (
              <TouchableOpacity
                onPress={() => {
                  if (userId) {
                    navigation.navigate("Help");
                  }
                }}
              >
                <View style={[styles.menuItem(0.5)]}>
                  <View style={styles.itswrap}>
                    <Icon name="customerservice" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Customer support</Text>
                  </View>
                  <Icon name="forward" size={24} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate("SystemMessages")}>
              <View style={styles.menuItem(0.5)}>
                <View style={styles.itswrap}>
                  <Icon name="bellfilled" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>My Notifications</Text>
                </View>
                <Icon name="forward" size={24} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
            {!userData?.position && (
              <>
                <TouchableOpacity onPress={() => navigation.navigate("Faqs")}>
                  <View style={styles.menuItem(0.5)}>
                    <View style={styles.itswrap}>
                      <Icon name="faqs" size={26} color={COLORS.primary} />
                      <Text style={styles.menuText}>Frequently asked Questions</Text>
                    </View>
                    <Icon name="forward" size={24} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                  <View style={styles.menuItem(0.5)}>
                    <View style={styles.itswrap}>
                      <Icon name="cartcheck" size={26} color={COLORS.primary} />
                      <Text style={styles.menuText}>Order Tracking</Text>
                    </View>
                    <Icon name="forward" size={24} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {["sales", "customer support"].includes(userData?.position) && (
              <TouchableOpacity onPress={() => navigation.navigate("HelpListScreen")}>
                <View style={styles.menuItem(0.5)}>
                  <View style={styles.itswrap}>
                    <Icon name="customerservice" size={26} color={COLORS.primary} />
                    <Text style={styles.menuText}>Customer support management</Text>
                  </View>
                  <Icon name="forward" size={24} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MessageCenter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  wrapper: {
    flex: 1,
    position: "absolute",
    backgroundColor: COLORS.themew,
  },

  upperRow: {
    width: SIZES.width - 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.small,
    minHeight: 110,
    marginStart: SIZES.small / 2,
  },

  heading: {
    color: COLORS.themeb,
    marginLeft: 5,
    fontFamily: "semibold",
    fontSize: SIZES.large,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    marginStart: 10,
  },

  lowerRow: {
    height: SIZES.height - 120,
    width: SIZES.width - 10,
    backgroundColor: COLORS.themeg,
    marginTop: SIZES.medium,
    marginHorizontal: 5,
    borderRadius: SIZES.medium,
  },
  menuItem: (borderBottomWidth) => ({
    borderBottomWidth: borderBottomWidth,
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
  }),
  itswrap: {
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
  },
});
