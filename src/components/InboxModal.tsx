import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface NotificationItem {
    id: string;
    initials: string;
    name: string;
    message: string;
    time: string;
    unread: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: "1",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "5 hours ago",
        unread: true,
    },
    {
        id: "2",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "1 day ago",
        unread: true,
    },
    {
        id: "3",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "4 days ago",
        unread: true,
    },
    {
        id: "4",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "5 days ago",
        unread: true,
    },
    {
        id: "5",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "6 days ago",
        unread: true,
    },
    {
        id: "6",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "7 days ago",
        unread: true,
    },
    {
        id: "7",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "7 days ago",
        unread: true,
    },
    {
        id: "8",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "7 days ago",
        unread: true,
    },
    {
        id: "9",
        initials: "MZ",
        name: "Muhammad Zanaen Ullah",
        message: "Recurring task auto-generated",
        time: "7 days ago",
        unread: true,
    },
];

interface InboxModalProps {
    visible: boolean;
    onClose: () => void;
}

type TabType = "all" | "unread" | "mentions";

export default function InboxModal({ visible, onClose }: InboxModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [notifications, setNotifications] = useState<NotificationItem[]>(
        MOCK_NOTIFICATIONS
    );

    const handleMarkAllRead = () => {
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, unread: false }))
        );
    };

    // Calculate unread count
    const unreadCount = notifications.filter((item) => item.unread).length;

    // Filter items based on active tab
    const filteredNotifications = notifications.filter((item) => {
        if (activeTab === "unread") return item.unread;
        // Mocking mentions as empty or subset (e.g. no items for now)
        if (activeTab === "mentions") return false;
        return true;
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* Backdrop sibling to handle tap outside */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Popup Card */}
                <View style={styles.popup}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Inbox</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={handleMarkAllRead}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.markReadText}>
                                    Mark all read
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.viewAllText}>View all</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === "all" && styles.activeTabButton,
                            ]}
                            onPress={() => setActiveTab("all")}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "all" && styles.activeTabText,
                                ]}
                            >
                                All
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === "unread" && styles.activeTabButton,
                            ]}
                            onPress={() => setActiveTab("unread")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.unreadTabContent}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === "unread" &&
                                        styles.activeTabText,
                                    ]}
                                >
                                    Unread
                                </Text>
                                {unreadCount > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadBadgeText}>
                                            {unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === "mentions" && styles.activeTabButton,
                            ]}
                            onPress={() => setActiveTab("mentions")}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "mentions" &&
                                    styles.activeTabText,
                                ]}
                            >
                                Mentions
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Notification List */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.listScroll}
                        contentContainerStyle={styles.listContent}
                    >
                        {filteredNotifications.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    No notifications found.
                                </Text>
                            </View>
                        ) : (
                            filteredNotifications.map((item) => (
                                <View key={item.id} style={styles.notificationRow}>
                                    {/* Unread dot */}
                                    <View style={styles.dotCol}>
                                        {item.unread && (
                                            <View style={styles.unreadDot} />
                                        )}
                                    </View>

                                    {/* Avatar */}
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {item.initials}
                                        </Text>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.infoCol}>
                                        <Text
                                            style={styles.messageText}
                                            numberOfLines={2}
                                        >
                                            <Text style={styles.senderName}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.messageBody}>
                                                {" "}{item.message}
                                            </Text>
                                        </Text>

                                        {/* Time */}
                                        <View style={styles.timeRow}>
                                            <Ionicons
                                                name="time-outline"
                                                size={12}
                                                color="#8E8E93"
                                                style={styles.timeIcon}
                                            />
                                            <Text style={styles.timeText}>
                                                {item.time}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.15)",
    },
    popup: {
        width: "95%",
        backgroundColor: "#fff",
        borderRadius: 14,
        marginTop: 100, // Positioned below header right-hand icons
        // marginRight: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        maxHeight: 420,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    title: {
        fontSize: 18,
        fontFamily: "SF_Pro_Medium",
        color: "#1C1C1E",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    markReadText: {
        fontSize: 13,
        fontFamily: "SF_Pro_Semibold",
        color: "#556EE6",
        marginRight: 12,
    },
    viewAllText: {
        fontSize: 13,
        fontFamily: "SF_Pro_Semibold",
        color: "#00DEAB",
    },
    tabsContainer: {
        flexDirection: "row",
        // justifyContent: "space-around",
        borderBottomWidth: 1,
       
        borderBottomColor: "#E5E5EA",
        marginBottom: 5,
        // gap: 16,
    },
    tabButton: {
        minWidth: "33%",
        // backgroundColor: '#dc6b6bff',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
        marginBottom: -1,
    },
    activeTabButton: {
        borderBottomColor: "#00DEAB",
        borderRadius: 10
    },
    tabText: {
        fontSize: 13,
        textAlign: "center",
        fontFamily: "SF_Pro_Medium",
        color: "#8E8E93",
    },
    activeTabText: {
        color: "#1C1C1E",
        fontFamily: "SF_Pro_Semibold",
    },
    unreadTabContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    unreadBadge: {
        backgroundColor: "#00DEAB",
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        marginLeft: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    unreadBadgeText: {
        color: "#fff",
        fontSize: 9,
        fontFamily: "SF_Pro_Bold",
    },
    listScroll: {
        maxHeight: 250,
    },
    // listContent: {
    //     paddingBottom: 8,
    // },
    emptyContainer: {
        paddingVertical: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 13,
        color: "#8E8E93",
        fontFamily: "SF_Pro_Medium",
    },
    notificationRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 9,
        // borderBottomWidth: 1,
        // borderBottomColor: "#F2F2F7",
    },
    dotCol: {
        width: 14,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    unreadDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#00DEAB",
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 3,
        backgroundColor: "#00DEAB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 8,
        fontFamily: "SF_Pro_Bold",
    },
    infoCol: {
        flex: 1,
        marginLeft: 5,
    },
    messageText: {
        fontSize: 9.5,
        lineHeight: 10,
    },
    senderName: {
        fontFamily: "SF_Pro_Semibold",
        color: "#1C1C1E",
    },
    messageBody: {
        fontFamily: "SF_Pro_Regular",
        color: "#48484A",
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 3,
    },
    timeIcon: {
        marginRight: 3,
    },
    timeText: {
        fontSize: 11,
        fontFamily: "SF_Pro_Regular",
        color: "#8E8E93",
    },
});
