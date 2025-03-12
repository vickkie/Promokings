import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { ProfileCompletionContext } from "../components/auth/ProfileCompletionContext";
import axios from "axios";
import axiosRetry from "axios-retry";

import CustomerCompleteProfile from "../components/bottomsheets/CustomerCompleteProfile";

// Global axios-retry
axiosRetry(axios, { retries: 3 });

const UserProfileCompletion = () => {
  const { userData, userLogin, updateUserData, userLogout, hasRole } = useContext(AuthContext);
  const {
    completionPercentage,
    missingFields,
    refreshProfileCompletion,
    syncProfileCompletionFromServer,
    message,
    isComplete,
  } = useContext(ProfileCompletionContext);

  const [showBanner, setShowBanner] = useState(true);

  const BottomSheetRef = useRef(null);

  const openMenu = () => {
    if (BottomSheetRef.current) {
      BottomSheetRef.current.present();
    }
  };

  return (
    <>
      <CustomerCompleteProfile ref={BottomSheetRef} />

      {userLogin && !isComplete && showBanner && (
        <>
          <View style={styles.incomplateBox}>
            <View style={styles.upperButtons}>
              <Text style={styles.topprofileheading2}>Your profile is {completionPercentage}% complete</Text>
            </View>

            <TouchableOpacity onPress={""} style={styles.outWrap3}>
              <Icon name="close" size={14} />
            </TouchableOpacity>
            <View style={styles.lowerheader}>
              <Text style={styles.statement2}>{message}</Text>

              <TouchableOpacity onPress={openMenu} style={styles.outWrap2}>
                <Text style={styles.topprofileheading}> Complete Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default UserProfileCompletion;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  topheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.themeg,
  },
  wrapper: {
    flexDirection: "column",
  },

  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    // position: "absolute",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 140,
  },
  incomplateBox: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    // position: "absolute",
    backgroundColor: COLORS.red,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    marginTop: SIZES.xxSmall,
    zIndex: 2,
    color: "#fff",
  },
  upperButtons: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.medium,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
    // paddingTop: 20,
  },
  topprofileheading2: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themew,
    fontFamily: "semibold",
    paddingTop: 10,
  },

  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
  },
  statement2: {
    fontFamily: "regular",
    textAlign: "center",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.themew,
  },
  location: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 40,
  },
  toggleLocation: {
    right: 10,
    padding: 7,
    backgroundColor: COLORS.white,
    borderRadius: 100,
  },
  homeheading: {
    fontFamily: "regular",
    textTransform: "capitalize",
    fontSize: SIZES.medium,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 10,
  },
  rightLocation: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  rotateMe: {
    transform: [{ rotate: "180deg" }],
  },

  numbers: {
    padding: 3,
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-10%",
    left: "-10%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height - 200,
  },
  profileImage: {
    position: "relative",
    height: 180,
    width: 180,
    borderRadius: 200,
  },
  imageWrapper: {
    width: SIZES.width - 20,
    justifyContent: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.medium,
  },
  editpencil: {
    position: "absolute",
    height: 50,
    width: 50,
    bottom: "10%",
    right: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
    borderRadius: 100,
    backgroundColor: COLORS.themey,
  },
  pencilWrapper: {
    borderWidth: 4,
    borderColor: COLORS.black,
  },

  label: {
    fontSize: SIZES.xSmall,
    marginBottom: SIZES.xSmall,
    color: COLORS.gray,
    marginStart: SIZES.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 30,
    marginStart: 10,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },
  loginBtn: {
    backgroundColor: COLORS.secondary,
    padding: 4,
    borderWidth: 0.4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
    margin: 30,
    width: SIZES.large * 3,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  changePasswordButton: {
    alignSelf: "center",
    paddingVertical: SIZES.xxSmall,
  },
  submitBtn: {
    backgroundColor: COLORS.themey,
  },
  changePasswordButtonText: {
    fontFamily: "medium",
  },
  pleaseLogin: {
    fontFamily: "regular",
    textAlign: "center",
    marginVertical: SIZES.xxLarge,
    fontSize: SIZES.medium,
  },
  outWrap: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 10,
    right: 10,
  },
  outWrap3: {
    backgroundColor: COLORS.themew,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 10,
    right: 10,
  },
  outWrap2: {
    backgroundColor: COLORS.themew,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
});
