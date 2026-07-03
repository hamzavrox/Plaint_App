import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import TopMintGlow from "@/components/gradientheader";
import { Colors } from "@/theme/root";

const { width: SW } = Dimensions.get("window");

const SLIDES = [
  require("../../assets/images/mainbanner.png"),
  require("../../assets/images/mainbanner.png"),
  require("../../assets/images/mainbanner.png"),
  require("../../assets/images/mainbanner.png"),
];

function Dots({ active }: { active: number }) {
  return (
    <View style={styles.dotsRow}>
      {SLIDES.map((_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * SW, animated: true });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.root}>
      {/* <StatusBar style="dark" /> */}

      {/* Top half: gradient bg + slider */}
      <View style={styles.topHalf}>

        <TopMintGlow/>
        {/* <LinearGradient
          colors={["#B8F0E6", "#D8FAF3", "#F0FEFA"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        /> */}
        <View/>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.slider}
        >
          {SLIDES.map((src, i) => (
            <View key={i} style={styles.slide}>
              <Image source={src} style={styles.bannerImage} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom half */}
      <View style={styles.bottomHalf}>
        <Dots active={active} />
        <Text style={styles.headline}>Work Smarter, Together</Text>
        <Text style={styles.description}>
          Plan projects, manage tasks, track progress, and collaborate with your
          team in one powerful workspace. Stay organized, meet deadlines, and
          turn ideas into results anytime, anywhere.
        </Text>
        <TouchableOpacity
          style={styles.ctaGradient}
          activeOpacity={0.85}
          onPress={() => router.replace("/login")}
        >
            <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topHalf: {
    flex: 1.15,
    overflow: "hidden",
  },
  // circleHalo: {
  //   position: "absolute",
  //   width: SW * 0.82,
  //   height: SW * 0.82,
  //   borderRadius: SW * 0.41,
  //   // backgroundColor: "rgba(0,222,171,0.07)",
  //   borderWidth: 1,
  //   // borderColor: "rgba(0,222,171,0.13)",
  //   alignSelf: "center",
  //   top: SW * 0.08,
  //   zIndex: 0,
  // },
  slider: { flex: 1 },
  slide: {
    width: SW,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bottomHalf: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 36,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#E6E6E6" },
  dotActive: { backgroundColor: "#000000", width: 7, height: 7 },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  // ctaButton: {
  //   borderRadius: 16,
  //   overflow: "hidden",
  //   shadowColor: "#00DEAB",
  //   shadowOpacity: 0.4,
  //   shadowRadius: 14,
  //   shadowOffset: { width: 0, height: 5 },
  //   elevation: 10,
  // },
  ctaGradient: {
    paddingVertical: 18,
    backgroundColor: Colors.bgButtonColor,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.buttonText,
    letterSpacing: 0.3,
  },
});
