// Requires: npx expo install react-native-radial-gradient
// (expo-linear-gradient does NOT support radial gradients — only linear/straight ones)

import { Dimensions, StyleSheet, View } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';

const { width, height } = Dimensions.get('window');

// Exact values extracted from Ellipse_12.png
const GRADIENT_COLOR = '#00DEAB';       // rgb(0, 222, 171)
const CENTER_OPACITY = 0.6;             // alpha ~153/255 at center-bottom
const EDGE_OPACITY = 0;                 // fully transparent at edges/top

export default function GradientBackground() {
  return (
    <RadialGradient
      style={StyleSheet.absoluteFillObject}
      colors={[
        `${GRADIENT_COLOR}${Math.round(CENTER_OPACITY * 255).toString(16).padStart(2, '0')}`, // center
        `${GRADIENT_COLOR}00`, // edge, fully transparent
      ]}
      stops={[0, 1]}
      center={[width / 2, height]}   // center sits at bottom-middle, like the source image
      radius={height * 0.75}         // tune this to match how far the glow spreads in your layout
    >
      {/* your screen content goes here, or wrap this around your screen */}
      <View style={StyleSheet.absoluteFillObject} />
    </RadialGradient>
  );
}