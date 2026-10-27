import React from "react";
import { View } from "react-native";

// Jest stub for react-native-svg-transformer output: every .svg import
// resolves to a no-op component with the same props surface.
export default function SvgMock(props) {
  return <View {...props} />;
}
