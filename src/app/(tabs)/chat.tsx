import MainChatIcon from "@/assets/icons/chaticon";
import AppHeader from "@/components/headerapp";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ChatScreen() {
    const [searchText, setSearchText] = useState("");

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <AppHeader
                    greeting="Good morning, Junaid!"
                    subGreeting="Let's make today productive!"
                    initials="JD"
                    placeholder="Search chats..."
                    showSearch
                    showFilter={false}
                />

                {/* Content scroll area */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Search Input Box */}
                    {/* <View style={styles.searchContainer}>
                        <Ionicons
                            name="search-outline"
                            size={18}
                            color="#9CA3AF"
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Task"
                            placeholderTextColor="#9CA3AF"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View> */}

                    {/* Category Chips */}
                    <View style={styles.chipsContainer}>
                        <TouchableOpacity
                            style={styles.chipButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.chipText}>Channels</Text>
                            <View style={styles.unreadDot} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.chipButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.chipText}>Groups</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Centered empty workspace layout */}
                    <View style={styles.workspaceContainer}>
                        {/* Custom Stacked Speech Bubble Icons */}
                        <View style={styles.iconStack}>
                            {/* Background Bubble (Dark Grey) */}
                            {/* <MaterialCommunityIcons
                                name="message-text"
                                size={68}
                                color="#1D1D1D"
                                style={styles.bgBubble}
                            /> */}
                            {/* Foreground Bubble (Teal Green) */}
                            {/* <MaterialCommunityIcons
                                name="message-text"
                                size={68}
                                color="#00DEAB"
                                style={styles.fgBubble}
                            /> */}

                            <MainChatIcon/>
                        </View>

                        {/* Text details */}
                        <Text style={styles.workspaceTitle}>
                            Private workspace
                        </Text>
                        <Text style={styles.workspaceDescription}>
                            A place just for you to capture ideas, draft messages,
                            and keep everything organized for later.
                        </Text>

                        {/* Add People Button */}
                        <TouchableOpacity
                            style={styles.addPeopleButton}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="person-add"
                                size={16}
                                color="#fff"
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.addPeopleText}>Add People</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safe: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 10,
        marginHorizontal: 16,
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: "#fff",
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: "SF_Pro_Regular",
        color: "#1D1D1D",
        padding: 0,
    },
    chipsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 32,
    },
    chipButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        position: "relative",
    },
    chipText: {
        fontSize: 12,
        fontFamily: "SF_Pro_Medium",
        color: "#1D1D1D",
    },
    unreadDot: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: "#00DEAB",
        borderWidth: 1,
        borderColor: "#fff",
    },
    workspaceContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 64,
        paddingHorizontal: 24,
    },
    iconStack: {
        // width: 100,
        // height: 80,
        position: "relative",
        marginBottom: 16,
    },
    bgBubble: {
        position: "absolute",
        bottom: 4,
        right: 12,
        transform: [{ scaleX: -1 }], // Flip or adjust bubble layout if needed to stack naturally
    },
    fgBubble: {
        position: "absolute",
        top: 0,
        left: 12,
    },
    workspaceTitle: {
        fontSize: 22,
        fontFamily: "SF_Pro_Regular",
        color: "#1D1D1D",
        marginBottom: 8,
        textAlign: "center",
    },
    workspaceDescription: {
        fontSize: 12,
        fontFamily: "SF_Pro_Regular",
        color: "#4B5563",
        textAlign: "center",
        lineHeight: 20,
        // paddingHorizontal: 0,
        marginBottom: 24,
    },
    addPeopleButton: {
        flexDirection: "row",
        justifyContent:"center",
        minWidth: 200,
        alignItems: "center",
        backgroundColor: "#00DEAB",
        borderRadius: 8,
        paddingVertical: 12,
        // paddingHorizontal: 4,
        shadowColor: "#00DEAB",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 8,
    },
    addPeopleText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "SF_Pro_Semibold",
    },
});
