import Icons from "@/constants/icons";
const { ChatIcon: MainChatIcon } = Icons;
import AddPeopleModal, { AddPeopleUser } from "@/components/AddPeopleModal";
import AppHeader from "@/components/headerapp";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// hasUnread: true  → dot is visible on the chip
// hasUnread: false → no dot (no new messages)
const CHIP_DATA = [
    { id: "channels", label: "Channels", hasUnread: true },
    { id: "groups", label: "Groups", hasUnread: true },
];

const ALL_USERS: AddPeopleUser[] = [
    { id: "1", name: "Muhammad Salman", email: "salman@email.com" },
    { id: "2", name: "Muhammad Haris", email: "haris@email.com" },
    { id: "3", name: "Najam Ali", email: "najam@email.com" },
    { id: "4", name: "Junaid", email: "junaid@email.com" },
    { id: "5", name: "Awais", email: "awais@email.com" },
    { id: "6", name: "Afzal Saleem", email: "afzal@email.com" },
    { id: "7", name: "Nida Mumtaz", email: "nida@email.com" },
    { id: "8", name: "Wahab Ahmad", email: "wahab@email.com" },
    { id: "9", name: "Maryam", email: "maryam@email.com" },
    { id: "10", name: "Afzal Saleem", email: "afzal@email.com" },
    { id: "11", name: "Nida Mumtaz", email: "nida@email.com" },
    { id: "12", name: "Wahab Ahmad", email: "wahab@email.com" },
    { id: "13", name: "Maryam", email: "maryam@email.com" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ChatScreen() {
    const [addPeopleOpen, setAddPeopleOpen] = useState(false);

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
                />

                {/* Scrollable content */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Category Chips ── */}
                    <View style={styles.chipsContainer}>
                        {CHIP_DATA.map((chip) => (
                            <TouchableOpacity
                                key={chip.id}
                                style={styles.chipButton}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.chipText}>{chip.label}</Text>
                                {/* Dot only when there are unread messages */}
                                {chip.hasUnread && <View style={styles.unreadDot} />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Empty / workspace state ── */}
                    <View style={styles.workspaceContainer}>
                        <View style={styles.iconStack}>
                            <MainChatIcon />
                        </View>

                        <Text style={styles.workspaceTitle}>Private workspace</Text>
                        <Text style={styles.workspaceDescription}>
                            A place just for you to capture ideas, draft messages,
                            and keep everything organized for later.
                        </Text>

                        {/* Add People Button */}
                        <TouchableOpacity
                            style={styles.addPeopleButton}
                            activeOpacity={0.85}
                            onPress={() => setAddPeopleOpen(true)}
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

            {/* ── Reusable Add People Modal ── */}
            <AddPeopleModal
                visible={addPeopleOpen}
                users={ALL_USERS}
                onClose={() => setAddPeopleOpen(false)}
                onSearch={(query) => console.log("Search:", query)}
                onSelectUser={(user) => {
                    setAddPeopleOpen(false);
                    router.push({
                        pathname: "/conversation",
                        params: {
                            name: user.name,
                            initials: user.name.charAt(0).toUpperCase(),
                        },
                    });
                }}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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

    // Chips
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

    // Empty state
    workspaceContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 64,
        paddingHorizontal: 24,
    },
    iconStack: {
        position: "relative",
        marginBottom: 16,
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
        marginBottom: 24,
    },
    addPeopleButton: {
        flexDirection: "row",
        justifyContent: "center",
        minWidth: 200,
        alignItems: "center",
        backgroundColor: "#00DEAB",
        borderRadius: 8,
        paddingVertical: 12,
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
