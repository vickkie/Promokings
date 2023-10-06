import { StyleSheet } from "react-native";
import { SIZES, COLORS } from "../constants";

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.lightWhite,
    },

    wrapper: {
        flex: 1,
        backgroundColor: COLORS.lightWhite
    },

    upperRow: {
        width: SIZES.width-50,
        marginHorizontal: SIZES.large,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        position: "absolute",
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.large,
        top: SIZES.large,
        zIndex: 999
    }  ,

    heading: {
        color: COLORS.lightWhite,
        marginLeft: 5,
        fontFamily: "semibold",
        fontSize: SIZES.small
    }

})

export default styles;