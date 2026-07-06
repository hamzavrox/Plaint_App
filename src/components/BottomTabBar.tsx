// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";

// import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import { Ionicons } from "@expo/vector-icons";

// const icons: any = {
//   index: "checkmark-done-outline",
//   calendar: "calendar-outline",
//   stats: "stats-chart-outline",
//   home: "home-outline",
//   chat: "chatbubble-outline",
//   profile: "finger-print-outline",
//   menu: "grid-outline",
// };

// export default function CustomTabBar({
//   state,
//   descriptors,
//   navigation,
// }: BottomTabBarProps) {

//   return (

//     <View style={styles.wrapper}>

//       <View style={styles.container}>

//         {state.routes.map((route, index) => {

//           const focused = state.index === index;

//           return (

//             <TouchableOpacity
//               key={route.key}
//               activeOpacity={0.8}
//               onPress={() => navigation.navigate(route.name)}
//               style={[
//                 styles.tabButton,
//                 focused && styles.activeTab,
//               ]}
//             >

//               <Ionicons
//                 name={icons[route.name]}
//                 size={26}
//                 color={focused ? "#000" : "#fff"}
//               />

//             </TouchableOpacity>

//           );
//         })}

//       </View>

//     </View>

//   );
// }

// const styles = StyleSheet.create({

//   wrapper:{
//     position:"absolute",
//     bottom:20,
//     left:15,
//     right:15,
//   },

//   container:{
//     flexDirection:"row",
//     backgroundColor:"#000",
//     height:72,
//     borderRadius:40,
//     alignItems:"center",
//     justifyContent:"space-evenly",
//   },

//   tabButton:{
//     width:56,
//     height:56,
//     borderRadius:28,
//     justifyContent:"center",
//     alignItems:"center",
//   },

//   activeTab:{
//     backgroundColor:"#fff",
//   }

// });