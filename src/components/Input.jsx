import { StyleSheet, TextInput, View } from "react-native";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import { useThemedStyles } from "../contexts/ThemeContext";

const Input = (props) => {
    const { styles, colors } = useThemedStyles(createStyles);

    return (
        <View
            style={[
                styles.container,
                props.containerStyle,
                props.containerStyles,
            ]}
        >
            {props.icon && props.icon}
            <TextInput
                style={{ flex: 1, color: colors.text }}
                placeholderTextColor={colors.textLight}
                ref={props.inputRef && props.inputRef}
                {...props}
            />
        </View>
    );
};

export default Input;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            height: hp(7.2),
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 0.4,
            borderColor: colors.text,
            borderRadius: theme.radius.xxl,
            borderCurve: "continuous",
            paddingHorizontal: 18,
            gap: 12,
        },
    });
