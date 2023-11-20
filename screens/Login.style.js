import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const styles = StyleSheet.create({

    cover: {
        height: SIZES.height / 2.4,
        width: SIZES.width - 60,
        resizeMode: "contain",
        marginBottom: SIZES.xxLarge
    },

    title: {
        fontFamily: "bold",
        fontSize: SIZES.xLarge,
        color: COLORS.primary,
        alignItems: "center",
        textAlign: "center",
        marginBottom: SIZES.xxLarge
    },

    wrapper: {
        marginBottom: 20,

    },

    label: {
        fontFamily: "regular",
        fontSize: SIZES.xSmall,
        marginBottom: 5,
        textAlign: "right"
    },

    inputWrapper: (borderColor) => ({
        borderColor: borderColor,
        backgroundColor: COLORS.lightWhite,
        borderWidth: 1,
        height: 55,
        borderRadius: 12,
        flexDirection: "row",
        paddingHorizontal: 15,
        alignItems: "center",

    }),

    iconStyle: {
        marginRight: 10
    },

    errorMessage: {
        color: COLORS.red,
        fontFamily: "regular",
        fontSize: SIZES.xSmall,
        marginLeft: 5,
        marginTop: 5
    },

    registration : {
        marginTop: 10,
        textAlign: "center",
        marginBottom: 20
    }

});

export default styles;