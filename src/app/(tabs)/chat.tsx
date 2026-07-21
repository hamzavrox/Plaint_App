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
    { id: "projects", label: "Projects", hasUnread: true },
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

const CHANNELS_DATA: ChatUser[] = [
    { id: "c1", name: "SEO Channel", email: "", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread" },
    { id: "c2", name: "Design Channel", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c3", name: "Dev Channel", email: "", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread" },
    { id: "c4", name: "Sales Channel", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c5", name: "Technical Channel", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c6", name: "Websouls Wins Board", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c7", name: "Planit Internal", email: "", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread" },
    { id: "c8", name: "Planit Dev", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c9", name: "Planit Design", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c10", name: "Websouls Web Design and Dev", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c11", name: "Websouls Internal Discussion", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
    { id: "c12", name: "IGI Insurance", email: "", message: "Hi, How are you?", time: "12:50pm", status: "read" },
];

interface ProjectData {
    id: string;
    name: string;
    message: string;
    time: string;
    unreadCount?: number;
    status: "read" | "unread";
    expanded?: boolean;
    channels: string[];
}

const INITIAL_PROJECTS: ProjectData[] = [
    { id: "p1", name: "SEO Group", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread", expanded: false, channels: ["General", "Discussion"] },
    { id: "p2", name: "Design Group", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
    { id: "p3", name: "Dev Group", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread", expanded: false, channels: ["General", "Discussion"] },
    { id: "p4", name: "Sales Group", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
    { id: "p5", name: "Technical Team", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
    { id: "p6", name: "Websouls", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
    { id: "p7", name: "Planit Internal", message: "Hi, How are you?", time: "12:50pm", unreadCount: 5, status: "unread", expanded: false, channels: ["General", "Discussion"] },
    { id: "p8", name: "Planit Dev", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
    { id: "p9", name: "Planit Design", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
    { id: "p10", name: "Websouls Web Design and Dev", message: "Hi, How are you?", time: "12:50pm", status: "read", expanded: false, channels: ["General", "Discussion"] },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ChatScreen() {
    const [addPeopleOpen, setAddPeopleOpen] = useState(false);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [isChannelMode, setIsChannelMode] = useState(false);
    const [activeChip, setActiveChip] = useState("all");

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [chats, setChats] = useState<ChatUser[]>(ALL_USERS);
    const [channels, setChannels] = useState<ChatUser[]>(CHANNELS_DATA);
    const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);
    const [newChannelName, setNewChannelName] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [activeProjectIdForGroup, setActiveProjectIdForGroup] = useState<string | null>(null);

    const filteredChats = chats.filter((chat) => {
        if (activeChip === "all" || activeChip === "channels" || activeChip === "groups" || activeChip === "projects") return true;
        if (activeChip === "unread") return chat.status === "unread";
        if (activeChip === "read") return chat.status === "read";
        return true;
    });

    const displayList = activeChip === "channels" ? channels : filteredChats;

    const markAsRead = (id: string) => {
        if (activeChip === "channels") {
            setChannels((prev) =>
                prev.map((chat) =>
                    chat.id === id ? { ...chat, status: "read", unreadCount: undefined } : chat
                )
            );
        } else {
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === id ? { ...chat, status: "read", unreadCount: undefined } : chat
                )
            );
        }
    };

    const toggleProjectExpand = (id: string) => {
        setProjects((prev) =>
            prev.map((proj) =>
                proj.id === id ? { ...proj, expanded: !proj.expanded } : proj
            )
        );
    };

    const handleAddGroupPress = (projectId: string) => {
        setActiveProjectIdForGroup(projectId);
        setCreateGroupOpen(true);
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

                    {activeChip === "projects" ? (
                        <View style={styles.chatListContainer}>
                            {projects.map((project) => (
                                <View key={project.id}>
                                    <TouchableOpacity
                                        style={[styles.chatRow, selectedChatId === project.id && styles.chatRowSelected]}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setSelectedChatId(project.id);
                                            toggleProjectExpand(project.id);
                                        }}
                                    >
                                        <View style={styles.avatarContainer}>
                                            <View style={styles.avatarBox}>
                                                <Text style={styles.avatarText}>{project.name.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            {project.status === "unread" && (
                                                <View style={styles.onlineIndicator} />
                                            )}
                                        </View>
                                        <View style={styles.chatInfo}>
                                            <Text style={styles.chatName}>{project.name}</Text>
                                            <Text style={styles.chatSnippet} numberOfLines={1}>{project.message}</Text>
                                        </View>
                                        <View style={styles.chatMeta}>
                                            {project.unreadCount && project.status === "unread" && (
                                                <View style={styles.unreadBubble}>
                                                    <Text style={styles.unreadBubbleText}>+{project.unreadCount}</Text>
                                                </View>
                                            )}
                                            <Text style={styles.chatTime}>{project.time}</Text>
                                            
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 6 }}>
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    style={{ padding: 4 }}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleAddGroupPress(project.id);
                                                    }}
                                                >
                                                    <Ionicons name="add" size={20} color="#1D1D1D" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    style={{ padding: 4 }}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        toggleProjectExpand(project.id);
                                                    }}
                                                >
                                                    <Ionicons 
                                                        name={project.expanded ? "chevron-up" : "chevron-down"} 
                                                        size={20} 
                                                        color="#1D1D1D" 
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {project.expanded && (
                                        <View style={styles.channelsContainer}>
                                            {project.channels.map((channel, cIdx) => (
                                                <TouchableOpacity
                                                    key={cIdx}
                                                    style={styles.channelRow}
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        router.push({
                                                            pathname: "/conversation",
                                                            params: {
                                                                name: channel,
                                                                initials: channel.charAt(0).toUpperCase(),
                                                                isChannel: "true",
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <View style={styles.subAvatarContainer}>
                                                        <View style={styles.subAvatarBox}>
                                                            <Text style={styles.subAvatarText}>{channel.charAt(0).toUpperCase()}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.channelInfo}>
                                                        <Text style={styles.channelName}>{channel}</Text>
                                                        <Text style={styles.channelSnippet}>Hi, How are you?</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : displayList.length > 0 ? (
                        <View style={styles.chatListContainer}>
                            {displayList.map((chat, index) => (
                                <TouchableOpacity
                                    key={chat.id}
                                    style={[styles.chatRow, selectedChatId === chat.id && styles.chatRowSelected]}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setSelectedChatId(chat.id);
                                        if (chat.status === "unread") markAsRead(chat.id);
                                        router.push({
                                            pathname: "/conversation",
                                            params: {
                                                name: chat.name,
                                                initials: chat.name.charAt(0).toUpperCase(),
                                                isChannel: String(activeChip === "channels"),
                                            },
                                        });
                                    }}
                                >
                                    <View style={styles.avatarContainer}>
                                        <View style={styles.avatarBox}>
                                            <Text style={styles.avatarText}>{chat.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        {activeChip !== "channels" && chat.status === "unread" && (
                                            <View style={styles.onlineIndicator} />
                                        )}
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
                    ) : activeChip === "channels" ? (
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
                {displayList.length > 0 && activeChip !== "projects" && (
                    <TouchableOpacity 
                        style={styles.fab} 
                        activeOpacity={0.8}  
                        onPress={() => {
                            if (activeChip === "channels") {
                                setCreateChannelOpen(true);
                            } else {
                                setIsChannelMode(false);
                                setAddPeopleOpen(true);
                            }
                        }}
                    >
                        <MaterialCommunityIcons 
                            name={activeChip === "channels" ? "account-multiple-plus" : "message-plus"} 
                            size={24} 
                            color="#000" 
                        />
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
                    setActiveProjectIdForGroup(null);
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
                    if (activeProjectIdForGroup && newGroupName) {
                        setProjects((prev) =>
                            prev.map((proj) => {
                                if (proj.id === activeProjectIdForGroup) {
                                    return {
                                        ...proj,
                                        expanded: true,
                                        channels: [...proj.channels, newGroupName],
                                    };
                                }
                                return proj;
                            })
                        );
                        setNewGroupName("");
                        setActiveProjectIdForGroup(null);
                    } else if (newChannelName) {
                        setChannels(prev => [{
                            id: "c" + Date.now(),
                            name: newChannelName,
                            email: "",
                            message: "Just created",
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
                            status: "read",
                        }, ...prev]);
                        setNewChannelName("");
                        setActiveChip("channels"); // switch to channels tab if not already
                    }
                }}
            />

            <CreateChannelModal
                visible={createChannelOpen}
                onClose={() => setCreateChannelOpen(false)}
                onNext={(name) => {
                    setNewChannelName(name);
                    setCreateChannelOpen(false);
                    setIsChannelMode(true);
                    setTimeout(() => setAddPeopleOpen(true), 300); // small delay for modal transition
                }}
            />

            <CreateChannelModal
                visible={createGroupOpen}
                title="Create Group"
                placeholder="Write your group name"
                onClose={() => {
                    setCreateGroupOpen(false);
                    setActiveProjectIdForGroup(null);
                }}
                onNext={(name) => {
                    setNewGroupName(name);
                    setCreateGroupOpen(false);
                    setIsChannelMode(true);
                    setTimeout(() => setAddPeopleOpen(true), 300);
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
    channelsContainer: {
        backgroundColor: "#FCFCFC",
        borderBottomWidth: 1,
        borderBottomColor: "#F4F4F4",
    },
    channelRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 56,
        paddingVertical: 10,
    },
    channelName: {
        fontSize: 15,
        fontFamily: "SF_Pro_Semibold",
        color: "#1D1D1D",
    },
    subAvatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    subAvatarBox: {
        width: 36,
        height: 36,
        borderRadius: 5,
        backgroundColor: "#00DEAB",
        alignItems: "center",
        justifyContent: "center",
    },
    subAvatarText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "SF_Pro_Medium",
    },
    channelInfo: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
    },
    channelSnippet: {
        fontSize: 13,
        fontFamily: "SF_Pro_Regular",
        color: "#4B5563",
    },
});
