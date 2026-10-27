import moment from "moment";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "./AppText";
import Icon from "../../assets/icons/Icon";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Avatar from "./Avatar";
import { useThemedStyles } from "../contexts/ThemeContext";

const CommentItem = ({
    item,
    canDelete = false,
    onDelete = () => {},
    highlight = false,
}) => {
    const { styles, colors } = useThemedStyles(createStyles);
    const createdAt = moment(item?.created_at).format("MMM D");

    const handleDelete = () => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to delete this comment?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Modal cancelled"),
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => onDelete(item),
                    style: "destructive",
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            <Avatar uri={item?.user?.image} />
            <View style={[styles.content, highlight && styles.highlight]}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View style={styles.nameContainer}>
                        <Text style={styles.text}>{item?.user?.name}</Text>
                        <Text style={{ fontWeight: "bold", color: colors.textLight }}>
                            ·····
                        </Text>
                        <Text
                            style={[
                                styles.text,
                                { color: colors.textLight },
                            ]}
                        >
                            {createdAt}
                        </Text>
                    </View>
                    {canDelete && (
                        <TouchableOpacity onPress={handleDelete}>
                            <Icon
                                name="delete"
                                size={20}
                                color={colors.rose}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={[styles.text, { fontWeight: "normal" }]}>
                    {item?.text}
                </Text>
            </View>
        </View>
    );
};

export default CommentItem;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "row",
            gap: 7,
        },
        content: {
            backgroundColor: colors.surface,
            flex: 1,
            gap: 5,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: theme.radius.md,
            borderCurve: "continuous",
        },
        highlight: {
            borderWidth: 0.2,
            backgroundColor: colors.card,
            borderColor: colors.dark,
            shadowColor: colors.dark,
            shadowOffset: { height: 0, width: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
        },
        nameContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
        },
        text: {
            fontSize: hp(1.6),
            fontWeight: theme.fonts.medium,
            color: colors.textDark,
        },
    });
