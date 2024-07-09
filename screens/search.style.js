import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../constants";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.medium,
    marginVertical: SIZES.medium,
    marginHorizontal: SIZES.medium,
    height: 40,
  },
  searchIcon: {
    marginHorizontal: 10,
    color: COLORS.gray,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: COLORS.secondary,
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
    backgroundColor: COLORS.primary,
  },

  searchNone: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: SIZES.height - 100,
  },
  noFoundImage: {
    // flex: 1,
    width: 300,
    height: 300,
    aspectRatio: 1,
    margin: "auto",
    alignSelf: "center",
  },
  flatlist: {
    marginHorizontal: 3,
    marginBottom: 79,
  },
});

export default styles;
