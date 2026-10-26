import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

const ScreenWrapper = ({ children, bg }) => {
    const { top } = useSafeAreaInsets();
    const { colors } = useTheme();
    const paddingTop = top > 0 ? top + 5 : 30;

    return (
        <View
            style={{
                flex: 1,
                paddingTop,
                backgroundColor: bg ?? colors.background,
            }}
        >
            {children}
        </View>
    );
};

export default ScreenWrapper;
