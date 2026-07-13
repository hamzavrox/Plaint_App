import FilterModal from "@/components/FilterModal";
import AppHeader from "@/components/headerapp";
import { useState } from "react";
import { View } from "react-native";
export default function StatsScreen() {
     const [filterVisible, setFilterVisible] = useState(false);
    return (
        <>
            <View style={{ flex: 1, backgroundColor: "#fff" }} >
                <AppHeader
                    greeting="My Evaluation"
                    subGreeting="Track and review your performance"
                    initials="JD"
                    // showSearch
                    // onFilterPress={() => setFilterVisible(true)}

                />
                        {/* <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} /> */}
            </View>;
        </>
    )
}
