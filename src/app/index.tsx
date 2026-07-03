import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, View } from "react-native";
import TopMintGlow from "@/components/gradientheader";
import BottomMintGlow from "@/components/gradientfooter";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/splashscreem");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style="dark" />

      <View  style={styles.container}>

        <TopMintGlow/>
        <Image
          source={require("@/assets/images/Plaintlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <BottomMintGlow/>


      </View>

      {/* <LinearGradient
        colors={[
          "#8AF3DD",
          "#F8FFFF",
          "#FFFFFF",
          "#FFFFFF",
          "#E7FFFB",
          "#7CF0DB",
        ]}
        locations={[0, 0.12, 0.42, 0.68, 0.88, 1]}
        style={styles.container}
      >
        <Image
          source={require("@/assets/images/Plaintlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

      </LinearGradient> */}

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    // borderTopLeftRadius: 42,
    // borderTopRightRadius: 42,
    // borderBottomLeftRadius: 42,
    // borderBottomRightRadius: 42,

    // overflow: "hidden",
  },

  logo: {
    width: 160,
    height: 60,
  },
});