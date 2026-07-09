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
                    greeting="Good morning, Junaid!"
                    subGreeting="Let's make today productive!"
                    initials="JD"
                    showSearch
                    onFilterPress={() => setFilterVisible(true)}

                />
                        <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
            </View>;
        </>
    )
}
