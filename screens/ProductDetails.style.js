import { StyleSheet } from "react-native";
import { SIZES, COLORS } from "../constants";
import { Colors } from "react-native/Libraries/NewAppScreen";

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
        marginHorizontal: 20,
        paddingBottom: SIZES.small,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: SIZES.width - 44,
        top: 20
    },

    cartRow: {
        paddingBottom: SIZES.small,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: SIZES.width 
    },

    cartBtn : {
        width: SIZES.width*0.7,
        backgroundColor: COLORS.black,
        padding: SIZES.small,
        borderRadius: SIZES.large,
        marginLeft: 12
    },

    cartTitle: {
        fontSize: SIZES.medium,
        fontFamily: "bold",
        fontWeight: "700",
        color: COLORS.lightWhite,
        marginLeft: SIZES.small
    },

    addCart: {
        width: 37,
        height: 37,
        backgroundColor: COLORS.black,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10
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

    

    descriptionWrapper: { 
        marginTop: SIZES.large*3,
        marginHorizontal: SIZES.large
    },

    description: {
        fontFamily: 'medium',
        fontSize: SIZES.large -2
    },

    descText: {
        fontFamily: "regular",
        fontSize: SIZES.small,
        textAlign: "justify",
        marginBottom: SIZES.small
    },

    location: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        padding: 5,
        borderRadius: SIZES.large,
        marginHorizontal: 12
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