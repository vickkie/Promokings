// HomeMenu.js
import React, { useMemo, useCallback, useRef, forwardRef, useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import Icon from "../../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";

const EditSupply = forwardRef((props, ref) => {
  const snapPoints = useMemo(() => [190, 245], []);
  const { item } = props;
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  // Create a ref for the BottomSheetModal if not provided
  const bottomSheetRef = ref || useRef(null);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} opacity={0.3} />,
    []
  );

  const handleNavigation = (screen, params = {}) => {
    navigation.navigate(screen, params);
    bottomSheetRef.current?.dismiss();
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            userLogout();
            showToast("success", "You have been logged out", "Thank you for being with us");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={(index) => {}}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: COLORS.themeg, borderRadius: SIZES.medium }}
      backdropComponent={renderBackdrop}
      bottomInset={20}
      containerStyle={{ borderRadius: SIZES.large, marginHorizontal: 10 }}
      handleIndicatorStyle={styles.handlebar}
      handleHeight={10}
      // enableDynamicSizing={true}
    >
      <View style={styles.container}>
        <View style={styles.menuHeader}>
          <Text style={styles.heading}>Bid Options</Text>
        </View>

        <View style={styles.listContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log(item);
              handleNavigation("BidDetails", {
                bidId: item?._id,
                bid: item,
              });
            }}
          >
            <View style={styles.menuItem(0.5)}>
              <Icon name="list" size={24} color={COLORS.primary} />
              <Text style={styles.menuText}>View Bid</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.menuCombineContainer}>
            <TouchableOpacity
              onPress={() =>
                handleNavigation("EditBid", {
                  product: item,
                })
              }
            >
              <View style={styles.menuCombinelist}>
                <Icon name="pencil" size={26} color={COLORS.primary} />
                <Text style={styles.menuText}>Edit Bid</Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => handleNavigation("Favourites")}>
              <View style={styles.menuItem(0.5)}>
                <Icon name="favouritebag" size={24} color={COLORS.primary} />
                <Text style={styles.menuText}></Text>
              </View>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
});

export default EditSupply;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SIZES.medium,
  },
  menuText: {
    fontFamily: "bold",
    fontSize: SIZES.medium - 3,
  },
  menuItem: (borderBottomWidth) => ({
    borderBottomWidth: borderBottomWidth,
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    opacity: 0.5,
    alignItems: "center",
    gap: 10,
  }),
  menuCombinelist: {
    opacity: 0.5,
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 10,
  },
  menuCombineContainer: {
    columnGap: 10,
    flexDirection: "column",
    paddingVertical: 15,
  },
  menuHeader: {
    alignItems: "center",
    opacity: 0.5,
    width: SIZES.width - 35,
    paddingHorizontal: 30,
    justifyContent: "center",
    borderBottomColor: "#ccc",
    borderStyle: "solid",
    borderBottomWidth: SIZES.width * 0.00058,
    paddingVertical: SIZES.small / 2,
    marginTop: -10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SIZES.medium,
    color: COLORS.black,
    fontFamily: "bold",
  },
  listContainer: {
    width: "100%",
  },
  listItem: {
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.small,
    marginVertical: SIZES.small,
    alignItems: "center",
  },
  listItemText: {
    fontSize: 16,
    color: COLORS.black,
  },
  handlebar: {
    width: SIZES.xxLarge * 2,
    backgroundColor: COLORS.themey,
  },
});
