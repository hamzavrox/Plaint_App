import Icons from "@/constants/icons";
const { ChatIcon: MainChatIcon } = Icons;
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    sender: string;
    initials: string;
    time: string;
    text: string;
    isOwn: boolean;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATIC_MESSAGES: Message[] = [
    {
        id: "1",
        sender: "Muhammad Salman",
        initials: "MS",
        time: "10.00AM",
        text: "Hello Junaid! How are you?",
        isOwn: false,
    },
    {
        id: "2",
        sender: "Muhammad Junaid",
        initials: "MS",
        time: "10.00AM",
        text: "Hello Salman! I am good.",
        isOwn: true,
    },
];

// ─── Avatar Component ─────────────────────────────────────────────────────────

function Avatar({ initials, size = 1 }: { initials: string; size?: number }) {
    return (
        <View
            style={[
                styles.avatar,
                { width: size, height: size, borderRadius: size * 0.28 },
            ]}
        >
            <Text style={styles.avatarText}>{initials}</Text>
        </View>
    );
}

// ─── Message Action Icons ─────────────────────────────────────────────────────

function MessageActions({ isOwn }: { isOwn: boolean }) {
    const icons: Array<React.ComponentProps<typeof Ionicons>["name"]> = isOwn
        ? ["thumbs-up-outline", "happy-outline", "arrow-redo-outline", "arrow-undo-outline", "ellipsis-vertical"]
        : ["thumbs-up-outline", "happy-outline", "arrow-redo-outline", "pencil-outline", "arrow-undo-outline", "ellipsis-vertical"];

    return (
        <View style={styles.actionsRow}>
            {icons.map((icon, idx) => (
                <TouchableOpacity key={idx} activeOpacity={0.7} style={styles.actionBtn}>
                    <Ionicons name={icon} size={14} color="#9CA3AF" />
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
    if (!message.isOwn) {
        // Incoming: avatar on right, bubble left-aligned
        return (
            <View style={styles.messageWrapper}>
                <View style={styles.incomingRow}>
                    <View style={styles.incomingContent}>
                        <Text style={styles.senderMeta}>
                            {message.sender}{" "}
                            <Text style={styles.timeMeta}>| {message.time}</Text>
                        </Text>
                        <View style={styles.incomingBubble}>
                            <Text style={styles.bubbleText}>{message.text}</Text>
                        </View>
                        <MessageActions isOwn={false} />
                    </View>
                    <Avatar initials={message.initials} size={38} />
                </View>
            </View>
        );
    }

    // Outgoing: avatar on left, bubble right-aligned
    return (
        <View style={styles.messageWrapper}>
            <View style={styles.outgoingRow}>
                <Avatar initials={message.initials} size={38} />
                <View style={styles.outgoingContent}>
                    <Text style={styles.senderMetaOutgoing}>
                        {message.sender}{" "}
                        <Text style={styles.timeMeta}>| {message.time}</Text>
                    </Text>
                    <View style={styles.outgoingBubble}>
                        <Text style={styles.bubbleText}>{message.text}</Text>
                    </View>
                    <MessageActions isOwn={true} />
                </View>
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ConversationScreen() {
    const params = useLocalSearchParams<{ name?: string; initials?: string }>();
    const name = params.name ?? "Muhammad Junaid";
    const initials = params.initials ?? "J";

    const [message, setMessage] = useState("");
    const scrollRef = useRef<ScrollView>(null);

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safe}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            hitSlop={8}
                            style={styles.backBtn}
                        >
                            <Ionicons name="chevron-back" size={22} color="#1D1D1D" />
                        </TouchableOpacity>

                        {/* Avatar */}
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>{initials}</Text>
                        </View>

                        {/* Name + status */}
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerName} numberOfLines={1}>
                                {name}
                            </Text>
                            <Text style={styles.headerStatus}>Active 10h ago</Text>
                        </View>
                    </View>

                    <TouchableOpacity hitSlop={8}>
                        <Ionicons name="search-outline" size={20} color="#E6E6E6" />
                    </TouchableOpacity>
                </View>

                {/* ── Filter Chips ── */}
                <View style={styles.filterRow}>
                    <TouchableOpacity style={styles.filterChip} activeOpacity={0.75}>
                        <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                        <Text style={styles.filterChipText}>Date</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip} activeOpacity={0.75}>
                        <Ionicons name="attach-outline" size={13} color="#6B7280" />
                        <Text style={styles.filterChipText}>Attachments</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Scrollable content ── */}
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <ScrollView
                        ref={scrollRef}
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Date separator ── */}
                        <View style={styles.dateSeparator}>
                            <View style={styles.dateLine} />
                            <View style={styles.datePill}>
                                <Text style={styles.datePillText}>Today's Chat</Text>
                                <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
                            </View>
                        </View>

                        {/* ── Private workspace empty state ── */}
                        <View style={styles.workspaceContainer}>
                            <View style={styles.iconStack}>
                                <MainChatIcon />
                            </View>
                            <Text style={styles.workspaceTitle}>Private workspace</Text>
                            <Text style={styles.workspaceDescription}>
                                A place just for you to capture ideas, draft messages,{"\n"}
                                and keep everything organized for later.
                            </Text>
                        </View>

                        {/* ── Messages ── */}
                        <View style={styles.messagesContainer}>
                            {STATIC_MESSAGES.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                        </View>
                    </ScrollView>

                    {/* ── Bottom Input Bar ── */}
                    <View style={styles.inputBar}>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Type anything..."
                                    placeholderTextColor="#9CA3AF"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    maxLength={2000}
                                />
                            </View>

                            {/* Action row */}
                            <View style={styles.inputActions}>
                                <View style={styles.inputActionsLeft}>
                                    <TouchableOpacity activeOpacity={0.75} style={styles.inputActionBtn}>
                                        <Ionicons name="add" size={20} color="#1D1D1D" />
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.75} style={styles.inputActionBtn}>
                                        <Ionicons name="happy-outline" size={18} color="#1D1D1D" />
                                        <Text style={styles.plusBadge}>+</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.75} style={styles.inputActionBtn}>
                                        <Ionicons name="mic" size={18} color="#1D1D1D" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.sendBtn,
                                        message.trim().length > 0 && styles.sendBtnActive,
                                    ]}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        if (message.trim()) setMessage("");
                                    }}
                                >
                                    <Ionicons name="paper-plane" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TEAL = "#00DEAB";
