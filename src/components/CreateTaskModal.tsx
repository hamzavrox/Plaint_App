import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = { visible: boolean; onClose: () => void };

const ACTION_CHIPS = [
  { id: "assigned",  icon: "people-outline",          label: "Assigned to",       lib: "ion" },
  { id: "duedate",   icon: "calendar-outline",         label: "Due Date",          lib: "ion" },
  { id: "priority",  icon: "star-outline",             label: "Priority",          lib: "ion" },
  { id: "approval",  icon: "checkmark-done-outline",   label: "Approval Required", lib: "ion" },
  { id: "status",    icon: "sync-circle-outline",      label: "Task Status",       lib: "ion" },
  { id: "recurring", icon: "camera-outline",           label: "Recurring Task",    lib: "ion" },
  { id: "subtask",   icon: "git-branch-outline",       label: "Add Subtask",       lib: "ion" },
  { id: "deps",      icon: "git-compare-outline",      label: "Dependencies",      lib: "ion" },
];

const FORMAT_TOOLS = [
  { id: "bold",   icon: "format-bold",        lib: "mci" },
  { id: "italic", icon: "format-italic",      lib: "mci" },
  { id: "under",  icon: "format-underline",   lib: "mci" },
  { id: "emoji",  icon: "emoticon-outline",   lib: "mci" },
  { id: "link",   icon: "link-variant",       lib: "mci" },
  { id: "list",   icon: "format-list-bulleted", lib: "mci" },
];

export default function CreateTaskModal({ visible, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [description, setDescription] = useState("");
  const [descFocused, setDescFocused] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  const titleFloated = titleFocused || title.length > 0;
  const showDescBox = descFocused || description.length > 0;

  const handleAttach = () => {
    // Simulate picking a file — replace with real file picker (e.g. expo-document-picker)
    const fakeFile = `Attached File ${attachments.length + 1}.pdf`;
    setAttachments((prev) => [...prev, fakeFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            {showDescBox ? (
              <View style={[styles.descBox, styles.descBoxActive]}>
                <Text style={[styles.floatLabel, styles.floatLabelActive]}>Description</Text>
                <TextInput
                  style={styles.descInput}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  autoFocus={!description}
                />
                {/* Format toolbar */}
                <View style={styles.formatBar}>
                  {FORMAT_TOOLS.map((t) => (
                    <TouchableOpacity key={t.id} style={styles.formatBtn}>
                      <MaterialCommunityIcons name={t.icon as any} size={20} color="#6B7280" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.descPlaceholderRow} onPress={() => setDescFocused(true)}>
                <Ionicons name="document-text-outline" size={20} color="#D1D5DB" />
                <Text style={styles.descPlaceholder}>Description</Text>
              </TouchableOpacity>
            )}

            {/* Action Chips */}
            <View style={styles.chipsWrap}>
              {ACTION_CHIPS.map((chip) => (
                <TouchableOpacity key={chip.id} style={styles.chip}>
                  <Ionicons name={chip.icon as any} size={16} color="#AAAAAA" />
                  <Text style={styles.chipLabel}>{chip.label}</Text>
                </TouchableOpacity>
              ))}
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
          <TouchableOpacity style={styles.createBtn} activeOpacity={0.85}>
            <Text style={styles.createBtnText}>+ Create Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    maxHeight: "90%",
  },
  scrollContent: { paddingBottom: 0 , paddingTop: 10},
  closeBtn: {
    alignSelf: "flex-end",
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#1D1D1D",
    justifyContent: "center", alignItems: "center",
    marginBottom: 10,
  },
  titleInputWrap: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 20,
  },
  titleInputWrapActive: {
    borderColor: "#1D1D1D",
    paddingTop: 22,
  },
  floatLabel: {
    position: "absolute",
    top: 14,
    left: 14,
    fontSize: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 2,
    color: "#E6E6E6",
    fontFamily: "SF_Pro_Regular",
  },
  floatLabelActive: {
    top: -9,
    left: 10,
    fontSize: 12,
    color: "#1D1D1D",
    paddingHorizontal: 4,
  },
  titleInput: {
    fontSize: 16,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Regular",
    padding: 0,
    height: 20,
  },
  titleInputFloated: {
    // no extra style needed, paddingTop on wrap handles spacing
  },
  descPlaceholderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    paddingVertical: 4,
  },
  descPlaceholder: {
    fontSize: 16,
    color: "#E6E6E6",
    fontFamily: "SF_Pro_Regular",
  },
  descBox: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  descBoxActive: { borderColor: "#1D1D1D" },
  descInput: {
    fontSize: 14,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Regular",
    minHeight: 160,
    textAlignVertical: "top",
    padding: 0,
    marginTop: 8,
  },
  formatBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E6E6E6",
    paddingTop: 10,
    marginTop: 10,
    gap: 4,
  },
  formatBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipLabel: {
    fontSize: 13,
    color: "#AAAAAA",
    fontFamily: "SF_Pro_Regular",
  },
  attachRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  attachBtn: {
    width: 35, height: 35,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#E6E6E6",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsScroll: { marginBottom: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1D1D1D",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#0DDFAB",
    fontFamily: "SF_Pro_Regular",
  },
  createBtn: {
    backgroundColor: "#00DEAB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 30,
  },
  createBtnText: {
    fontSize: 16,
    color: "#1D1D1D",
    fontFamily: "SF_Pro_Semibold",
  },
});
