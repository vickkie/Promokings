import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, Linking } from "react-native";
import React, { useRef } from "react";
import Icon from "../constants/icons";
import { COLORS, SIZES, SHADOWS } from "../constants";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import ChangeLogMenu from "../components/bottomsheets/ChangeLog";
import { VERSION_SHORT } from "@env";
// import companyInfo from

import companyInfo from "../assets/data/companyData.json";

const About = () => {
  const navigation = useNavigation();

  const handlePress = (url) => {
    Linking.openURL(url);
  };

  const BottomSheetRef = useRef(null);

  const openMenu = () => {
    if (BottomSheetRef.current) {
      BottomSheetRef.current.present();
    }
  };

  return (
    <SafeAreaView style={styles.containerx}>
      <StatusBar backgroundColor={COLORS.themey} />
      <ChangeLogMenu ref={BottomSheetRef} />

      <View style={{ marginTop: 0 }}>
        <View style={styles.wrapper}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <Text style={styles.heading}>About</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Faqs");
              }}
              style={styles.outWrap}
            >
              <Icon name="question" size={26} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView>
        <View style={styles.lowerContainer}>
          <View style={styles.devBox}>
            <Text style={styles.devHeader}>About</Text>

            <View style={styles.profileContainer}>
              <TouchableOpacity style={styles.buttonWrap2} onPress={() => handlePress("https://promokings.co.ke")}>
                <Image source={require("../assets/promoking-logo.png")} style={styles.profile} />
              </TouchableOpacity>

              <View>
                <Text style={{ fontFamily: "regular", fontSize: SIZES.medium + 2, textAlign: "center", marginTop: 4 }}>
                  {companyInfo?.name}
                </Text>
                {/* <Text>Company</Text> */}
              </View>
            </View>
          </View>
          <View style={[styles.devBox, { marginTop: -5 }]}>
            <Text style={styles.devHeader}>Socials</Text>
            <View style={styles.socialWrapper}>
              <TouchableOpacity style={styles.socialBox} onPress={() => handlePress("https://promokings.co.ke")}>
                <Icon name="web" size={24} />
                <View>
                  <Text style={styles.socialheader}>Website</Text>
                  <Text>Check out our website</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBox} onPress={() => handlePress("https://instagram.com/u.z.i.__")}>
                <Icon name="instagram" size={27} />
                <View>
                  <Text style={styles.socialheader}>Instagram</Text>
                  <Text>See our latest snaps</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBox}
                onPress={() => handlePress("https://twitter.com/Hyperstudioke")}
              >
                <Icon name="twitter" size={23} />
                <View>
                  <Text style={styles.socialheader}>Twitter</Text>
                  <Text>Share your thoughts using on our app</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.devBox, { marginTop: -5 }]}>
            <Text style={styles.devHeader}>Other</Text>

            <View style={styles.socialWrapper}>
              <TouchableOpacity style={styles.socialBox} onPress={openMenu}>
                <Icon name="versionhistory" size={23} />
                <View style={styles.anyTextWrapper}>
                  <Text style={styles.socialheader}>Changelog</Text>
                  <Text>Version changes progress.</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBox}>
                <Icon name="version" size={26} />
                <View>
                  <Text style={styles.socialheader}>Version</Text>
                  <Text>{VERSION_SHORT}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  wrapper: {
    flexDirection: "column",
    position: "absolute",
    top: 2,
  },
  backBtn: {
    left: 10,
  },
  buttonView: {
    backgroundColor: COLORS.themew,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    transform: [{ rotate: "180deg" }],
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 70,
    ...SHADOWS,
    shadowOffset: { height: 1, width: 1 },
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    marginTop: 15,
    paddingTop: SIZES.xSmall,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
    textAlign: "center",
  },
  containerx: {
    flex: 1,
    paddingTop: 26,
  },
  lowerContainer: {
    marginTop: 85,
    minHeight: SIZES.height - 90,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.white,
    width: SIZES.width - 20,
    alignSelf: "center",
  },
  devBox: {
    padding: 15,
    borderRadius: SIZES.medium,
    borderWidth: 1,
    borderBlockColor: COLORS.gray2,
    margin: 10,
    minHeight: 180,
  },
  devHeader: {
    fontFamily: "GtAlpine",
    fontSize: SIZES.medium + 3,
    color: COLORS.gray,
    marginLeft: 0,
  },

  profile: {
    height: 85,
    width: 85,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: COLORS.gray,
    resizeMode: "cover",
  },
  profileContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  socialWrapper: {
    gap: 3,
    flexDirection: "column",
    marginTop: 20,
  },
  socialBox: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 30,
  },
  socialheader: {
    fontSize: SIZES.medium,
    fontWeight: "800",
  },
  anyTextWrapper: {
    gap: 2,
  },
  siteImage: {
    height: "100%",
  },
  Imagecontainer: {
    height: 30,
    width: 30,
  },
});
