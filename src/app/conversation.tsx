import Icons from "@/constants/icons";
const { ChatIcon: MainChatIcon } = Icons;
import AddPeopleModal, { AddPeopleUser } from "@/components/AddPeopleModal";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import CalendarPicker from "@/components/CalendarPicker";
import React, { useRef, useState } from "react";
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
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

const CHANNEL_MEMBERS = [
    { id: "1", name: "Muhammad Zanaen Ull...", initials: "M", isYou: false },
    { id: "2", name: "Mohammad Areeb Akr...", initials: "M", isYou: false },
    { id: "3", name: "Shanawar Butt", initials: "S", isYou: false },
    { id: "4", name: "Muhammad H...", initials: "M", isYou: true },
];

const MOCK_USERS: AddPeopleUser[] = [
    { id: "1", name: "Muhammad Salman", email: "salman@email.com" },
    { id: "2", name: "Muhammad Haris", email: "haris@email.com" },
    { id: "3", name: "Najam Ali", email: "najam@email.com" },
    { id: "4", name: "Junaid", email: "junaid@email.com" },
    { id: "5", name: "Awais", email: "awais@email.com" },
    { id: "6", name: "Nida Mumtaz", email: "nida@email.com" },
    { id: "7", name: "Wahab Ahmad", email: "wahab@email.com" },
    { id: "8", name: "Maryam", email: "maryam@email.com" },
    { id: "9", name: "Anum", email: "anum@email.com" },
    { id: "10", name: "Waqas", email: "waqas@email.com" },
];

// ─── Date Panel ───────────────────────────────────────────────────────────────

const DATE_RANGES = ["Today", "Last 7 days", "Last 30 days", "Last 90 days"];

function DateFilterPanel() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [startDate, setStartDate] = useState<Date | null>(today);
    const [endDate, setEndDate] = useState<Date | null>(today);
    const [selectedRange, setSelectedRange] = useState<string | null>("Today");

    const handleRangeSelect = (range: string) => {
        setSelectedRange(range);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let start: Date;
        switch (range) {
            case "Today":
                start = new Date(now);
                break;
            case "Last 7 days":
                start = new Date(now);
                start.setDate(now.getDate() - 6);
                break;
            case "Last 30 days":
                start = new Date(now);
                start.setDate(now.getDate() - 29);
                break;
            case "Last 90 days":
                start = new Date(now);
                start.setDate(now.getDate() - 89);
                break;
            default:
                start = new Date(now);
        }
        setStartDate(start);
        setEndDate(new Date(now));
    };

    const handleSelectStart = (d: Date) => {
        setStartDate(d);
        setSelectedRange(null);
    };

    const handleSelectEnd = (d: Date) => {
        setEndDate(d);
        setSelectedRange(null);
    };

    return (
        <View style={dp.container}>
            <View style={dp.sidebar}>
                {DATE_RANGES.map((r) => (
                    <TouchableOpacity
                        key={r}
                        style={[dp.rangeItem, selectedRange === r && dp.rangeItemActive]}
                        onPress={() => handleRangeSelect(r)}
                        activeOpacity={0.7}
                    >
                        <Text style={[dp.rangeText, selectedRange === r && dp.rangeTextActive]}>{r}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={dp.calWrap}>
                <CalendarPicker
                    startDate={startDate}
                    endDate={endDate}
                    onSelectStart={handleSelectStart}
                    onSelectEnd={handleSelectEnd}
                    onDone={() => {}}
                    compact={true}
                />
            </View>
        </View>
    );
}

const dp = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: 10,
        gap: 8,
    },
    sidebar: {
        width: 100,
        gap: 0,
    },
    rangeItem: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 6,
    },
    rangeItemActive: {},
    rangeText: {
        fontSize: 11.5,
        fontFamily: "SF_Pro_Regular",
        color: "#6B7280",
    },
    rangeTextActive: {
        fontFamily: "SF_Pro_Semibold",
        color: "#1D1D1D",
    },
    calWrap: {
        flex: 1,
    },
});

// ─── Attachments Panel ────────────────────────────────────────────────────────

const ATTACH_TABS = ["Images", "Videos", "Docs", "Links"];

// Placeholder image squares
const PLACEHOLDER_IMAGES = Array.from({ length: 8 });
const IMAGES: string[] = [];

