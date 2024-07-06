import React from "react";
import { StyleSheet, View } from "react-native";
import { SliderBox } from "react-native-image-slider-box";
import { COLORS } from "../../constants";

const Carousel = () => {
  const sliders = [
    require("../../assets/images/promo/banner22.webp"),
    require("../../assets/images/promo/banner3.webp"),
    require("../../assets/images/promo/banner1.webp"),
    require("../../assets/images/promo/banner4.webp"),
    require("../../assets/images/promo/final-banner.webp"),

    "https://promokings.co.ke/wp-content/uploads/2023/04/promo-signage.jpg",
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

export default Carousel;

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
  },
});
