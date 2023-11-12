import {COLORS,SIZES} from '..//constants';
import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({

    container: {
        backgroundColor: COLORS.lightWhite,
        flex: 1,
    },

    cover: {
        height: 290,
        width: "100%",
        resizeMode: "cover"
    },

    profileContainer: {
        flex: 1,
        alignItems: 'center'
    },

    profile: {
        height: 155,
        width: 155,
        borderRadius: 999,
        borderColor: COLORS.primary,
        borderWidth: 2,
        resizeMode: "cover",
        marginTop: -90
    },

    name: {
        fontFamily: "bold",
        color: COLORS.primary,
        marginVertical: 6
    },

    loginBtn: {
        backgroundColor: COLORS.secondary,
        padding: 2,
        borderWidth: 0.4,
        borderColor: COLORS.primary,
        borderRadius: SIZES.xxLarge,
        paddingHorizontal: 12
    },
    menuText: {
        fontFamily: "regular",
        color: COLORS.gray,
        fontWeight: "600",
        fontSize: 14,
        lineHeight: 26,
    },

    menuWrapper: {
        marginTop: SIZES.xLarge,
        width: SIZES.width-SIZES.large,
        backgroundColor: COLORS.lightWhite,
        borderRadius: 12
    },

    menuItem: (borderBottomWidth) => ({
        borderBottomWidth: borderBottomWidth,
        flexDirection: "row",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderColor: COLORS.gray
    })

});

export default styles;