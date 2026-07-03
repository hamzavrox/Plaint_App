import { useFonts } from "expo-font";

export default function useAppFonts() {
  return useFonts({
    SF_Pro_Light: require("@/assets/fonts/SF-Pro-Text-Light.otf"),
    SF_Pro_Regular: require("@/assets/fonts/SF-Pro-Text-Regular.otf"),
    SF_Pro_Medium: require("@/assets/fonts/SF-Pro-Text-Medium.otf"),
    SF_Pro_Semibold: require("@/assets/fonts/SF-Pro-Text-Semibold.otf"),
    SF_Pro_Bold: require("@/assets/fonts/SF-Pro-Text-Bold.otf"),
  });
}