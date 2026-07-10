import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusType, STATUS_COLORS } from "./TaskRow";

export type SubTask = { title: string; createdBy: string; dueDate: string };

export type TaskDetail = {
  title: string;
  assignedTo: string;
  assignedToInitials: string;
  dueDate: string;
  priority: string;
  priorityColor: string;
  approvalRequired: string;
  status: StatusType;
  recurringTask: string;
  subtasks: SubTask[];
  dependencies: SubTask[];
  description: string;
  attachments: string[];
  subtaskCount?: number;
};

type Comment = {
  id: number;
  initials: string;
  name: string;
  time: string;
  text: string;
  pinned?: boolean;
  isOwn?: boolean;
};

type Props = { visible: boolean; onClose: () => void; task: TaskDetail | null };

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Urgent: { bg: "#CB5F00", text: "#fff" },
  High:   { bg: "#EF4444", text: "#fff" },
  Medium: { bg: "#F59E0B", text: "#fff" },
  Low:    { bg: "#10B981", text: "#fff" },
};

const MOCK_COMMENTS: Comment[] = [
  { id: 1, initials: "MJ", name: "Muhammad Junaid", time: "25, April, 2026 | 10:00AM", text: "Lorem Ipsum is simply dummy text of the printing and typesetting...", pinned: true },
  { id: 2, initials: "MH", name: "Muhammad Haris",  time: "25, April, 2026 | 10:00AM", text: "Lorem Ipsum is simply dummy text of the printing and typesetting..." },
  { id: 3, initials: "MJ", name: "Muhammad Junaid", time: "25, April, 2026 | 10:00AM", text: "Lorem Ipsum is simply dummy text of the printing and typesetting...", isOwn: true },
];

// ── Subtask / Dependencies table — same style as TaskTable ──────────────────
const COL = { title: 160, createdBy: 130, dueDate: 110 };

