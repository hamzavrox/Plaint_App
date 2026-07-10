import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BellIcon from "@/assets/icons/bellicon";
import FilterIconBlack from "@/assets/icons/filtericonblack";
import FilterIcon from "@/assets/icons/filtericon";

type AppHeaderProps = {
  greeting: string;
  subGreeting: string;
  initials: string;
  showSearch?: boolean;
  showFilter?: boolean;
  placeholder: string;
  onNotificationPress?: () => void;
  onFilterPress?: () => void;
};

export default function AppHeader({
  greeting,
  subGreeting,
  initials,
  showSearch = false,
  showFilter = true,
  placeholder,
  onFilterPress,
}: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Pressable style={styles.headerContainer} onPress={() => searchOpen && setSearchOpen(false)}>
      <View style={styles.header}>
        <View style={{ flexDirection: "column", width: "70%" }}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subGreeting}>{subGreeting}</Text>
        </View>

        <View style={styles.headerRight}>
          {showSearch && (
            <TouchableOpacity onPress={() => setSearchOpen(!searchOpen)} hitSlop={8}>
              <Ionicons name="search-outline" size={22} color="#000000" />
            </TouchableOpacity>
          )}

          <View style={styles.bellWrap}>
            <BellIcon />
            <View style={styles.bellDot} />
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      {showSearch && searchOpen && (
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
 {showFilter && (
    <Pressable
      onPress={onFilterPress}
      style={({ pressed }) => [
        styles.filterBtn,
        pressed && styles.filterBtnPressed,
      ]}
    >
      {({ pressed }) =>
        pressed ? <FilterIconBlack /> : <FilterIcon />
      }
    </Pressable>
  )}
          </View>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // headerContainer: {
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#E6E6E6",
  //   paddingBottom: 0,
  // },
  searchRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E6E6E6", 
    borderRadius: 10,
    marginHorizontal: 16,
    // paddingHorizontal: 12,
    paddingRight:2,
    paddingVertical: 12,
    height: 40,
    gap: 4,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontFamily: "SF_Pro_Regular",
    padding: 0,
  },
  filterBtn: {
    width: 35,
    height: 35,
    borderRadius: 8,
    // borderWidth: 1,
    backgroundColor: "#E6E6E6",
    alignItems: "center",
    justifyContent: "center",
  },

  filterBtnPressed: {
  backgroundColor: "#00DEAB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 15,
  },

  greeting: {
    fontSize: 18,
    fontFamily: "SF_Pro_Semibold",
    color: "#111827",
  },

  subGreeting: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "SF_Pro_Regular",
    marginTop: 2,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  bellWrap: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  bellDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00DEAB",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#1D1D1D",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontFamily: "SF_Pro_Bold",
    fontSize: 14,
  },
  
});