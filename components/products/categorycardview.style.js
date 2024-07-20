import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    width: SIZES.width - 14,
    height: SIZES.width / 2,
    marginEnd: 6,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themeg,
    marginBottom: SIZES.small,
  },
  imageContainer: {
    flex: 1,
    width: SIZES.width - 19,
    marginTop: SIZES.small / 2 - 3,
    marginLeft: SIZES.xxSmall - 4,
    overflow: "hidden",
    borderRadius: SIZES.small,
  },
  image: {
    aspectRatio: 2,
    resizeMode: "cover",
  },
  details: {
    padding: SIZES.small,
  },
  title: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    marginBottom: 2,
  },
  price: {
    fontFamily: "bold",
  },
  supplier: {
    fontSize: SIZES.medium,
  },
  addBtn: {
    position: "absolute",
    bottom: SIZES.small,
    right: SIZES.small,
  },
});

export default styles;
