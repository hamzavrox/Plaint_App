import FloatingInput from "@/components/FloatingInput";
import TopMintGlow from "@/components/gradientheader";
import { Colors } from "@/theme/root";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Keyboard, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import Images from "@/constants/images";

export default function Login() {
    const [emailAddress, setEmailAddress] = useState("");
    //   const [password, setPassword] = useState("");

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.root}>
                {/* <LinearGradient
        colors={["#8AF3DD", "#F8FFFF", "#FFFFFF"]}
        locations={[0, 0.35, 1]}
        style={styles.topGlow}
      /> */}

                <TopMintGlow />

                <View style={styles.content}>
                    <Image
                        source={Images.PlaintLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>Reset Password</Text>

                    <View>

                        <View>
                            <Text style={styles.emailText}>
                                Enter your Email and proceed to set a new password!
                            </Text>
                        </View>

                        <FloatingInput
                            label="Email Address"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* <FloatingInput
          label="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureToggle
        /> */}

                    </View>

                    <Pressable style={styles.loginBtn} onPress={() => {
                        router.replace('/tasks')
                    }}>
                        <Text style={styles.loginBtnText}>Next</Text>
                    </Pressable>

                    <View style={styles.forgotText}>
                        <Text style={styles.remember}>Remember it?</Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={styles.signIn}>Signin</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingHorizontal: 15,
        justifyContent: "center",
        gap: 16,
    },
    logo: {
        width: 160,
        height: 48,
        alignSelf: "center",
        marginBottom: 8,
    },
    signin: {

    },
    title: {
        fontSize: 28,
        // fontWeight: "600",
        fontFamily: "SF_Pro_Regular",
        textAlign: "center",
        color: "#111",
        marginBottom: 16,
    },
    loginBtn: {
        backgroundColor: Colors.bgButtonColor,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 4,
    },
    emailText: {
        fontFamily: 'SF_Pro_Regular',
        color: '#1f7556',
        marginBottom: 8,
        backgroundColor: '#d6f3e9',
        borderRadius: 8,
        padding: 10,
        textAlign: 'center',
        fontSize: 12
    },
    loginBtnText: {
        fontSize: 16,
        // fontWeight: "600",
        fontFamily: "SF_Pro_Semibold",
        color: Colors.buttonText,
    },
    signIn: {
        fontFamily: 'SF_Pro_Semibold',
        color: '#00dfab'
    },
    remember: {
        fontSize: 14,
        color: Colors.buttonText,
        fontFamily: "SF_Pro_Medium"
    },
    forgotText: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        gap: 1

    },
});
