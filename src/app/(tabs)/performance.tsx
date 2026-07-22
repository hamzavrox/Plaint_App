import FilterModal from "@/components/FilterModal";
import AppHeader from "@/components/headerapp";
import { useState } from "react";
import {  StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function StatsScreen() {
     const [filterVisible, setFilterVisible] = useState(false);
    return (
        <>
                <SafeAreaView style={styles.root}>
                <AppHeader
                    greeting="My Evaluation"
                    subGreeting="Track and review your performance"
                    initials="JD"
                    // showSearch
                    // onFilterPress={() => setFilterVisible(true)}

                />
                        {/* <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} /> */}
                </SafeAreaView>
        </>
    )
}


const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },
})