import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageWrapper: {
    height: 300,
  },

  upperRow: {
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: SIZES.xxLarge,
    width: SIZES.width - 44,
    zIndex: 999,
    // height: 400,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  containerWrapper: {
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: SIZES.height - 300,
  },

  details: {
    // backgroundColor: "red",
    backgroundColor: COLORS.lightWhite,
    marginTop: -10,
    marginLeft: 5,
    marginRight: 5,
    width: SIZES.width - 10,
    borderRadius: SIZES.medium,
    borderBottomLeftRadius: 34,
    minHeight: "100%",
  },
  titleRow: {
    marginHorizontal: 10,
    paddingBottom: SIZES.xLarge,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 22,
    top: 20,
  },
  title: {
    fontFamily: "normal",
    fontSize: SIZES.large,
    paddingLeft: 7,
  },
  quantity: {
    fontFamily: "normal",
    fontSize: SIZES.small,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: 6,
  },
  priceWrapper: {
    // backgroundColor: COLORS.primary,
    borderRadius: SIZES.large,
  },
  price: {
    padding: 10,
    color: COLORS.themeb,
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  ratingRow: {
    paddingBottom: SIZES.small,
    justifyContent: "space-between",
    gap: 40,
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 20,
    marginHorizontal: 10,
    top: 3,
  },
  rating: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  ratingText: {
    color: COLORS.gray,
    fontFamily: "bold",
  },
  helpBtnText: {
    color: COLORS.gray,
    fontFamily: "bold",
    fontSize: SIZES.medium,
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
  shortDescription: {
    marginTop: SIZES.large + 2,
    marginHorizontal: SIZES.large,
  },
  description: {
    fontFamily: "regular",
    fontSize: SIZES.large - 4,
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
    width: SIZES.width * 0.76,
    backgroundColor: COLORS.themey,
    padding: SIZES.small / 2,
    borderRadius: SIZES.large,
    marginLeft: SIZES.medium / 2,
    height: 51,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBtnOut: {
    width: SIZES.width * 0.76,
    backgroundColor: COLORS.themeb,
    padding: SIZES.small / 2,
    borderRadius: SIZES.large,
    marginLeft: SIZES.medium / 2,
    height: 51,
    justifyContent: "center",
    alignItems: "center",
  },
  cartTitle: {
    fontFamily: "bold",
    color: COLORS.white,
    marginLeft: SIZES.small,
  },
  addBtn: {
    height: 51,
    width: 51,
    borderRadius: 50,
    marginRight: SIZES.medium,
    backgroundColor: COLORS.themey,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SIZES.xSmall,
  },
  addBtnOut: {
    height: 51,
    width: 51,
    borderRadius: 50,
    marginRight: SIZES.medium,
    backgroundColor: COLORS.themeb,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SIZES.xSmall,
  },
  sizeWrapper: {
    width: SIZES.width - 20,
    height: 70,
  },
  sizeInnerWrapper: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: SIZES.xLarge,
  },
  sizeHeader: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
  },
  sizeButtons: {
    flexDirection: "row",
    gap: 30,
    marginHorizontal: SIZES.xLarge,
  },
  sizeButton: {
    height: SIZES.xLarge + 5,
    width: SIZES.xLarge + 5,
    padding: 5,
    borderColor: COLORS.gray2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.xLarge,
  },
  selectedSizeButton: {
    backgroundColor: COLORS.themey,
  },
  selectedSizeButtonText: {
    color: COLORS.white,
  },
  expandableHeader: {
    height: 40,
    // width: SIZES.width ,
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: COLORS.gray2,
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.xLarge,
    flexDirection: "row",
  },
  expandableHeaderText: {
    fontFamily: "medium",
  },
  expandableContent: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    color: "red",
  },
  helpBtn: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    padding: SIZES.small,
  },
  buttonWrap1: {
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderColor: "grey",
    borderWidth: 2,
  },
  buttonWrap2: {
    backgroundColor: COLORS.white,
    padding: 8,
    borderColor: "grey",
    borderWidth: 2,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  numbers: {
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
    // top: -3,
    alignSelf: "center",
  },
  cartView: {
    position: "absolute",
    right: 10,
    top: 100,
    zIndex: 10,
  },
});

export default styles;
