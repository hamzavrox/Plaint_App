import AppHeader from "@/components/headerapp";
import { Text, View } from "react-native";

export default function Dashboard() {
  return (
         <>
             <View style={{ flex: 1, backgroundColor: "#fff" }} >
                 <AppHeader
                     greeting="Good morning, Junaid!"
                     subGreeting="Let's make today productive , and boost productivity. !"
                     initials="JD"
                 />
             </View>;
         </>
     )
}