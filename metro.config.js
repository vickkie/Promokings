// Import the default Metro config from Expo
const { getDefaultConfig } = require("@expo/metro-config");

//  the default Metro config
const defaultConfig = getDefaultConfig(process.cwd());

// Modifying the transformer to include react-native-svg-transformer
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// Adjusting the resolver to handle SVG files correctly
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg");
defaultConfig.resolver.sourceExts.push("svg");

module.exports = defaultConfig;
