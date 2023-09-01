import { StyleSheet } from "react-native";
import { SIZES, COLORS } from "../constants";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightWhite
    },

    upperRow: {
        marginHorizontal: 20,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        position: "absolute",
        top: SIZES.xxLarge,
        width: SIZES.width - 44,
        zIndex: 999
    },

    image: {
        aspectRatio: 1,
        resizeMode: "cover"
    },

    details: {
        marginTop: -SIZES.large,
        backgroundColor: COLORS.lightWhite,
        width: SIZES.width,
        borderTopLeftRadius: SIZES.medium,
        borderTopRightRadius: SIZES.medium,
    },

    titleRow: {
        marginHorizontal: 19,
        paddingBottom: SIZES.small,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: SIZES.width - 44,
        top: 20
    },

    ratingRow: {
        paddingBottom: SIZES.small,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: SIZES.width -10,
        top: 5
    },

    rating: {
        top: SIZES.large,
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: "center",
        marginHorizontal: SIZES.large
    },

    title: {
        fontSize: SIZES.large,
        fontFamily: "bold",
        fontWeight: "700",
    },

    price: {
        fontSize: SIZES.large,
        fontFamily: "bold",
        fontWeight: "700"
    },

    priceWrapper: {
        backgroundColor: COLORS.secondary,
        borderRadius: SIZES.large,
        paddingHorizontal: 10,
    }
});

export default styles;