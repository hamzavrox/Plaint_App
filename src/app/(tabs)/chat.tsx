import Icons from "@/constants/icons";
const { ChatIcon: MainChatIcon, ChannelTabIcon } = Icons;
import AddPeopleModal from "@/components/AddPeopleModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import AppHeader from "@/components/headerapp";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Room, RoomType } from "@/types/chat.types";
import { TaskOwner } from "@/types/task.types";
import {
    getRoomDisplayName,
    getRoomInitials,
    isRoomUnread,
    filterRoomsByType,
    filterUnreadRooms,
    filterReadRooms,
    formatChatListTime,
    getLastMessagePreview,
} from "@/utils/chatHelpers";

// ─── Chip Config ──────────────────────────────────────────────────────────────

const CHIP_DATA = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "read", label: "Read" },
    { id: "channels", label: "Channels" },
    { id: "projects", label: "Projects" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
    const {
        state, fetchRooms, getOrCreateRoom, markRead, searchUsers,
        setSearchQuery, initSocket, cleanupSocket, inviteUser, addMember,
        createProjectWithChannels,
    } = useChat();
    const authState = useAuth();
    const { state: taskState } = useTasks();
    const currentUserId = authState?.state?.user?.id ?? 0;

    const [addPeopleOpen, setAddPeopleOpen] = useState(false);
    const [addPeopleQuery, setAddPeopleQuery] = useState("");
    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [isChannelMode, setIsChannelMode] = useState(false);
    const [activeChip, setActiveChip] = useState("all");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [newChannelName, setNewChannelName] = useState("");
    // Track which project we're adding a channel to (null = standalone channel)
    const [projectContext, setProjectContext] = useState<Room | null>(null);
    // Track expanded projects in the Projects chip view
    const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

    // Fetch rooms on mount
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // Initialize socket when user is available
    useEffect(() => {
        if (currentUserId) {
            initSocket(currentUserId);
        }
        return () => {
            cleanupSocket();
        };
    }, [currentUserId, initSocket, cleanupSocket]);

    // Reset search query when modal closes
    useEffect(() => {
        if (!addPeopleOpen) {
            setAddPeopleQuery("");
        }
    }, [addPeopleOpen]);

    // Build a default list of all company members from existing room members + task owners.
    // The backend requires ≥2 chars to search, so we use local data as the default list.
    const defaultMemberList = useMemo(() => {
        const memberMap = new Map<string, { id: string; name: string; email?: string }>();
        // From all rooms' members
        for (const room of state.rooms ?? []) {
            for (const m of room.members ?? []) {
                if (m.id === currentUserId) continue;
                const key = String(m.id);
                if (!memberMap.has(key)) {
                    const name = `${m.first_name || ""} ${m.last_name || ""}`.trim() || `User #${m.id}`;
                    memberMap.set(key, { id: key, name });
                }
            }
        }
        // From task owners
        for (const owner of (taskState?.taskOwners ?? []) as TaskOwner[]) {
            if (!owner?.id) continue;
            if (owner.id === currentUserId) continue;
            const key = String(owner.id);
            if (!memberMap.has(key)) {
                const name = `${owner.first_name || ""} ${owner.last_name || ""}`.trim() || `User #${owner.id}`;
                memberMap.set(key, { id: key, name, email: owner.email });
            }
        }
        return Array.from(memberMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [state.rooms, taskState?.taskOwners, currentUserId]);

    // Build the user list shown in AddPeopleModal:
    // - When query has ≥2 chars: use API search results (populated by setSearchQuery)
    // - Otherwise: use defaultMemberList built from rooms + task owners
    const addPeopleUsers = useMemo(() => {
        if (addPeopleQuery.trim().length >= 2 && state.searchResults.length > 0) {
            return state.searchResults.map((u) => ({
                id: String(u.id),
                name: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || `User #${u.id}`,
                email: u.email,
            }));
        }
        return defaultMemberList;
    }, [addPeopleQuery, state.searchResults, defaultMemberList]);

    // Compute unread counts per chip
    const chipUnread = useMemo(() => {
        const rooms = state.rooms;
        const hasUnread = (rooms: Room[]) => rooms.some((r) => r.unreadCount > 0 || r.force_unread);
        return {
            all: hasUnread(rooms),
            unread: hasUnread(rooms),
            read: false,
            channels: hasUnread(rooms.filter((r) => r.type === "channel")),
            projects: hasUnread(rooms.filter((r) => r.type === "project")),
        };
    }, [state.rooms]);

    // Categorize rooms based on active chip
    const displayRooms = useMemo(() => {
        const rooms = state.rooms;

        switch (activeChip) {
            case "channels":
                // Show standalone channels (no parent_id) and channels under projects
                return filterRoomsByType(rooms, "channel");
            case "projects":
                return filterRoomsByType(rooms, "project");
            case "unread":
                return filterUnreadRooms(rooms);
            case "read":
                return filterReadRooms(rooms);
            case "all":
            default:
                return rooms;
        }
    }, [state.rooms, activeChip]);

    // Group channels by their parent project for the Projects view
    const projectChannelMap = useMemo(() => {
        const map = new Map<number, Room[]>();
        for (const room of state.rooms) {
            if (room.type === "channel" && room.parent_id) {
                const existing = map.get(room.parent_id) ?? [];
                existing.push(room);
                map.set(room.parent_id, existing);
            }
        }
        return map;
    }, [state.rooms]);

    const toggleProjectExpand = useCallback((projectId: number) => {
        setExpandedProjects((prev) => {
            const next = new Set(prev);
            if (next.has(projectId)) next.delete(projectId);
            else next.add(projectId);
            return next;
        });
    }, []);

    const handleRoomPress = useCallback(
        async (room: Room) => {
            console.log("[Chat] Room pressed:", { id: room.id, _id: room._id, type: room.type, name: room.name });
            setSelectedChatId(room.id.toString());
            if (isRoomUnread(room)) {
                markRead(room._id).catch(() => {});
            }
            router.push({
                pathname: "/conversation",
                params: {
                    roomId: room._id,
                    name: getRoomDisplayName(room, currentUserId),
                    initials: getRoomInitials(room, currentUserId),
                    isChannel: String(room.type === "channel"),
                    roomType: room.type,
                },
            });
        },
        [currentUserId, markRead]
    );

    const handleAddPeopleSelect = useCallback(
        async (user: { id: string; name: string; email?: string }) => {
            setAddPeopleOpen(false);
            try {
                const room = await getOrCreateRoom({
                    type: "direct",
                    targetId: parseInt(user.id, 10),
                });
                router.push({
                    pathname: "/conversation",
                    params: {
                        roomId: room._id,
                        name: getRoomDisplayName(room, currentUserId),
                        initials: getRoomInitials(room, currentUserId),
                        isChannel: "false",
                        roomType: "direct",
                    },
                });
            } catch {
                // Fallback: navigate with user info
                router.push({
                    pathname: "/conversation",
                    params: {
                        name: user.name,
                        initials: user.name.charAt(0).toUpperCase(),
                    },
                });
            }
        },
        [getOrCreateRoom, currentUserId]
    );

    const handleChannelCreate = useCallback(
        async (name: string) => {
            console.log("[Chat] Creating channel:", name);
            setCreateChannelOpen(false);
            setNewChannelName(name);
            setIsChannelMode(true);
            setTimeout(() => setAddPeopleOpen(true), 300);
        },
        []
    );

    const handleInviteUsers = useCallback(
        async (users: Array<{ id: string; name: string; email?: string }>) => {
            console.log("[Chat] handleInviteUsers called:", { channelName: newChannelName, userCount: users.length, projectContext: projectContext?.name });
            setAddPeopleOpen(false);
            setIsChannelMode(false);
            if (newChannelName) {
                try {
                    // Build create room request — if projectContext is set, link as child channel
                    const createRoomReq: { type: "channel"; name: string; parent_id?: number } = {
                        type: "channel",
                        name: newChannelName,
                    };
                    if (projectContext) {
                        createRoomReq.parent_id = projectContext.id;
                    }

                    const room = await getOrCreateRoom(createRoomReq);
                    console.log("[Chat] Channel created:", room.id, room.name);

                    // ── Invite/Add each selected user ──
                    let emailSent = 0;
                    let directAdded = 0;
                    let failed = 0;

                    for (const user of users) {
                        const userId = parseInt(user.id, 10);
                        if (isNaN(userId)) continue;

                        try {
                            if (user.email) {
                                // Has email → send invite via POST /chat/invite (sends email)
                                await inviteUser(room._id, user.email, userId, "Full edit");
                                emailSent++;
                                console.log(`[Chat] Invite email sent to ${user.email}`);
                            } else {
                                // No email → add directly via POST /chat/add-member
                                await addMember(room._id, userId);
                                directAdded++;
                                console.log(`[Chat] Member added directly: ${user.name}`);
                            }
                        } catch (err) {
                            failed++;
                            console.log(`[Chat] Failed to invite/add ${user.name}:`, err);
                        }
                    }

                    // Show feedback
                    const parts: string[] = [];
                    if (emailSent > 0) parts.push(`${emailSent} invite email(s) sent`);
                    if (directAdded > 0) parts.push(`${directAdded} member(s) added`);
                    if (failed > 0) parts.push(`${failed} failed`);
                    if (parts.length > 0) {
                        Alert.alert("Channel Created", `"${room.name}" created.\n${parts.join(", ")}.`);
                    }

                    // Refresh rooms to show updated member lists
                    fetchRooms();

                    // Navigate to the new channel
                    router.push({
                        pathname: "/conversation",
                        params: {
                            roomId: room._id,
                            name: room.name,
                            initials: room.name.charAt(0).toUpperCase(),
                            isChannel: "true",
                            roomType: "channel",
                        },
                    });
                } catch (err) {
                    console.log("[Chat] Channel creation error:", err);
                    Alert.alert("Error", "Failed to create channel. Please try again.");
                }
                setNewChannelName("");
                setProjectContext(null);
            }
        },
        [newChannelName, projectContext, getOrCreateRoom, inviteUser, addMember, fetchRooms]
    );

    // Handler for creating a channel under a specific project
    const handleProjectAddChannel = useCallback(
        (project: Room) => {
            setProjectContext(project);
            setCreateChannelOpen(true);
        },
        []
    );

    if (state.loading && state.rooms.length === 0) {
        return (
            <View style={styles.root}>
                <SafeAreaView style={styles.safe}>
                    <AppHeader
                        greeting="Good morning!"
                        subGreeting="Loading your chats..."
                        initials="..."
                        placeholder="Search Task"
                        showSearch
                    />
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#00DEAB" />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <AppHeader
                    greeting="Good morning!"
                    subGreeting="Let's make today productive!"
                    initials={currentUserId ? String(currentUserId).slice(0, 2) : "U"}
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
                        {CHIP_DATA.map((chip, index) => {
                            const isActive = activeChip === chip.id;
                            const showDot = chipUnread[chip.id as keyof typeof chipUnread] ?? false;
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
                                        {showDot && (
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

                    {displayRooms.length > 0 ? (
                        <View style={styles.chatListContainer}>
                            {activeChip === "projects" ? (
                                /* ── Projects view with expandable child channels ── */
                                displayRooms.map((project) => {
                                    const displayName = getRoomDisplayName(project, currentUserId);
                                    const initials = getRoomInitials(project, currentUserId);
                                    const unread = isRoomUnread(project);
                                    const lastPreview = project.members.length > 0
                                        ? `${project.members.length} member${project.members.length > 1 ? "s" : ""}`
                                        : "No messages yet";
                                    const isExpanded = expandedProjects.has(project.id);
                                    const childChannels = projectChannelMap.get(project.id) ?? [];

                                    return (
                                        <View key={project.id}>
                                            {/* Project row */}
                                            <TouchableOpacity
                                                style={[
                                                    styles.chatRow,
                                                    selectedChatId === project.id.toString() && styles.chatRowSelected,
                                                ]}
                                                activeOpacity={0.7}
                                                onPress={() => handleRoomPress(project)}
                                                onLongPress={() => toggleProjectExpand(project.id)}
                                            >
                                                <View style={styles.avatarContainer}>
                                                    <View style={[styles.avatarBox, { backgroundColor: "#1D1D1D" }]}>
                                                        <Ionicons name="folder-outline" size={18} color="#00DEAB" />
                                                    </View>
                                                    {unread && (
                                                        <View style={styles.onlineIndicator} />
                                                    )}
                                                </View>
                                                <View style={styles.chatInfo}>
                                                    <Text style={styles.chatName} numberOfLines={1}>
                                                        {displayName}
                                                    </Text>
                                                    <Text style={styles.chatSnippet} numberOfLines={1}>
                                                        {lastPreview}{childChannels.length > 0 ? ` · ${childChannels.length} channel${childChannels.length > 1 ? "s" : ""}` : ""}
                                                    </Text>
                                                </View>
                                                <View style={styles.chatMeta}>
                                                    {childChannels.length > 0 && (
                                                        <TouchableOpacity onPress={() => toggleProjectExpand(project.id)} hitSlop={8}>
                                                            <Ionicons
                                                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                                                size={18}
                                                                color="#9CA3AF"
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                                    {unread && project.unreadCount > 0 && (
                                                        <View style={styles.unreadBubble}>
                                                            <Text style={styles.unreadBubbleText}>
                                                                +{project.unreadCount}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>

                                            {/* Child channels (expanded) */}
                                            {isExpanded && childChannels.map((channel) => {
                                                const chName = channel.name;
                                                const chUnread = isRoomUnread(channel);
                                                return (
                                                    <TouchableOpacity
                                                        key={channel.id}
                                                        style={[styles.chatRow, { paddingLeft: 44 }]}
                                                        activeOpacity={0.7}
                                                        onPress={() => handleRoomPress(channel)}
                                                    >
                                                        <View style={styles.avatarContainer}>
                                                            <View style={[styles.avatarBox, { width: 28, height: 28, backgroundColor: "#F4F4F4" }]}>
                                                                <Text style={[styles.avatarText, { fontSize: 12, color: "#1D1D1D" }]}>#</Text>
                                                            </View>
                                                            {chUnread && <View style={styles.onlineIndicator} />}
                                                        </View>
                                                        <View style={styles.chatInfo}>
                                                            <Text style={[styles.chatName, { fontSize: 14 }]} numberOfLines={1}>
                                                                {chName}
                                                            </Text>
                                                        </View>
                                                        {chUnread && channel.unreadCount > 0 && (
                                                            <View style={styles.unreadBubble}>
                                                                <Text style={styles.unreadBubbleText}>+{channel.unreadCount}</Text>
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}

                                            {/* Add channel button under expanded project */}
                                            {isExpanded && (
                                                <TouchableOpacity
                                                    style={[styles.chatRow, { paddingLeft: 44 }]}
                                                    activeOpacity={0.7}
                                                    onPress={() => handleProjectAddChannel(project)}
                                                >
                                                    <View style={[styles.avatarBox, { width: 28, height: 28, backgroundColor: "#F0FDF9" }]}>
                                                        <Ionicons name="add" size={16} color="#00DEAB" />
                                                    </View>
                                                    <Text style={[styles.chatSnippet, { marginLeft: 14, color: "#00DEAB", fontFamily: "SF_Pro_Medium" }]}>Add Channel</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })
                            ) : (
                                displayRooms.map((room) => {
                                    const displayName = getRoomDisplayName(room, currentUserId);
                                    const initials = getRoomInitials(room, currentUserId);
                                    const unread = isRoomUnread(room);
                                    const lastPreview = room.members.length > 0
                                        ? `${room.members.length} member${room.members.length > 1 ? "s" : ""}`
                                        : "No messages yet";

                                    return (
                                        <TouchableOpacity
                                            key={room.id}
                                            style={[
                                                styles.chatRow,
                                                selectedChatId === room.id.toString() && styles.chatRowSelected,
                                            ]}
                                            activeOpacity={0.7}
                                            onPress={() => handleRoomPress(room)}
                                        >
                                            <View style={styles.avatarContainer}>
                                                <View style={styles.avatarBox}>
                                                    <Text style={styles.avatarText}>{initials}</Text>
                                                </View>
                                                {unread && (
                                                    <View style={styles.onlineIndicator} />
                                                )}
                                            </View>
                                            <View style={styles.chatInfo}>
                                                <Text style={styles.chatName} numberOfLines={1}>
                                                    {displayName}
                                                </Text>
                                                <Text style={styles.chatSnippet} numberOfLines={1}>
                                                    {lastPreview}
                                                </Text>
                                            </View>
                                            <View style={styles.chatMeta}>
                                                {unread && room.unreadCount > 0 && (
                                                    <View style={styles.unreadBubble}>
                                                        <Text style={styles.unreadBubbleText}>
                                                            +{room.unreadCount}
                                                        </Text>
                                                    </View>
                                                )}
                                                <Text style={styles.chatTime}>
                                                    {room.my_visible_from
                                                        ? formatChatListTime(room.my_visible_from)
                                                        : ""}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
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
                                onPress={() => {
                                    setProjectContext(null);
                                    setCreateChannelOpen(true);
                                }}
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
                {displayRooms.length > 0 && (
                    <TouchableOpacity 
                        style={styles.fab} 
                        activeOpacity={0.8}  
                        onPress={() => {
                            if (activeChip === "channels" || activeChip === "projects") {
                                setProjectContext(null);
                                setCreateChannelOpen(true);
                            } else {
                                setIsChannelMode(false);
                                setAddPeopleOpen(true);
                            }
                        }}
                    >
                        <MaterialCommunityIcons 
                            name={activeChip === "channels" || activeChip === "projects" ? "account-multiple-plus" : "message-plus"} 
                            size={24} 
                            color="#000" 
                        />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <AddPeopleModal
                visible={addPeopleOpen}
                users={addPeopleUsers}
                isChannelMode={isChannelMode}
                onClose={() => {
                    setAddPeopleOpen(false);
                    setIsChannelMode(false);
                }}
                onSearch={(query) => {
                    setAddPeopleQuery(query);
                    // Only hit the API when the user has typed 2+ chars
                    if (query.trim().length >= 2) {
                        setSearchQuery(query);
                    }
                }}
                onSelectUser={handleAddPeopleSelect}
                onInviteUsers={handleInviteUsers}
            />

            <CreateChannelModal
                visible={createChannelOpen}
                onClose={() => {
                    setCreateChannelOpen(false);
                    setProjectContext(null);
                }}
                onNext={handleChannelCreate}
                title={projectContext ? `Add Channel to "${projectContext.name}"` : "Create Channel"}
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
        paddingBottom: 80,
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
    unreadDotActive: {
        borderColor: "#1D1D1D",
    },

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
    },
});
