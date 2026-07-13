import AppHeader from "@/components/headerapp";
import { View } from "react-native";
export default function HomeScreen() {
     return (
            <>
                <View style={{ flex: 1, backgroundColor: "#fff" }} >
                    <AppHeader
                        greeting="Good afternoon, Muhammad Hamza!"
                        subGreeting="Let's make today productive!"
                        initials="JD"
                    />
                </View>;
            </>
        )
}
