import React from "react";
import FastImage from "react-native-fast-image";

const FastImageComponent = ({ style, source }) => (
  <FastImage style={style} source={source} resizeMode={FastImage.resizeMode.cover} />
);

export default FastImageComponent;