function AttachmentsPanel() {
    const [activeTab, setActiveTab] = useState("Images");
    return (
        <View style={ap.container}>
            {/* Sub-tabs */}
            <View style={ap.tabRow}>
                {ATTACH_TABS.map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[ap.tab, activeTab === t && ap.tabActive]}
                        onPress={() => setActiveTab(t)}
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name={
                                t === "Images" ? "image-outline" :
                                t === "Videos" ? "videocam-outline" :
                                t === "Docs" ? "document-text-outline" :
                                "link-outline"
                            }
                            size={13}
                            color={activeTab === t ? "#1D1D1D" : "#9CA3AF"}
                            style={{ marginRight: 4 }}
                        />
                        <Text style={[ap.tabText, activeTab === t && ap.tabTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Image grid */}
            {activeTab === "Images" && (
  IMAGES.length > 0 ? (
    <View style={ap.imageGrid}>
      {IMAGES.map((item, index) => (
        <Image
          key={index}
          source={{ uri: item }}
          style={ap.imageThumb}
        />
      ))}
    </View>
  ) : (
    <View style={ap.emptyTab}>
      <Text style={ap.emptyTabText}>No images found</Text>
    </View>
  )
)}
            {activeTab !== "Images" && (
                <View style={ap.emptyTab}>
                    <Text style={ap.emptyTabText}>No {activeTab.toLowerCase()} found</Text>
                </View>
            )}
        </View>
    );
}

const ap = StyleSheet.create({
    container: { paddingBottom: 4 },
    tabRow: {
        flexDirection: "row",
        justifyContent:"space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: "#1D1D1D",
    },
    tabText: {
        fontSize: 12,
        fontFamily: "SF_Pro_Regular",
        color: "#9CA3AF",
    },
    tabTextActive: {
        fontFamily: "SF_Pro_Medium",
        color: "#1D1D1D",
    },
    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 1,
        paddingTop: 2,
    },
    imageThumb: {
        width: "25%",
        aspectRatio: 1,
        backgroundColor: "#1a1a2e",
        // borderWidth: 1.5,
        borderColor: "#fff",
    },
    emptyTab: {
        padding: 24,
        alignItems: "center",
    },
    emptyTabText: {
        fontSize: 13,
        color: "#9CA3AF",
        fontFamily: "SF_Pro_Regular",
    },
});

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
    // Incoming: avatar on RIGHT, bubble right-aligned
    if (!message.isOwn) {
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
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{message.initials}</Text>
                    </View>
                </View>
            </View>
        );
    }

    // Outgoing: avatar on LEFT, bubble left-aligned
    return (
        <View style={styles.messageWrapper}>
            <View style={styles.outgoingRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{message.initials}</Text>
                </View>
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

type FilterTab = "date" | "attachments" | "chat_member" | "post_type" | null;

export default function ConversationScreen() {
    const params = useLocalSearchParams<{ name?: string; initials?: string; isChannel?: string }>();
    const name = params.name ?? "Muhammad Junaid";
    const initials = params.initials ?? "J";
    const isChannel = params.isChannel === "true";

    const [message, setMessage] = useState("");
    const scrollRef = useRef<ScrollView>(null);
    const [postTypeOpen, setPostTypeOpen] = useState(false);
    const [addPeopleOpen, setAddPeopleOpen] = useState(false);

    const POST_TYPES = [
        { id: "announcement", label: "Announcement", icon: "megaphone", color: "#00DEAB", bg: "#E6FAF5", count: 1 },
        { id: "discussion", label: "Discussion", icon: "chatbubbles", color: "#3B82F6", bg: "#EFF6FF", count: 0 },
        { id: "idea", label: "Idea", icon: "bulb", color: "#EAB308", bg: "#FEF9C3", count: 0 },
        { id: "updates", label: "Update", icon: "notifications", color: "#8B5CF6", bg: "#F5F3FF", count: 0 },
    ];

    // Search
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const searchInputRef = useRef<TextInput>(null);

    // Filter tabs
    const [activeFilter, setActiveFilter] = useState<FilterTab>(null);

    const toggleFilter = (tab: FilterTab) => {
        setActiveFilter((prev) => (prev === tab ? null : tab));
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safe}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    {!searchOpen ? (
                        <>
                            <View style={styles.headerLeft}>
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    hitSlop={8}
                                    style={styles.backBtn}
                                >
                                    <Ionicons name="chevron-back" size={22} color="#1D1D1D" />
                                </TouchableOpacity>

                                <View style={styles.headerAvatar}>
                                    <Text style={styles.headerAvatarText}>{initials}</Text>
                                </View>

                                <View style={styles.headerInfo}>
                                    <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
                                    <Text style={styles.headerStatus}>Active 10h ago</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                hitSlop={8}
                                onPress={() => {
                                    setSearchOpen(true);
                                    setTimeout(() => searchInputRef.current?.focus(), 100);
                                }}
                            >
                                <Ionicons name="search-outline" size={20} color="#1D1D1D" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* ── Search bar (same style as headerapp) ── */
                        <Pressable style={styles.searchRow} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.searchBox}>
                                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                                <TextInput
                                    ref={searchInputRef}
                                    style={styles.searchInput}
                                    placeholder="Search messages..."
                                    placeholderTextColor="#9CA3AF"
                                    value={search}
                                    onChangeText={setSearch}
                                    autoFocus
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => { setSearchOpen(false); setSearch(""); }}
                                style={styles.cancelBtn}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </Pressable>
                    )}
                </View>

                {/* ── Filter Chips ── */}
                {!searchOpen && (
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                        style={{ flexGrow: 0 }}
                    >
                        <TouchableOpacity
                            style={[styles.filterChip, activeFilter === "date" && styles.filterChipActive]}
                            activeOpacity={0.75}
                            onPress={() => toggleFilter("date")}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={11}
                                color={activeFilter === "date" ? "#fff" : "#6B7280"}
                            />
                            <Text style={[styles.filterChipText, activeFilter === "date" && styles.filterChipTextActive]}>
                                Date
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterChip, activeFilter === "attachments" && styles.filterChipActive]}
                            activeOpacity={0.75}
                            onPress={() => toggleFilter("attachments")}
                        >
                            <Ionicons
                                name="attach-outline"
                                size={11}
                                color={activeFilter === "attachments" ? "#fff" : "#6B7280"}
                            />
                            <Text style={[styles.filterChipText, activeFilter === "attachments" && styles.filterChipTextActive]}>
                                Attachments
                            </Text>
                        </TouchableOpacity>

                        {isChannel && (
                            <TouchableOpacity
                                style={[styles.filterChip, activeFilter === "chat_member" && styles.filterChipActive]}
                                activeOpacity={0.75}
                                onPress={() => toggleFilter("chat_member")}
                            >
                                <Ionicons
                                    name="people-outline"
                                    size={11}
                                    color={activeFilter === "chat_member" ? "#fff" : "#6B7280"}
                                />
                                <Text style={[styles.filterChipText, activeFilter === "chat_member" && styles.filterChipTextActive]}>
                                    Chat Member
                                </Text>
                            </TouchableOpacity>
                        )}
                        {isChannel && (
                            <TouchableOpacity
                                style={[styles.filterChip, activeFilter === "post_type" && styles.filterChipActive]}
                                activeOpacity={0.75}
                                onPress={() => toggleFilter("post_type")}
                            >
                                <Ionicons
                                    name="apps-outline"
                                    size={11}
                                    color={activeFilter === "post_type" ? "#fff" : "#6B7280"}
                                />
                                <Text style={[styles.filterChipText, activeFilter === "post_type" && styles.filterChipTextActive]}>
                                    Post Type
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                )}

                {/* ── Date / Attachments / Post Type panel ── */}
                {!searchOpen && activeFilter === "date" && (
                    <View style={styles.panelWrapper}>
                        <DateFilterPanel />
                    </View>
                )}
                {!searchOpen && activeFilter === "attachments" && (
                    <View style={styles.panelWrapper}>
                        <AttachmentsPanel />
                    </View>
                )}
                {!searchOpen && activeFilter === "post_type" && isChannel && (
                    <View style={styles.panelWrapper}>
                        <View style={styles.postTypeListPanel}>
                            {POST_TYPES.map((pt) => (
                                <TouchableOpacity
                                    key={pt.id}
                                    style={[styles.postTypeListRow, { backgroundColor: pt.bg }]}
                                    activeOpacity={0.75}
                                >
                                    <Ionicons name={pt.icon as any} size={14} color={pt.color} />
                                    <Text style={[styles.postTypeListLabel, { color: pt.color }]} numberOfLines={1}>{pt.label}</Text>
                                    <View style={styles.postTypeListBadge}>
                                        <Text style={[styles.postTypeListBadgeText, { color: pt.color }]}>
                                            {String(pt.count).padStart(2, "0")}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
                {!searchOpen && activeFilter === "chat_member" && isChannel && (
                    <View style={styles.panelWrapper}>
                        <View style={styles.memberListPanel}>
                            {CHANNEL_MEMBERS.map((member) => (
                                <View key={member.id} style={styles.memberRow}>
                                    <View style={styles.memberAvatar}>
                                        <Text style={styles.memberAvatarText}>{member.initials}</Text>
                                    </View>
                                    <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                                    {member.isYou && (
                                        <View style={styles.youBadge}>
                                            <Text style={styles.youBadgeText}>You</Text>
                                        </View>
                                    )}
                                    {member.isYou && (
                                        <TouchableOpacity activeOpacity={0.7} style={styles.leaveBtn}>
                                            <Ionicons name="exit-outline" size={18} color="#6B7280" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

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
                        {/* ── Empty state / Header ── */}
                        {isChannel ? (
                            <View style={styles.workspaceContainer}>
                                <View style={styles.iconStack}>
                                    <Icons.ChannelTabIcon width={54} height={54} />
                                </View>
                                <Text style={styles.workspaceTitle}>Team Chat in #{name}</Text>
                                <Text style={styles.workspaceDescription}>
                                    Group keep your team's conversations{"\n"}
                                    organized by topic.
                                </Text>
                                <TouchableOpacity style={styles.addPeopleChannelBtn} activeOpacity={0.8} onPress={() => setAddPeopleOpen(true)}>
                                    <Text style={styles.addPeopleChannelText}>+ Add people</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
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
                        )}

                        {/* ── Date separator ── */}
                        <View style={styles.dateSeparator}>
                            <View style={styles.dateLine} />
                            <View style={styles.datePill}>
                                <Text style={styles.datePillText}>Today's Discussion</Text>
                                <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
                            </View>
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
                                    {isChannel && (
                                        <TouchableOpacity 
                                            activeOpacity={0.75} 
                                            style={[
                                                styles.inputActionBtn,
                                                styles.postTypeToggle,
                                                postTypeOpen && styles.postTypeToggleActive,
                                            ]}
                                            onPress={() => setPostTypeOpen(!postTypeOpen)}
                                        >
                                            <Text style={[styles.postTypeToggleText, postTypeOpen && styles.postTypeToggleTextActive]}>Post Type</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[styles.sendBtn, message.trim().length > 0 && styles.sendBtnActive]}
                                    activeOpacity={0.85}
                                    onPress={() => { if (message.trim()) setMessage(""); }}
                                >
                                    <Ionicons name="paper-plane" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* ── Post Type (horizontal chips, inside input box) ── */}
                            {postTypeOpen && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.postTypeScroll}
                                    contentContainerStyle={styles.postTypeScrollContent}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {POST_TYPES.map((pt) => (
                                        <TouchableOpacity key={pt.id} style={[styles.postTypeChip, { backgroundColor: pt.bg }]} activeOpacity={0.7}>
                                            <Ionicons name={pt.icon as any} size={14} color={pt.color} style={{ marginRight: 4 }} />
                                            <Text style={[styles.postTypeChipText, { color: pt.color }]}>{pt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <AddPeopleModal
                visible={addPeopleOpen}
                users={MOCK_USERS}
                isChannelMode={true}
                onClose={() => setAddPeopleOpen(false)}
                onSearch={(query) => console.log("Search:", query)}
                onInviteUsers={(users) => {
                    setAddPeopleOpen(false);
                }}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TEAL = "#00DEAB";
const TEXT_PRIMARY = "#1D1D1D";
const TEXT_SECONDARY = "#6B7280";

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },
    safe: { flex: 1 },
    flex: { flex: 1 },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        minHeight: 54,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    backBtn: { marginRight: 2 },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: TEAL,
        justifyContent: "center",
        alignItems: "center",
    },
    headerAvatarText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "SF_Pro_Semibold",
    },
    headerInfo: { flex: 1 },
    headerName: {
        fontSize: 15,
        fontFamily: "SF_Pro_Medium",
        color: TEXT_PRIMARY,
    },
    headerStatus: {
        fontSize: 10,
        fontFamily: "SF_Pro_Regular",
        color: "#8A8A8A",
        marginTop: 1,
    },

    // ── Search (matches headerapp.tsx exactly) ──
    searchRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    searchBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 40,
        gap: 8,
        backgroundColor: "#fff",
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
        fontFamily: "SF_Pro_Regular",
        padding: 0,
    },
    cancelBtn: { paddingHorizontal: 4 },
    cancelText: {
        fontSize: 14,
        fontFamily: "SF_Pro_Medium",
        color: TEAL,
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
        gap: 4,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#fff",
    },
    filterChipActive: {
        backgroundColor: "#1D1D1D",
        borderColor: "#1D1D1D",
    },
    filterChipText: {
        fontSize: 11,
        fontFamily: "SF_Pro_Regular",
        color: "#8A8A8A",
    },
    filterChipTextActive: {
        color: "#fff",
        fontFamily: "SF_Pro_Medium",
    },

    // ── Panel ──
    panelWrapper: {
        // borderBottomWidth: 1,
        // borderBottomColor: "#E5E7EB",
        paddingTop: 4,
    },

    // ── Scroll ──
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 12 },

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
        paddingVertical: 20,
    },
    iconStack: { marginBottom: 14 },
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
    messageWrapper: { width: "100%" },

    // Incoming (received): content right-aligned, avatar on far right
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

    // Outgoing (sent): avatar on far left, bubble left-aligned, white bg
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
        backgroundColor: "#F3F4F6",
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
    actionBtn: { padding: 2 },

    // ── Avatar (in message) ──
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: TEAL,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    avatarText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "SF_Pro_Semibold",
        letterSpacing: 0.3,
    },

    // ── Input Bar ──
    inputBar: {
        backgroundColor: "#fff",
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 24 : 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 6,
        backgroundColor: "#fff",
    },
    inputRow: {
        minHeight: 36,
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
    sendBtnActive: { backgroundColor: TEAL },

    // Channel specific empty state button
    addPeopleChannelBtn: {
        backgroundColor: TEAL,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    addPeopleChannelText: {
        color: "#fff",
        fontFamily: "SF_Pro_Medium",
        fontSize: 13,
    },

    // Post Type Popover & Toggle
    postTypeToggle: {
        width: "auto",
        paddingHorizontal: 12,
        backgroundColor: "#F2F2F2",
    },
    postTypeToggleActive: {
        backgroundColor: "#1D1D1D",
    },
    postTypeToggleText: {
        color: "#1D1D1D",
        fontSize: 12,
        fontFamily: "SF_Pro_Medium",
    },
    postTypeToggleTextActive: {
        color: "#fff",
    },
    // Post Type horizontal chips (inside input)
    postTypeScroll: {
        marginTop: 10,
    },
    postTypeScrollContent: {
        gap: 8,
        paddingHorizontal: 2,
    },
    postTypeChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    postTypeChipText: {
        fontSize: 12,
        fontFamily: "SF_Pro_Medium",
    },

    // Post Type panel (shown when top tab is clicked)
    postTypeListPanel: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    postTypeListRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 5,
        gap: 6,
        width: "48.5%",
    },
    postTypeListLabel: {
        flex: 1,
        fontSize: 11.5,
        fontFamily: "SF_Pro_Medium",
    },
    postTypeListBadge: {
        minWidth: 20,
        alignItems: "center",
    },
    postTypeListBadgeText: {
        fontSize: 11,
        fontFamily: "SF_Pro_Semibold",
    },

    // Chat Member panel
    memberListPanel: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 2,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 7,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#00DEAB",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    memberAvatarText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "SF_Pro_Semibold",
    },
    memberName: {
        flex: 1,
        fontSize: 13,
        fontFamily: "SF_Pro_Regular",
        color: "#1D1D1D",
    },
    youBadge: {
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    youBadgeText: {
        fontSize: 11,
        fontFamily: "SF_Pro_Medium",
        color: "#6B7280",
    },
    leaveBtn: {
        padding: 4,
    },
});
