import Icons from "@/constants/icons";
const { ChatIcon: MainChatIcon, ChannelTabIcon } = Icons;
import AddPeopleModal, { AddPeopleUser } from "@/components/AddPeopleModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import AppHeader from "@/components/headerapp";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
const CHIP_DATA = [
    { id: "all", label: "All", hasUnread: true },
    { id: "unread", label: "Unread", hasUnread: true },
    { id: "read", label: "Read", hasUnread: false },
    { id: "channels", label: "Channels", hasUnread: true },
    { id: "Project", label: "Project", hasUnread: true },
];

type ChatUser = AddPeopleUser & {
    message: string;
    time: string;
    unreadCount?: number;
    status: "read" | "unread";
};

const ALL_USERS: ChatUser[] = [
    { id: "1", name: "Muhammad Salman", email: "salman@email.com", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread" },
    { id: "2", name: "Muhammad Haris", email: "haris@email.com", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "3", name: "Najam Ali", email: "najam@email.com", message: "Hi, How are you?", time: "12:50pm", status: "unread" },
    { id: "4", name: "Junaid", email: "junaid@email.com", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "5", name: "Awais", email: "awais@email.com", message: "Hi, How are you?", time: "12:50pm", status: "unread" },
    { id: "6", name: "Nida Mumtaz", email: "nida@email.com", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "7", name: "Wahab Ahmad", email: "wahab@email.com", message: "Hi, How are you?", time: "12:50pm", status: "unread" },
    { id: "8", name: "Maryam", email: "maryam@email.com", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "9", name: "Anum", email: "anum@email.com", message: "Hi, How are you?", time: "12:50pm", status: "unread" },
    { id: "10", name: "Waqas", email: "waqas@email.com", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "11", name: "Shahid", email: "shahid@email.com", message: "Hi, How are you?", time: "12:50pm", status: "unread" },
    { id: "12", name: "Zahid", email: "zahid@email.com", message: "Hi, How are you?", time: "12:50pm", status: "read" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ChatScreen() {
    const [addPeopleOpen, setAddPeopleOpen] = useState(false);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [isChannelMode, setIsChannelMode] = useState(false);
    const [activeChip, setActiveChip] = useState("all");

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [chats, setChats] = useState<ChatUser[]>(ALL_USERS);

    const filteredChats = chats.filter((chat) => {
        if (activeChip === "all" || activeChip === "channels" || activeChip === "groups") return true;
        if (activeChip === "unread") return chat.status === "unread";
        if (activeChip === "read") return chat.status === "read";
        return true;
    });

    const markAsRead = (id: string) => {
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === id ? { ...chat, status: "read", unreadCount: undefined } : chat
            )
        );
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <AppHeader
                    greeting="Good morning, Junaid!"
                    subGreeting="Let's make today productive!"
                    initials="JD"
                    placeholder="Search Task"
                    showSearch
                />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Category Chips ── */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.chipsContainer}
                    >
                        {CHIP_DATA.map((chip,index) => {
                            const isActive = activeChip === chip.id;
                            return (
                                // <TouchableOpacity
                                //     key={chip.id}
                                //     style={[styles.chipButton, isActive && styles.chipButtonActive]}
                                //     activeOpacity={0.8}
                                //     onPress={() => setActiveChip(chip.id)}
                                // >
                                //     <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                //         {chip.label}
                                //     </Text>
                                //     {chip.hasUnread && (
                                //         <View style={[styles.unreadDot, isActive && styles.unreadDotActive]} />
                                //     )}
                                // </TouchableOpacity>
    <View
      key={chip.id}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <TouchableOpacity
        style={[
          styles.chipButton,
          isActive && styles.chipButtonActive,
        ]}
        onPress={() => setActiveChip(chip.id)}
      >
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                        {chip.label}
                                    </Text>
                                    {chip.hasUnread && (
                                        <View style={[styles.unreadDot, isActive && styles.unreadDotActive]} />
                                    )}
      </TouchableOpacity>

      {index === 2 && (
        <View style={styles.verticalDivider} />
      )}
    </View>
                            );
                        })}
                    </ScrollView>

                    {activeChip === "channels" ? (
                        <View style={styles.workspaceContainer}>
                            <View style={styles.iconStack}>
                                <ChannelTabIcon width={60} height={60} />
                            </View>

                            <Text style={styles.workspaceTitle}>Create a channel</Text>
                            <Text style={styles.workspaceDescription}>
                                Group keep your team's conversations{"\n"}organized by topic.
                            </Text>

                            <TouchableOpacity
                                style={styles.addPeopleButton}
                                activeOpacity={0.85}
                                onPress={() => setCreateChannelOpen(true)}
                            >
                                <Text style={styles.addPeopleText}>+ Create Channel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredChats.length > 0 ? (
                        <View style={styles.chatListContainer}>
                            {filteredChats.map((chat, index) => (
                                <TouchableOpacity
                                    key={chat.id}
                                    style={[styles.chatRow,  selectedChatId === chat.id && styles.chatRowSelected,]}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setSelectedChatId(chat.id);
                                        if (chat.status === "unread") markAsRead(chat.id);
                                        router.push({
                                            pathname: "/conversation",
                                            params: {
                                                name: chat.name,
                                                initials: chat.name.charAt(0).toUpperCase(),
                                            },
                                        });
                                    }}
                                >
                                    <View style={styles.avatarContainer}>
                                        <View style={styles.avatarBox}>
                                            <Text style={styles.avatarText}>{chat.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        {chat.status === "unread" && <View style={styles.onlineIndicator} />}
                                    </View>
                                    <View style={styles.chatInfo}>
                                        <Text style={styles.chatName}>{chat.name}</Text>
                                        <Text style={styles.chatSnippet} numberOfLines={1}>{chat.message}</Text>
                                    </View>
                                    <View style={styles.chatMeta}>
                                        {chat.unreadCount && chat.status === "unread" && (
                                            <View style={styles.unreadBubble}>
                                                <Text style={styles.unreadBubbleText}>+{chat.unreadCount}</Text>
                                            </View>
                                        )}
                                        <Text style={styles.chatTime}>{chat.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.workspaceContainer}>
                            <View style={styles.iconStack}>
                                <MainChatIcon />
                            </View>

                            <Text style={styles.workspaceTitle}>Private workspace</Text>
                            <Text style={styles.workspaceDescription}>
                                A place just for you to capture ideas, draft messages,
                                and keep everything organized for later.
                            </Text>

                            <TouchableOpacity
                                style={styles.addPeopleButton}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setIsChannelMode(false);
                                    setAddPeopleOpen(true);
                                }}
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
                    )}
                </ScrollView>
                
                {/* FAB */}
                {chats.length > 0 && activeChip !== "channels" && (
                    <TouchableOpacity style={styles.fab} activeOpacity={0.8}  onPress={() => {
                        setIsChannelMode(false);
                        setAddPeopleOpen(true);
                    }}>
                        <MaterialCommunityIcons name="message-plus" size={24} color="#000" />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <AddPeopleModal
                visible={addPeopleOpen}
                users={ALL_USERS}
                isChannelMode={isChannelMode}
                onClose={() => {
                    setAddPeopleOpen(false);
                    setIsChannelMode(false);
                }}
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
                onInviteUsers={(users) => {
                    setAddPeopleOpen(false);
                    setIsChannelMode(false);
                    console.log("Invited to channel:", users);
                    // Add channel creation logic here
                }}
            />

            <CreateChannelModal
                visible={createChannelOpen}
                onClose={() => setCreateChannelOpen(false)}
                onNext={(name) => {
                    setCreateChannelOpen(false);
                    setIsChannelMode(true);
                    setTimeout(() => setAddPeopleOpen(true), 300); // small delay for modal transition
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
        paddingBottom: 80, // Extra padding for FAB
    },

    // ── Chips ──
    chipsContainer: {
        paddingHorizontal: 16,
        gap: 5,
        marginBottom: 16,
    },
    chipButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4F4F4",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        position: "relative",
    },
    chipButtonActive: {
        backgroundColor: "#1D1D1D",
    },
    chipText: {
        fontSize: 12,
        fontFamily: "SF_Pro_Semibold",
        color: "#1D1D1D",
    },
    chipTextActive: {
        color: "#fff",
    },
verticalDivider: {
  width: 1.5,
  height: 33,
  backgroundColor: "#F4F4F4",
//   marginHorizontal: 12,
 marginLeft: 7,
 marginRight: 3,
},
    unreadDot: {
        position: "absolute",
        top: -1,
        right: -3,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#00DEAB",
        borderWidth: 1.5,
        borderColor: "#fff",
    },
    // unreadDotActive: {
    //     borderColor: "#1D1D1D",
    // },

    // ── Chat List ──
    chatListContainer: {
        flex: 1,
    },
    chatRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    // chatRowFirst: {
    //     backgroundColor: "#F4F4F4", // Light gray background for first item as shown in design
    // },
    chatRowSelected: {
    backgroundColor: "#F4F4F4",
    marginHorizontal: 3,
},
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatarBox: {
        width: 36,
        height: 36,
        borderRadius: 5,
        backgroundColor: "#00DEAB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "SF_Pro_Medium",
    },
    onlineIndicator: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#00DEAB",
        borderWidth: 1.5,
        borderColor: "#fff",
    },
    chatInfo: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
    },
    chatName: {
        fontSize: 15,
        fontFamily: "SF_Pro_Semibold",
        color: "#1D1D1D",
    },
    chatSnippet: {
        fontSize: 13,
        fontFamily: "SF_Pro_Regular",
        color: "#4B5563",
    },
    chatMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    minWidth: 80,
},
    chatTime: {
        fontSize: 11,
        fontFamily: "SF_Pro_Medium",
        color: "#9CA3AF",
    },
    unreadBubble: {
        backgroundColor: "#1D1D1D",
        borderRadius: 15,
        paddingHorizontal: 6,
        paddingVertical: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    unreadBubbleText: {
        color: "#0DDFAB",
        fontSize: 10,
        fontFamily: "SF_Pro_Semibold",
    },

    // ── Empty state ──
    workspaceContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
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

    // ── FAB ──
    fab: {
        position: "absolute",
        bottom: 100,
        right: 24,  
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#00DEAB",
        alignItems: "center",
        justifyContent: "center",
        // shadowColor: "#00DEAB",
        // shadowOpacity: 0.3,
        // shadowRadius: 8,
        // shadowOffset: { width: 0, height: 4 },
        // elevation: 6,
    },
});
