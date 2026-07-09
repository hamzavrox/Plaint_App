import { Tabs } from "expo-router";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{ headerShown: false ,tabBarHideOnKeyboard:true,}}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="Tasks" />
      <Tabs.Screen name="Dashboard" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="biometric" />
      <Tabs.Screen name="grid" />
    </Tabs>
  );
}
