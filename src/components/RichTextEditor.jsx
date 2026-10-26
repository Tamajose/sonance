import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    RichEditor,
    RichToolbar,
    actions,
} from "react-native-pell-rich-editor";
import { theme } from "../constants/theme";
import { useThemedStyles } from "../contexts/ThemeContext";

const RichTextEditor = ({ editorRef, onChange }) => {
    const { styles, colors } = useThemedStyles(createStyles);

    // The editor runs in a WebView, so its colors are passed in as CSS values
    const editorStyle = useMemo(
        () => ({
            backgroundColor: colors.card,
            color: colors.text,
            placeholderColor: colors.textLight,
            caretColor: colors.primary,
        }),
        [colors],
    );

    return (
        <View style={{ minHeight: 250 }}>
            <RichToolbar
                actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.insertBulletsList,
                    actions.insertOrderedList,
                    actions.setStrikethrough,
                    actions.setUnderline,
                    actions.removeFormat,
                    actions.checkboxList,
                    actions.blockquote,
                    actions.alignLeft,
                    actions.alignRight,
                    actions.alignCenter,
                    actions.code,
                    actions.line,
                    actions.heading1,
                    actions.heading4,
                ]}
                iconMap={{
                    [actions.heading1]: ({ tintColor }) => (
                        <Text style={{ color: tintColor }}>H1</Text>
                    ),
                    [actions.heading4]: ({ tintColor }) => (
                        <Text style={{ color: tintColor }}>H4</Text>
                    ),
                }}
                style={styles.richBar}
                flatContainerStyle={styles.flatStyle}
                iconTint={colors.text}
                selectedIconTint={colors.primary}
                editor={editorRef}
                disabled={false}
            />

            <RichEditor
                ref={editorRef}
                containerStyle={styles.rich}
                editorStyle={editorStyle}
                placeholder={"What's on your mind"}
                onChange={onChange}
            />
        </View>
    );
};

export default RichTextEditor;

const createStyles = (colors) =>
    StyleSheet.create({
        richBar: {
            borderTopRightRadius: theme.radius.xl,
            borderTopLeftRadius: theme.radius.xl,
            backgroundColor: colors.gray,
        },
        rich: {
            minHeight: 200,
            flex: 1,
            borderWidth: 1.5,
            borderTopWidth: 0,
            borderBottomLeftRadius: theme.radius.xl,
            borderBottomRightRadius: theme.radius.xl,
            borderColor: colors.gray,
            padding: 5,
        },
        flatStyle: {
            paddingHorizontal: 8,
            gap: 5,
        },
    });
