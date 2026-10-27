module.exports = function (api) {
  api.cache.using(() => process.env.BABEL_ENV || process.env.NODE_ENV);
  const presets = ["babel-preset-expo"];
  return {
    presets,
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      "react-native-reanimated/plugin",
      ...(api.env("production") ? ["transform-remove-console"] : []),
    ],
  };
};
