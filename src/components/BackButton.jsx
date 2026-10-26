import { Pressable, StyleSheet } from "react-native";
import Icon from "../../assets/icons/Icon";
import { theme } from "../constants/theme";
import { useThemedStyles } from "../contexts/ThemeContext";

const BackButton = ({ size = 26, router }) => {
    const { styles, colors } = useThemedStyles(createStyles);

    return (
        <Pressable onPress={() => router.back()} style={styles.button}>
            <Icon
                name="arrowLeft"
                strokeWidth={2.5}
                size={size}
                color={colors.text}
            ></Icon>
        </Pressable>
    );
};

export default BackButton;

const createStyles = (colors) =>
    StyleSheet.create({
        button: {
            alignSelf: "flex-start",
            padding: 5,
            borderRadius: theme.radius.sm,
            backgroundColor: colors.surface,
        },
    });
