import BottomGlow from "@/components/gradientfooter";
import FloatingInput from "@/components/FloatingInput";
import { useState } from "react";
import { Image, Keyboard, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TopMintGlow from "@/components/gradientheader";
import { Color } from "expo-router";
import { Colors } from "@/theme/root";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.root}>
      {/* <LinearGradient
        colors={["#8AF3DD", "#F8FFFF", "#FFFFFF"]}
        locations={[0, 0.35, 1]}
        style={styles.topGlow}
      /> */}

      <TopMintGlow/>

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/Plaintlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome back!</Text>

        <View>

        <FloatingInput
          label="Enter your work email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FloatingInput
          label="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureToggle
        />
         
         </View>

        <Pressable style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Log In</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>
      </View>

      {/* <BottomGlow /> */}
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // topGlow: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   height: 220,
  //   borderBottomLeftRadius: 40,
  //   borderBottomRightRadius: 40,
  // },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 16,
  },
  logo: {
    width: 160,
    height: 48,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    // fontWeight: "600",
    fontFamily: "SF_Pro_Medium",
    textAlign: "center",
    color: "#111",
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: Colors.bgButtonColor,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.buttonText,
  },
  forgotText: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.buttonText,
    fontWeight: "500",
  },
});
