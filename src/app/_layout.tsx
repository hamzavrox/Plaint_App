import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import useAppFonts from "@/theme/useAppFonts";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const authCtx = useContext(AuthContext);
  const state = authCtx?.state ?? { isAuthenticated: false, isDefaultPassword: false, loading: true };
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontError) {
      console.error("Error loading application fonts:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && !state.loading) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Error hiding splash screen:", err);
      });
    }
  }, [fontsLoaded, state.loading]);

  useEffect(() => {
    if (state.loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inInitialReset = segments.includes("initial-reset");

    if (!state.isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (state.isAuthenticated && state.isDefaultPassword && !inInitialReset) {
      router.replace("/(auth)/initial-reset");
    } else if (state.isAuthenticated && !state.isDefaultPassword && inAuthGroup) {
      router.replace("/(tabs)/tasks");
    }
  }, [state.isAuthenticated, state.isDefaultPassword, state.loading, segments, fontsLoaded]);

  if (state.loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#00DEAB" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TaskProvider>
        <RootNavigator />
      </TaskProvider>
    </AuthProvider>
  );
}
