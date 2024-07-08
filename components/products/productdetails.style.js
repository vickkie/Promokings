import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },

  upperRow: {
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: SIZES.xxLarge,
    width: SIZES.width - 44,
    zIndex: 999,
    height: 400,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  details: {
    marginTop: -SIZES.large,
    width: SIZES.width,
    backgroundColor: COLORS.lightWhite,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
  },
  titleRow: {
    marginHorizontal: 10,
    paddingBottom: SIZES.small,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 22,
    top: 20,
  },
  title: {
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  priceWrapper: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.large,
  },
  price: {
    padding: 10,
    color: COLORS.white,
  },
  ratingRow: {
    paddingBottom: SIZES.small,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 20,
    marginHorizontal: 10,
    top: 3,
  },
  rating: {
    flexDirection: "row",
    justifyContent: "flex-start",
    top: SIZES.large,
    alignItems: "center",
    paddingTop: 9,
  },
  ratingText: {
    color: COLORS.gray,
    fontFamily: "bold",
  },

  toggleAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    top: SIZES.large,
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
  },
  descriptionWrapper: {
    marginTop: SIZES.large + 2,
    marginHorizontal: SIZES.large,
  },
  description: {
    fontFamily: "medium",
    fontSize: SIZES.large - 2,
  },
  descText: {
    fontFamily: "regular",
    fontSize: SIZES.small,
    textAlign: "justify",
  },
  cartRow: {
    paddingBottom: SIZES.small,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: SIZES.width,
  },
  cartBtn: {
    width: SIZES.width * 0.7,
    backgroundColor: COLORS.primary,
    padding: SIZES.small / 2,
    borderRadius: SIZES.large,
    marginLeft: 12,
  },
  cartTitle: {
    fontFamily: "bold",
    color: COLORS.white,
    marginLeft: SIZES.small,
  },
  addBtn: {
    height: 37,
    width: 37,
    borderRadius: 50,
    margin: SIZES.small,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
