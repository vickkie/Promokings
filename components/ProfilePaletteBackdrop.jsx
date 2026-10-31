import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import WebView from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import COLOR_THIEF_SOURCE from "../constants/colorThiefSource";

const DEFAULT_COLORS = ["rgb(43,58,68)", "rgb(177,196,199)"];
const cacheKey = (url) => `palette:${url}`;

// Page script receives the image URL via postMessage - user-controlled data
// is never interpolated into executable code (MB-SEC-005). ColorThief is
// vendored locally; no remote script is fetched.
const webviewHtml = `
<html>
  <head><script>${COLOR_THIEF_SOURCE}</script></head>
  <body>
    <script>
      function extractColors(url) {
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
          try {
            var colorThief = new ColorThief();
            var colors = colorThief.getPalette(img, 2);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "colors", data: colors }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: "error", message: String(error && error.message) })
            );
          }
        };
        img.onerror = function () {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "error", message: "Image failed to load" }));
        };
        img.src = url;
      }
      function onMessage(event) {
        try {
          var data = JSON.parse(event.data);
          if (data && data.type === "profile-image" && typeof data.url === "string") {
            extractColors(data.url);
          }
        } catch (e) {}
      }
      window.addEventListener("message", onMessage);
      document.addEventListener("message", onMessage);
    </script>
  </body>
</html>`;

// Gradient backdrop tinted by the profile photo palette. Extracted colors are
// cached per image URL so the hidden extraction WebView only mounts on a
// cache miss instead of every render (MB-UI-007).
const ProfilePaletteBackdrop = ({ profileImageUrl, children, style }) => {
  const [gradientColors, setGradientColors] = useState(DEFAULT_COLORS);
  const [needsExtraction, setNeedsExtraction] = useState(false);
  const webviewRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let colors = DEFAULT_COLORS;
      let extract = false;
      if (profileImageUrl) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey(profileImageUrl));
          const parsed = cached ? JSON.parse(cached) : null;
          if (Array.isArray(parsed) && parsed.length >= 2) {
            colors = parsed;
          } else {
            extract = true;
          }
        } catch {
          extract = true;
        }
      }
      if (cancelled) return;
      setGradientColors(colors);
      setNeedsExtraction(extract);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileImageUrl]);

  const handleMessage = (event) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.type === "colors" && Array.isArray(parsed.data)) {
        const colors = parsed.data.map((color) => `rgb(${color.join(",")})`);
        setGradientColors(colors);
        setNeedsExtraction(false);
        if (profileImageUrl) {
          AsyncStorage.setItem(cacheKey(profileImageUrl), JSON.stringify(colors)).catch(() => {});
        }
      }
    } catch {
      // Malformed WebView message - keep the default palette.
    }
  };

  return (
    <View style={[{ flex: 1, backgroundColor: gradientColors[0] }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {needsExtraction && (
        <WebView
          key={profileImageUrl}
          ref={webviewRef}
          source={{ html: webviewHtml }}
          onLoadEnd={() =>
            webviewRef.current?.postMessage(JSON.stringify({ type: "profile-image", url: profileImageUrl || "" }))
          }
          onMessage={handleMessage}
          originWhitelist={["about:blank"]}
          style={{ width: 1, height: 1, opacity: 0, position: "absolute" }}
        />
      )}
      {children}
    </View>
  );
};

export default ProfilePaletteBackdrop;
