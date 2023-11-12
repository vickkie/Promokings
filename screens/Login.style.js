import { StyleSheet } from 'react-native';
import {COLORS, SIZES} from '../constants';

const styles = StyleSheet.create({

    cover: {
        height: SIZES.height/2.4,
        width: SIZES.width-60,
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
    }

});

export default styles;