const TEXT_PRIMARY = "#1D1D1D";
const TEXT_SECONDARY = "#6B7280";

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safe: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    backBtn: {
        marginRight: 2,
    },
    headerAvatar: {
        width: 30,
        height: 30,
        borderRadius: 5,
        backgroundColor: TEAL,
        justifyContent: "center",
        alignItems: "center",
    },
    headerAvatarText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "SF_Pro_Semibold",
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 15,
        fontFamily: "SF_Pro_Medium",
        color: TEXT_PRIMARY,
    },
    headerStatus: {
        fontSize: 10,
        fontFamily: "SF_Pro_Medium",
        color: "#8A8A8A",
        marginTop: 1,
    },

    // ── Filter Chips ──
    filterRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        // borderBottomWidth: 1,
        // borderBottomColor: "#F3F4F6",
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: "#fff",
    },
    filterChipText: {
        fontSize: 12,
        fontFamily: "SF_Pro_Regular",
        color:"#8A8A8A",
    },

    // ── Scroll ──
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 12,
    },

    // ── Date Separator ──
    dateSeparator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 16,
        position: "relative",
    },
    dateLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: "#E6E6E6",
        zIndex: 0,
    },
    datePill: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 5,
        backgroundColor: "#fff",
        zIndex: 1,
    },
    datePillText: {
        fontSize: 12,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_SECONDARY,
    },

    // ── Empty State ──
    workspaceContainer: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    iconStack: {
        marginBottom: 14,
    },
    workspaceTitle: {
        fontSize: 20,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_PRIMARY,
        marginBottom: 8,
        textAlign: "center",
    },
    workspaceDescription: {
        fontSize: 12,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_SECONDARY,
        textAlign: "center",
        lineHeight: 20,
    },

    // ── Messages ──
    messagesContainer: {
        paddingHorizontal: 16,
        gap: 20,
        paddingTop: 8,
    },
    messageWrapper: {
        width: "100%",
    },

    // Incoming (avatar right)
    incomingRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        gap: 10,
    },
    incomingContent: {
        flex: 1,
        alignItems: "flex-end",
    },
    senderMeta: {
        fontSize: 11,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_SECONDARY,
        marginBottom: 5,
        textAlign: "right",
    },
    incomingBubble: {
        backgroundColor: "#E6FAF5",
        borderRadius: 14,
        borderTopRightRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: "90%",
    },

    // Outgoing (avatar left)
    outgoingRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 10,
    },
    outgoingContent: {
        flex: 1,
        alignItems: "flex-start",
    },
    senderMetaOutgoing: {
        fontSize: 11,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_SECONDARY,
        marginBottom: 5,
        textAlign: "left",
    },
    outgoingBubble: {
        backgroundColor: "#E6FAF5",
        borderRadius: 14,
        borderTopLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: "90%",
    },

    // Shared bubble text
    bubbleText: {
        fontSize: 14,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_PRIMARY,
        lineHeight: 20,
    },

    timeMeta: {
        fontSize: 11,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_SECONDARY,
    },

    // ── Message Actions ──
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
        paddingHorizontal: 2,
    },
    actionBtn: {
        padding: 2,
    },

    // ── Avatar ──
    avatar: {
        backgroundColor: TEAL,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 13,
        fontFamily: "SF_Pro_Semibold",
        letterSpacing: 0.3,
    },

    // ── Input Bar ──
    inputBar: {
        backgroundColor: "#fff",
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 24 : 16,
        paddingHorizontal: 16,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    inputRow: {
        minHeight: 40,
        justifyContent: "flex-start",
    },
    textInput: {
        fontSize: 14,
        fontFamily: "SF_Pro_Regular",
        color: TEXT_PRIMARY,
        padding: 0,
        maxHeight: 100,
        textAlignVertical: "top",
    },
    inputActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    inputActionsLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    inputActionBtn: {
        width: 38,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#F2F2F2",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    plusBadge: {
        position: "absolute",
        top: 6,
        right: 8,
        fontSize: 9,
        color: TEXT_PRIMARY,
        fontFamily: "SF_Pro_Semibold",
    },
    sendBtn: {
        width: 38,
        height: 36,
        borderRadius: 10,
        backgroundColor: TEAL,
        justifyContent: "center",
        alignItems: "center",
    },
    sendBtnActive: {
        backgroundColor: TEAL,
    },
});
