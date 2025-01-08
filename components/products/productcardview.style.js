import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    width: 162,
    height: 240,
    marginEnd: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themeg,
    // marginBottom: SIZES.medium,
  },
  imageContainer: {
    flex: 1,
    width: 157,
    marginTop: SIZES.small / 2 - 4,
    marginLeft: SIZES.small / 2 - 4,
    overflow: "hidden",
    borderRadius: SIZES.small,
    backgroundColor: COLORS.themew,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  details: {
    padding: SIZES.small,
  },
  title: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    marginBottom: 2,
  },
  price: {
    fontFamily: "bold",
    paddingTop: 6,
  },
  supplier: {
    fontSize: SIZES.medium - 3,
    paddingVertical: SIZES.small - 7,
  },
  addBtn: {
    position: "absolute",
    bottom: SIZES.small,
    right: SIZES.small,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    height: 100,
    width: SIZES.width - 30,
    // backgroundColor: "red",
  },
  errorMessage: {
    fontFamily: "bold",
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: SIZES.medium,
    textAlign: "center",
  },
});

export default styles;
