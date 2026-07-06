import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const TABS: { name: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { name: "Tasks",     icon: "checkbox-outline"      },
  { name: "Dashboard", icon: "calendar-outline"       },
  { name: "stats",     icon: "stats-chart-outline"    },
  { name: "home",      icon: "home-outline"           },
  { name: "chat",      icon: "chatbubble-outline"     },
  { name: "biometric", icon: "finger-print-outline"   },
  { name: "grid",      icon: "grid-outline"           },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {TABS.map((tab, i) => {
          const focused = state.index === i;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(tab.name)}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={focused ? "#000" : "#fff"}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: "#000",
    borderRadius: 40,
    height: 68,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    // elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    width: 46,
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 50,
  },
});
