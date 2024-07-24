import { StyleSheet, Text, View } from "react-native";
import { COLORS, SHADOWS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
    flexDirection: "row",
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
    shadowColor: COLORS.lightWhite,
    marginHorizontal: SIZES.small,
    marginTop: SIZES.small,
  },
  image: {
    width: 75,
    aspectRatio: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginHorizontal: SIZES.medium,
  },
  productTitle: {
    fontSize: SIZES.medium,
    fontFamily: "bold",
    color: COLORS.primary,
  },
});

export default styles;
