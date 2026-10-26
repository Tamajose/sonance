import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Loading from "./Loading";
import { useThemedStyles } from "../contexts/ThemeContext";

const Button = ({
    buttonStyle,
    textStyle,
    title = "",
    onPress = () => {},
    loading = false,
    hasShadow = true,
}) => {
    const { styles, colors } = useThemedStyles(createStyles);

    const shadowStyle = {
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    };

    if (loading) {
        return (
            <View
                style={[
                    styles.button,
                    buttonStyle,
                    { backgroundColor: colors.card },
                ]}
            >
                <Loading />
            </View>
        );
    }
    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, buttonStyle, hasShadow && shadowStyle]}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    );
};

export default Button;

const createStyles = (colors) =>
    StyleSheet.create({
        button: {
            backgroundColor: colors.primary,
            height: hp(6.6),
            justifyContent: "center",
            alignItems: "center",
            borderCurve: "continuous",
            borderRadius: theme.radius.xl,
        },
        text: {
            fontSize: hp(2.5),
            color: "white",
            fontWeight: theme.fonts.bold,
        },
    });
