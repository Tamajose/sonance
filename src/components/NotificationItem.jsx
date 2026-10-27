import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import { useThemedStyles } from "../contexts/ThemeContext";

const NotificationItem = ({ item, router }) => {
    const { styles, colors } = useThemedStyles(createStyles);

    const handleClick = () => {
        let { postId, commentId, userId } = JSON.parse(item?.data);
        if (userId) {
            router.push({ pathname: "userProfile", params: { userId } });
            return;
        }
        router.push({ pathname: "postDetails", params: { postId, commentId } });
    };

    const createdAt = moment(item?.created_at).format("MMM D");

    return (
        <TouchableOpacity style={styles.container} onPress={handleClick}>
            <Avatar uri={item?.sender?.image} size={hp(5)} />
            <View style={styles.nameTitle}>
                <Text style={styles.text}>{item?.sender?.name}</Text>
                <Text style={[styles.text, { color: colors.textDark }]}>
                    {item?.title}
                </Text>
            </View>
            <Text style={[styles.text, { color: colors.textLight }]}>
                {createdAt}
            </Text>
        </TouchableOpacity>
    );
};

export default NotificationItem;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            backgroundColor: colors.card,
            borderWidth: 0.5,
            borderColor: colors.darkLight,
            padding: 15,
            borderRadius: theme.radius.xxl,
            borderCurve: "continuous",
        },
        nameTitle: {
            flex: 1,
            gap: 2,
        },
        text: {
            fontSize: hp(1.6),
            fontWeight: theme.fonts.medium,
            color: colors.text,
        },
    });
