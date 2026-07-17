import CalendarPicker from "@/components/CalendarPicker";
import RichTextEditor, { RichTextEditorRef } from "@/components/texteditor";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Props = { visible: boolean; onClose: () => void };

const MOCK_USERS = [
  { id: "1", name: "Muhammad Salman", initials: "S", color: "#0DDFAB" },
  { id: "2", name: "Muhammad Haris", initials: "H", color: "#607EF9" },
  { id: "3", name: "Muhammad Najam Ali", initials: "N", color: "#F97316" },
  { id: "4", name: "Muhammad Junaid", initials: "J", color: "#DFA70D" },
  { id: "5", name: "Muhammad Awais", initials: "A", color: "#DF0D0D" },
];

const TOP_CHIPS = [
  { id: "assigned", icon: "people-outline", label: "Assigned to" },
  { id: "duedate", icon: "calendar-outline", label: "Due Date" },
  { id: "priority", icon: "star-outline", label: "Priority" },
];

const BOTTOM_CHIPS = [
  { id: "approval", icon: "checkmark-done-outline", label: "Approval Required" },
  { id: "status", icon: "radio-button-off-outline", label: "Task Status" },
  { id: "recurring", icon: "camera-outline", label: "Recurring Task" },
];

export default function CreateTaskModal({ visible, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [description, setDescription] = useState("");
  const [descFocused, setDescFocused] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignFocused, setAssignFocused] = useState(false);
  const [assignedUser, setAssignedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [recurringEnabled, setRecurringEnabled] = useState(false);

  const STATUSES = [
    { label: "Pending", color: "#F97316" },
    { label: "In Progress", color: "#607EF9" },
    { label: "On Hold", color: "#0DDFAB" },
    { label: "Completed", color: "#1CB333" },
    { label: "Rejected", color: "#FF0000" },
    { label: "Pending Approval", color: "#1D1D1D" },
  ];

  const descriptionEditorRef = useRef<RichTextEditorRef>(null);

  const titleFloated = titleFocused || title.length > 0;
  const descExpanded = descFocused || description.replace(/<[^>]*>/g, "").trim().length > 0;

  const filteredUsers = MOCK_USERS.filter((u) =>
    u.name.toLowerCase().includes(assignSearch.toLowerCase())
  );

  const handleAttach = () => {
    const fakeFile = `Attached File ${attachments.length + 1}.pdf`;
    setAttachments((prev) => [...prev, fakeFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTask = async () => {
    const descriptionHtml = await descriptionEditorRef.current?.getContentHtml();
    console.log({ title, description: descriptionHtml ?? description, attachments, assignedUser });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
            {/* Title */}
            <View style={[styles.titleInputWrap, titleFloated && styles.titleInputWrapActive]}>
              <Text style={[styles.floatLabel, titleFloated && styles.floatLabelActive]}>
                Enter a task title
              </Text>
              <TextInput
                style={[styles.titleInput, titleFloated && styles.titleInputFloated]}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                placeholderTextColor="transparent"
              />
            </View>

            {/* Description */}
            {descExpanded ? (
              <RichTextEditor
                ref={descriptionEditorRef}
                label="Description"
                initialHTML={description}
                onChangeHTML={setDescription}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                editorHeight={160}
                containerStyle={styles.descEditor}
                autoFocus
              />
            ) : (
              <TouchableOpacity style={styles.descIdle} onPress={() => setDescFocused(true)} activeOpacity={0.7}>
                <Ionicons name="document-text-outline" size={20} color="#E6E6E6" style={{ marginRight: 10 }} />
                <Text style={styles.descIdlePlaceholder}>Description</Text>
              </TouchableOpacity>
            )}

            {/* Top chips row */}
            <View style={styles.chipsRow}>
              {TOP_CHIPS.map((chip) => {
                const isAssign = chip.id === "assigned";
                const isDueDate = chip.id === "duedate";
                const isPriority = chip.id === "priority";
                const active = (isAssign && assignOpen) || (isDueDate && dueDateOpen) || (isPriority && priorityOpen);
                const hasUser = isAssign && assignedUser;
                const hasDate = isDueDate && startDate;
                const hasPriority = isPriority && selectedPriority;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      if (isAssign) { setAssignOpen((v) => !v); setDueDateOpen(false); setPriorityOpen(false); }
                      if (isDueDate) { setDueDateOpen((v) => !v); setAssignOpen(false); setPriorityOpen(false); }
                      if (isPriority) { setPriorityOpen((v) => !v); setAssignOpen(false); setDueDateOpen(false); }
                    }}
                  >
                    <Ionicons name={chip.icon as any} size={16} color={active ? "#fff" : "#AAAAAA"} />
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {hasUser ? assignedUser!.name.split(" ")[0] + " " + assignedUser!.name.split(" ")[1]
                        : hasDate ? `${startDate!.getDate()}, ${startDate!.toLocaleString("default", { month: "short" })}`
                        : hasPriority ? selectedPriority!
                        : chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority panel */}
            {priorityOpen && (
              <View style={styles.priorityRow}>
                {[
                  { label: "Low", dot: "#0DDFAB", selected: selectedPriority === "Low" },
                  { label: "Medium", dot: "#1D1D1D", selected: selectedPriority === "Medium" },
                  { label: "High", dot: "#FF0000", selected: selectedPriority === "High" },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    style={[styles.priorityChip, p.selected && { backgroundColor: "#0DDFAB", borderColor: "#0DDFAB" }]}
                    onPress={() => { setSelectedPriority(p.label); setPriorityOpen(false); }}
                  >
                    {p.selected
                      ? <Ionicons name="checkmark" size={14} color="#fff" />
                      : <View style={[styles.priorityDot, { backgroundColor: p.dot }]} />}
                    <Text style={[styles.priorityLabel, p.selected && { color: "#fff" }]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Due Date calendar */}
            {dueDateOpen && (
              <CalendarPicker
                startDate={startDate}
                endDate={endDate}
                onSelectStart={setStartDate}
                onSelectEnd={setEndDate}
                onDone={() => setDueDateOpen(false)}
              />
            )}

            {/* Assign to search panel */}
            {assignOpen && (
              <View style={styles.assignPanel}>
                {/* Floating label search input */}
                <View style={styles.searchWrap}>
                  <Text style={[styles.searchLabel, (assignFocused || assignSearch.length > 0) && styles.searchLabelFloated]}>
                    Search people
                  </Text>
                  <TextInput
                    style={styles.searchInput}
                    value={assignSearch}
                    onChangeText={setAssignSearch}
                    onFocus={() => setAssignFocused(true)}
                    onBlur={() => setAssignFocused(false)}
                    autoFocus
                  />
                  <Ionicons name="search-outline" size={18} color="#AAAAAA" style={styles.searchIcon} />
                </View>

                {/* User list */}
                {filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userRow}
                    onPress={() => { setAssignedUser(user); setAssignOpen(false); setAssignSearch(""); }}
                  >
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{user.initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Bottom chips + approval + status panels */}
            <View>
              <View style={styles.chipsRow}>
                {BOTTOM_CHIPS.map((chip) => {
                  const isApproval = chip.id === "approval";
                  const isStatus = chip.id === "status";
                  const isRecurring = chip.id === "recurring";
                  const active = (isApproval && approvalOpen) || (isStatus && statusOpen) || (isRecurring && recurringOpen);
                  const hasApproval = isApproval && selectedApproval;
                  const hasStatus = isStatus && selectedStatus;
                  const hasRecurring = isRecurring && recurringEnabled;
                  return (
                    <TouchableOpacity
                      key={chip.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => {
                        if (isApproval) { setApprovalOpen((v) => !v); setStatusOpen(false); setRecurringOpen(false); }
                        if (isStatus) { setStatusOpen((v) => !v); setApprovalOpen(false); setRecurringOpen(false); }
                        if (isRecurring) { setRecurringOpen((v) => !v); setApprovalOpen(false); setStatusOpen(false); }
                      }}
                    >
                      <Ionicons name={chip.icon as any} size={16} color={active ? "#fff" : "#AAAAAA"} />
                      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                        {hasApproval ? selectedApproval! : hasStatus ? selectedStatus! : hasRecurring ? "Recurring" : chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Approval panel */}
              {approvalOpen && (
                <View style={styles.approvalRow}>
                  {[
                    { label: "Yes", selected: selectedApproval === "Yes" },
                    { label: "No", selected: selectedApproval === "No" },
                  ].map((a) => (
                    <TouchableOpacity
                      key={a.label}
                      style={[styles.approvalChip, a.selected && styles.approvalChipSelected]}
                      onPress={() => { setSelectedApproval(a.label); setApprovalOpen(false); }}
                    >
                      <Ionicons name={a.label === "Yes" ? "checkmark" : "close"} size={14} color={a.selected ? "#fff" : "#AAAAAA"} />
                      <Text style={[styles.approvalLabel, a.selected && styles.approvalLabelSelected]}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Status panel */}
              {statusOpen && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
                  {STATUSES.map((s) => {
                    const selected = selectedStatus === s.label;
                    return (
                      <TouchableOpacity
                        key={s.label}
                        style={[styles.statusChip, selected && { backgroundColor: s.color, borderColor: s.color }]}
                        onPress={() => { setSelectedStatus(s.label); setStatusOpen(false); }}
                      >
                        {selected
                          ? <Ionicons name="checkmark" size={13} color="#fff" />
                          : <View style={[styles.statusDot, { backgroundColor: s.color }]} />}
                        <Text style={[styles.statusLabel, selected && { color: "#fff" }]}>{s.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Recurring panel */}
              {recurringOpen && (
                <TouchableOpacity
                  style={styles.recurringBtn}
                  onPress={() => { setRecurringEnabled((v) => !v); setRecurringOpen(false); }}
                >
                  <Ionicons name="checkmark" size={14} color="#0DDFAB" />
                  <Text style={styles.recurringLabel}>Enable Recurring</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Attachment icons */}
            <View style={styles.attachRow}>
              <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
                <Ionicons name="link-outline" size={20} color="#1D1D1D" />
              </TouchableOpacity>
              {attachments.length > 0 && (
                <TouchableOpacity style={styles.attachBtn}>
                  <Ionicons name="download-outline" size={20} color="#1D1D1D" />
                </TouchableOpacity>
              )}
            </View>

            {/* Attachment tags */}
            {attachments.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                {attachments.map((a, i) => (
                  <View key={i} style={styles.tag}>
                    <Ionicons name="download-outline" size={13} color="#0DDFAB" />
                    <Text style={styles.tagText}>{a}</Text>
                    <TouchableOpacity onPress={() => removeAttachment(i)}>
                      <Ionicons name="close" size={13} color="#0DDFAB" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </ScrollView>

          {/* Create Task Button */}
          <TouchableOpacity style={styles.createBtn} activeOpacity={0.85} onPress={handleCreateTask}>
            <Text style={styles.createBtnText}>+   Create Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    maxHeight: "90%",
  },
  scrollContent: { paddingBottom: 0, paddingTop: 10 },
  closeBtn: {
    alignSelf: "flex-end",
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#1D1D1D",
    justifyContent: "center", alignItems: "center",
    marginBottom: 10,
  },
  titleInputWrap: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, marginBottom: 20 },
  titleInputWrapActive: { borderWidth: 1, borderColor: "#1D1D1D", paddingTop: 20, borderRadius: 8 },
  floatLabel: {
    position: "absolute", top: 14, left: 14, fontSize: 15,
    backgroundColor: "#fff", paddingHorizontal: 2, color: "#E6E6E6", fontFamily: "SF_Pro_Regular",
  },
  floatLabelActive: { top: -9, left: 10, fontSize: 12, color: "#1D1D1D", paddingHorizontal: 4, fontFamily: "SF_Pro_Regular" },
  titleInput: { fontSize: 16, color: "#1D1D1D", fontFamily: "SF_Pro_Regular", padding: 0, height: 20 },
  titleInputFloated: {},
  descEditor: { marginBottom: 20 },
  descIdle: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, marginBottom: 20 },
  descIdlePlaceholder: { fontSize: 15, color: "#E6E6E6", fontFamily: "SF_Pro_Regular" },

  // Chips
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 14 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "#AAAAAA", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#1D1D1D", borderColor: "#1D1D1D" },
  chipLabel: { fontSize: 13, color: "#AAAAAA", fontFamily: "SF_Pro_Regular" },
  chipLabelActive: { color: "#fff" },

  // Priority
  priorityRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  priorityChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "#AAAAAA", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: 13, color: "#1D1D1D", fontFamily: "SF_Pro_Regular" },

  // Assign panel
  assignPanel: {
    marginBottom: 14,
  },
  searchWrap: {
    borderWidth: 1, borderColor: "#1D1D1D", borderRadius: 8,
    marginBottom: 4, paddingHorizontal: 12,
    position: "relative", height: 44,
    justifyContent: "center",
  },
  searchLabel: {
    position: "absolute", top: 12, left: 12,
    fontSize: 14, color: "#AAAAAA", fontFamily: "SF_Pro_Regular",
  },
  searchLabelFloated: {
    top: -9, left: 10,
    backgroundColor: "#fff", paddingHorizontal: 4,
    fontSize: 12, color: "#1D1D1D",
  },
  searchInput: {
    fontSize: 15, color: "#1D1D1D", fontFamily: "SF_Pro_Regular",
    paddingRight: 28, padding: 0, height: 24,
  },
  searchIcon: { position: "absolute", right: 12, top: 12 },
  userRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: "#0DDFAB",
    justifyContent: "center", alignItems: "center",
  },
  userAvatarText: { color: "#fff", fontSize: 14, fontFamily: "SF_Pro_Semibold" },
  userName: { fontSize: 14, color: "#1D1D1D", fontFamily: "SF_Pro_Regular" },

  // Approval
  approvalRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  approvalChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "#AAAAAA", borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  approvalChipSelected: { backgroundColor: "#0DDFAB", borderColor: "#0DDFAB" },
  approvalLabel: { fontSize: 13, color: "#1D1D1D", fontFamily: "SF_Pro_Regular" },
  approvalLabelSelected: { color: "#fff" },

  // Status
  statusScroll: { marginBottom: 14 },
  statusChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "#AAAAAA", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginRight: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, color: "#1D1D1D", fontFamily: "SF_Pro_Regular" },

  // Recurring
  recurringBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E6FFF9", borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 14, alignSelf: "flex-start",
  },
  recurringLabel: { fontSize: 13, color: "#0DDFAB", fontFamily: "SF_Pro_Regular" },

  // Attachments
  attachRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  attachBtn: {
    width: 35, height: 35, borderWidth: 1,
    borderColor: "#E6E6E6", backgroundColor: "#E6E6E6",
    borderRadius: 5, justifyContent: "center", alignItems: "center",
  },
  tagsScroll: { marginBottom: 8 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#1D1D1D", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
  },
  tagText: { fontSize: 12, color: "#0DDFAB", fontFamily: "SF_Pro_Regular" },
  createBtn: {
    backgroundColor: "#00DEAB", borderRadius: 5,
    paddingVertical: 16, alignItems: "center",
    marginTop: 12, marginBottom: 30,
  },
  createBtnText: { fontSize: 16, color: "#1D1D1D", fontFamily: "SF_Pro_Semibold" },
});