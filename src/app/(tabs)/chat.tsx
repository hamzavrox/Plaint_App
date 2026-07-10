import AppHeader from "@/components/headerapp";
import { View } from "react-native";
export default function ChatScreen() { 
     return (
            <>
                <View style={{ flex: 1, backgroundColor: "#fff" }} >
                    <AppHeader
                        greeting="Good morning, Junaid!"
                        subGreeting="Let's make today productive!"
                        initials="JD"
                        placeholder="Search chats..."
                        showSearch
                        showFilter={false}
                    />
                </View>;
            </>
        )
 }
