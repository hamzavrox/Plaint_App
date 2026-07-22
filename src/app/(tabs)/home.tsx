import AppHeader from "@/components/headerapp";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
     return (
            <>
                <View style={styles.root} >
                    <SafeAreaView style={styles.safe}>
                    <AppHeader
                        greeting="Good afternoon, Muhammad Hamza!"
                        subGreeting="Let's make today productive!"
                        initials="JD"
                    />
                    </SafeAreaView>
                </View>;
            </>
        )
}


const styles = StyleSheet.create({   
    root: { flex: 1, backgroundColor: "#fff" },
    safe: { flex: 1 },

})