import React from "react";
import { StyleSheet, View } from "react-native";
import { SliderBox } from "react-native-image-slider-box";
import { COLORS } from "../../constants";

// Use React.memo to prevent unnecessary re-renders
const Carousel = () => {
  const sliders = [
    require("../../assets/images/promo/Banner-x.webp"),
    require("../../assets/images/promo/banner2.webp"),
    // require("../../assets/images/promo/banner3.webp"),
    require("../../assets/images/promo/banner1.webp"),
    require("../../assets/images/promo/banner4.webp"),
    require("../../assets/images/promo/final-banner.webp"),
  ];

  return (
    <View style={styles.carouselContainer}>
      <SliderBox
        images={sliders}
        dotColor={COLORS.primary}
        inactiveDotColor={COLORS.secondary}
        ImageComponentStyle={{ borderRadius: 15, width: "95%", marginTop: 5 }}
        imageLoadingColor="#2196F3"
        autoplay
        circleLoop
      />
    </View>
  );
};

export default React.memo(Carousel);

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
  },
});