function SectionTable({ title, rows, showAdd }: { title: string; rows: SubTask[]; showAdd?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
        <View>
          {/* Header */}
          <View style={styles.tblHeader}>
            <View style={{ width: 14 }} />
            <Text style={[styles.tblHeadCell, { width: COL.title }]}>Task Title</Text>
            <Text style={[styles.tblHeadCell, { width: COL.createdBy }]}>Created By</Text>
            <Text style={[styles.tblHeadCell, { width: COL.dueDate }]}>Due Date</Text>
          </View>
          {/* Rows */}
          {rows.map((row, i) => (
            <View key={i} style={styles.tblRow}>
              <View style={styles.tblAccent} />
              <Text style={[styles.tblCell, { width: COL.title }]} numberOfLines={1}>{row.title}</Text>
              <View style={[styles.tblCreatedBy, { width: COL.createdBy }]}>
                <View style={styles.tblAvatar} />
                <Text style={styles.tblCell}>{row.createdBy}</Text>
              </View>
              <View style={[styles.tblDueDate, { width: COL.dueDate }]}>
                <Ionicons name="calendar-outline" size={14} color="#00DEAB" style={{ marginRight: 4 }} />
                <Text style={styles.tblCell}>{row.dueDate}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {showAdd && (
        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.addRowText}>Touch the add for create a subtask</Text>
        </View>
      )}
    </View>
  );
}

// ── Comment bubble ───────────────────────────────────────────────────────────
function CommentBubble({ comment }: { comment: Comment }) {
  return (
    <View style={[
      styles.bubble,
      comment.pinned && styles.bubblePinned,
      comment.isOwn  && styles.bubbleOwn,
    ]}>
      <View style={styles.bubbleHeader}>
        <View style={styles.bubbleAvatar}>
          <Text style={styles.bubbleAvatarText}>{comment.initials}</Text>
        </View>
        <View style={styles.bubbleNameRow}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1 }}>
            <Text style={styles.bubbleName}>{comment.name}</Text>
            <Text style={styles.bubbleTime}>  {comment.time}</Text>
          </Text>
        </View>
        {comment.pinned && (
          <MaterialCommunityIcons name="pin" size={16} color="#00DEAB" style={styles.pinIcon} />
        )}
      </View>
      <Text style={styles.bubbleText}>{comment.text}</Text>
      {(!comment.pinned || comment.isOwn) && (
        <View style={styles.bubbleActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="thumbs-up-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="emoticon-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          {comment.isOwn && (
            <>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialCommunityIcons name="pin-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialCommunityIcons name="reply-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function TaskDetailModal({ visible, onClose, task }: Props) {
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");
  const [commentText, setCommentText] = useState("");
  const [focused, setFocused] = useState(false);

  const floated = focused || !!commentText;
  const labelAnim = useRef(new Animated.Value(floated ? 1 : 0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!commentText) {
      Animated.timing(labelAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -9],
  });
  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [13, 11],
  });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#C0C0C0", "#1D1D1D"],
  });

  if (!task) return null;

  const statusStyle   = STATUS_COLORS[task.status];
  const priorityStyle = PRIORITY_COLORS[task.priority] ?? { bg: "#E5E7EB", text: "#374151" };

  const INFO_ROWS = [
    {
      icon: "people-outline", label: "Assigned to:",
      value: (
        <View style={styles.assignedRow}>
          <View style={styles.initials}><Text style={styles.initialsText}>{task.assignedToInitials}</Text></View>
          <Text style={styles.infoValue}>{task.assignedTo}</Text>
        </View>
      ),
    },
    { icon: "calendar-outline", label: "Due Date:", value: <Text style={styles.infoValue}>{task.dueDate}</Text> },
    {
      icon: "star-outline", label: "Priority:",
      value: <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}><Text style={[styles.badgeText, { color: priorityStyle.text }]}>{task.priority}</Text></View>,
    },
    { icon: "checkmark-done-outline", label: "Approval Required:", value: <Text style={styles.infoValue}>{task.approvalRequired}</Text> },
    {
      icon: "sync-circle-outline", label: "Task Status:",
      value: <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}><Text style={[styles.badgeText, { color: statusStyle.text }]}>{task.status}</Text></View>,
    },
    { icon: "camera-outline", label: "Recurring Task:", value: <Text style={styles.infoValue}>{task.recurringTask}</Text> },
    {
      icon: "git-branch-outline", label: "Subtask:",
      value: task.subtasks.length > 0
        ? <View style={styles.cntBadgeGray}><MaterialCommunityIcons name="file-tree-outline" size={14} color="#fff" /><Text style={styles.cntBadgeText}>+{task.subtasks.length}</Text></View>
        : <Text style={styles.infoValue}>—</Text>,
    },
    {
      icon: "git-compare-outline", label: "Dependencies:",
      value: task.dependencies.length > 0
        ? <Text style={styles.depLink}>{task.dependencies[0].title}</Text>
        : <Text style={styles.infoValue}>—</Text>,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>

            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "details" && styles.tabActive]}
                onPress={() => setActiveTab("details")}
              >
                <Text style={activeTab === "details" ? styles.tabActiveText : styles.tabInactiveText}>
                  Task Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "comments" && styles.tabActive]}
                onPress={() => setActiveTab("comments")}
              >
                <Text style={activeTab === "comments" ? styles.tabActiveText : styles.tabInactiveText}>
                  Comments
                </Text>
                <View style={styles.tabDot} />
              </TouchableOpacity>
            </View>

            {/* ── DETAILS TAB ── */}
            {activeTab === "details" && (
              <View style={styles.tabContent}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.detailsScroll}
                  keyboardShouldPersistTaps="handled"
                >
                {task.subtasks.length > 0 && (
                  <View style={styles.cntBadge}>
                    <MaterialCommunityIcons name="file-tree-outline" size={14} color="#fff" />
                    <Text style={styles.cntBadgeText}>+{task.subtasks.length}</Text>
                  </View>
                )}
                <Text style={styles.taskTitle}>{task.title}</Text>

                {INFO_ROWS.map((row, i) => (
                  <View key={i} style={styles.infoRow}>
                    <View style={styles.infoLabelWrap}>
                      <Ionicons name={row.icon as any} size={16} color="#AAAAAA" style={{ marginRight: 6 }} />
                      <Text style={styles.infoLabel}>{row.label}</Text>
                    </View>
                    <View style={styles.infoValueWrap}>{row.value}</View>
                  </View>
                ))}

                {/* Description */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.descText}>{task.description}</Text>
                  <View style={styles.descBadgesRow}>
                    {task.subtasks.length > 0 && (
                      <View style={styles.descBadge}>
                        <MaterialCommunityIcons name="file-tree-outline" size={13} color="#00DFAB" />
                        <Text style={[styles.descBadgeText, {color:"#00DFAB"}]}>+{task.subtasks.length}</Text>
                      </View>
                    )}
                    {task.attachments.length > 0 && (
                      <View style={styles.descBadge}>
                        <Ionicons name="link-outline" size={13} color="#fff" />
                        <Text style={styles.descBadgeText}>+{task.attachments.length}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Subtask table */}
                {task.subtasks.length > 0 && (
                  <SectionTable title="Subtask" rows={task.subtasks} showAdd />
                )}

                {/* Dependencies table */}
                {task.dependencies.length > 0 && (
                  <SectionTable title="Dependencies" rows={task.dependencies} />
                )}

                {/* Attachments */}
                {task.attachments.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.attachHeader}>
                      <Text style={styles.sectionTitle}>Attachments</Text>
                      <View style={styles.cntBadgeGray}>
                        <MaterialCommunityIcons name="file-tree-outline" size={13} color="#fff" />
                        <Text style={styles.cntBadgeText}>+{task.attachments.length}</Text>
                      </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {task.attachments.map((a, i) => (
                        <View key={i} style={styles.attachTag}>
                          <Ionicons name="download-outline" size={13} color="#00DEAB" />
                          <Text style={styles.attachTagText}>{a}</Text>
                          <Ionicons name="close" size={13} color="#00DEAB" />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
                </ScrollView>
              </View>
            )}

            {/* ── COMMENTS TAB ── */}
            {activeTab === "comments" && (
              <View style={[styles.commentsContainer, styles.tabComment]}>
                <ScrollView
                  style={styles.commentsList}
                  contentContainerStyle={styles.commentsListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {MOCK_COMMENTS.map((c) => (
                    <CommentBubble key={c.id} comment={c} />
                  ))}
                </ScrollView>

                {/* Input box */}
                <View style={styles.inputBox}>
                  <Animated.Text
                    style={[
                      styles.inputLabel,
                      {
                        top: labelTop,
                        fontSize: labelSize,
                        color: labelColor,
                      },
                    ]}
                  >
                    Comment
                  </Animated.Text>
                  <TextInput
                    style={styles.inputField}
                    value={commentText}
                    onChangeText={setCommentText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    multiline
                    placeholderTextColor="transparent"
                  />
                  <View style={styles.inputToolbar}>
                    <View style={styles.toolbarLeft}>
                      <TouchableOpacity style={styles.toolBtn}>
                        <Ionicons name="add" size={16} color="#1D1D1D" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.toolBtn}>
                        <Ionicons name="at" size={16} color="#1D1D1D" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.toolBtn}>
                        <MaterialCommunityIcons name="emoticon-plus-outline" size={16} color="#1D1D1D" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.toolBtn}>
                        <Ionicons name="mic-outline" size={16} color="#1D1D1D" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.toolBtn}>
                        <Ionicons name="videocam-outline" size={16} color="#1D1D1D" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.sendBtn}>
                      <Ionicons name="send" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 4,
    maxHeight: "92%",
    flex: 1,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#1D1D1D",
    justifyContent: "center", alignItems: "center",
    marginBottom: 12,
  },

  // Tabs — active = white card, inactive = transparent
  tabs: {
    flexDirection: "row",
    marginBottom: 0,
    gap: 0,
  },
  tab: {
    flex: 1, paddingVertical: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 4,
    backgroundColor: "transparent",
  },
  tabActive: { backgroundColor: "#F9F9F9" },
  tabActiveText: { fontSize: 14, color: "#1D1D1D", fontFamily: "SF_Pro_Semibold" },
  tabInactiveText: { fontSize: 14, color: "#E6E6E6", fontFamily: "SF_Pro_Semibold" },
  tabDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#00DEAB" },

  // Content area below tabs
  detailsScroll: { paddingBottom: 40, paddingTop: 16 },

  // Info rows
  
  cntBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#00DFAB", borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 5,
    alignSelf: "flex-start", marginBottom: 10,
  },
   cntBadgeGray: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#AAAAAA", borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 5,
    alignSelf: "flex-start", marginBottom: 10,
  },
  cntBadgeText: { fontSize: 12, color: "#fff", fontFamily: "SF_Pro_Regular" },
  taskTitle: { fontSize: 18, fontFamily: "SF_Pro_Medium", color: "#1D1D1D", marginBottom: 20 },
  infoRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  infoLabelWrap: { flexDirection: "row", alignItems: "center", flex: 1.2 },
  infoLabel: { fontSize: 12, color: "#AAAAAA", fontFamily: "SF_Pro_Semibold" },
  infoValueWrap: { flex: 1.5 },
  infoValue: { fontSize: 13, color: "#AAAAAA", fontFamily: "SF_Pro_Regular" },
  assignedRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  initials: {
    width: 24, height: 24, borderRadius: 5,
    backgroundColor: "#00DEAB", alignItems: "center", justifyContent: "center",
  },
  initialsText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  badge: { borderRadius: 5, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontFamily: "SF_Pro_Medium" },
  depLink: { fontSize: 13, backgroundColor:"#F0FFF8", maxWidth: 100, padding:5, borderRadius: 5, textAlign:"center", color: "#00DEAB", fontFamily: "SF_Pro_Regular" },

  // Description
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "SF_Pro_Medium", color: "#1D1D1D", marginBottom: 12 },
  descText: { fontSize: 12, color: "#1D1D1D", lineHeight: 22, fontFamily: "SF_Pro_Regular" },
  descBadgesRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  descBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, backgroundColor: "#1D1D1D", borderRadius: 5,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  descBadgeText: { fontSize: 12, color: "#fff" },

  // Section table (Subtask / Dependencies)
  tblHeader: {
    flexDirection: "row",
    backgroundColor: "#E6E6E6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 2,
    alignItems: "center",
  },
  tblHeadCell: { fontSize: 12, fontFamily: "SF_Pro_Medium", color: "#1D1D1D", paddingRight: 8 },
  tblRow: {
    flexDirection: "row", alignItems: "center",
    minHeight: 52,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  tblAccent: { width: 3, alignSelf: "stretch", borderRadius: 5, backgroundColor: "#EF4444", marginRight: 8 },
  tblCell: { fontSize: 12, color: "#1D1D1D", fontFamily: "SF_Pro_Regular", paddingRight: 8 },
  tblCreatedBy: { flexDirection: "row", alignItems: "center", gap: 6 },
  tblAvatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: "#D1D5DB" },
  tblDueDate: { flexDirection: "row", alignItems: "center" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  addBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#00DEAB", alignItems: "center", justifyContent: "center",
  },
  addRowText: { fontSize: 13, color: "#C0C0C0", fontFamily: "SF_Pro_Regular" },

  // Attachments
  attachHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  attachTag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#1D1D1D", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
  },
  attachTagText: { fontSize: 12, color: "#00DEAB", fontFamily: "SF_Pro_Regular" },

  // Comments tab
  tabContent: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabComment: {  flex: 1,
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16, },
  commentsContainer: { flex: 1, flexDirection: "column" },
  commentsList: { flex: 1 },
  commentsListContent: { gap: 12, paddingBottom: 16 },

  bubble: {
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 14, padding: 14,
    backgroundColor: "#fff",
  },
  bubblePinned: { backgroundColor: "#E6FBF6", borderColor: "#E6FBF6" },
  bubbleOwn: { borderColor: "#1D1D1D" },
  bubbleHeader: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 10, gap: 8, flexWrap: "nowrap",
  },
  bubbleAvatar: {
    width: 24, height: 24, borderRadius: 5,
    backgroundColor: "#00DEAB", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  bubbleAvatarText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  bubbleNameRow: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 6, overflow: "hidden",
  },
  bubbleName: { fontSize: 13, fontFamily: "SF_Pro_Semibold", color: "#1D1D1D", flexShrink: 0 },
  bubbleTime: { fontSize: 11, color: "#9CA3AF", fontFamily: "SF_Pro_Regular", flexShrink: 1 },
  pinIcon: { flexShrink: 0 },
  bubbleText: { fontSize: 14, color: "#1D1D1D", lineHeight: 22, fontFamily: "SF_Pro_Regular" },
  bubbleActions: {
    flexDirection: "row", alignItems: "center",
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: "#F3F4F6",
    gap: 4,
  },
  actionBtn: { padding: 4 },

  // Comment input
  inputBox: {
    borderWidth: 1, borderColor: "#1D1D1D",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 20,
    position: "relative",
  },
  inputLabel: {
    position: "absolute", left: 12,
    backgroundColor: "#F9F9F9", paddingHorizontal: 4,
    fontFamily: "SF_Pro_Regular",
  },
  inputField: {
    fontSize: 13, color: "#1D1D1D",
    fontFamily: "SF_Pro_Regular",
    minHeight: 38, maxHeight: 80,
    paddingTop: 2, paddingBottom: 2,
    textAlignVertical: "top",
  },
  inputToolbar: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 8,
  },
  toolbarLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  toolBtn: {
    width: 28, height: 28, borderRadius: 4,
    backgroundColor: "#E6E6E6",
    alignItems: "center", justifyContent: "center",
  },
  sendBtn: {
    width: 28, height: 28, borderRadius: 4,
    backgroundColor: "#00DEAB",
    alignItems: "center", justifyContent: "center",
  },
});
