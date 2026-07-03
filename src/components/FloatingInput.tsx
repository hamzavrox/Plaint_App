import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingInputProps extends TextInputProps {
  label: string;
  secureToggle?: boolean;
}

export default function FloatingInput({
  label,
  secureToggle = false,
  value,
  onChangeText,
  ...rest
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const floated = focused || !!value;
  const anim = useRef(new Animated.Value(floated ? 1 : 0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
  };

  // When floated: label sits at -10 (above border), when not: sits centered in box
  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [13, -10] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 12] });

  return (
    <View style={[styles.wrapper, (focused || !!value) && styles.wrapperFocused]}>
      <Animated.Text
        style={[
          styles.label,
          {
            top: labelTop,
            fontSize: labelSize,
            color: (focused || !!value) ? "#1D1D1D" : "#E6E6E6",
          },
        ]}
      >
        {label}
      </Animated.Text>

      <TextInput
        style={[styles.input, secureToggle && { paddingRight: 44 }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureToggle && !showPassword}
        placeholderTextColor="transparent"
        {...rest}
      />

      {secureToggle && (
        <Pressable style={styles.eyeIcon} onPress={() => setShowPassword((v) => !v)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={(focused || !!value) ? "#1D1D1D" : "#E6E6E6"} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  wrapperFocused: {
    borderColor: "#1D1D1D",
  },
  label: {
    position: "absolute",
    left: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    color: "#E6E6E6",
  },
  input: {
    fontSize: 15,
    color: "#1D1D1D",
    padding: 0,
    margin: 0,
    height: 20,
    textAlignVertical: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    bottom: 0,
    top: 0,
    justifyContent: "center",
  },
});
