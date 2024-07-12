import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  welcomeTxt: (color) => ({
    fontFamily: "bold",
    fontSize: SIZES.xxLarge - 14,
    marginTop: SIZES.xSmall,
    color: color,
    textAlign: "center",
  }),
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themey,
    borderRadius: SIZES.medium,
    marginVertical: SIZES.small - 6,
    marginHorizontal: 4,
    height: 56,
  },
  searchIcon: {
    marginHorizontal: 10,
    color: COLORS.gray,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: COLORS.themey,
    marginRight: 10,
    borderRadius: SIZES.medium,
  },
  searchInput: {
    fontFamily: "regular",
    width: "100%",
  },
  searchBtn: {
    width: 50,
    height: "100%",
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: COLORS.primary,
  },
});

export default styles;
