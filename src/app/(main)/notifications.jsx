import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Text from "../../components/AppText";
import { fetchNotifications } from "../../../services/notificationService";
import Header from "../../components/Header";
import NotificationItem from "../../components/NotificationItem";
import ScreenWrapper from "../../components/ScreenWrapper";
import { NotificationSkeleton } from "../../components/Skeleton";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { useThemedStyles } from "../../contexts/ThemeContext";

const Notifications = () => {
    const { styles } = useThemedStyles(createStyles);
    const [notifications, setNotifications] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const userId = user?.id;
    useFocusEffect(
        useCallback(() => {
            if (!userId) return;
            fetchNotifications(userId).then((res) => {
                if (res.success) setNotifications(res.data);
                setLoaded(true);
            });
        }, [userId]),
    );

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Header title="Notifications" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                >
                    {notifications.map((item) => {
                        return (
                            <NotificationItem
                                item={item}
                                key={item?.id}
                                router={router}
                            />
                        );
                    })}
                    {!loaded && (
                        <>
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                        </>
                    )}
                    {loaded && notifications.length == 0 && (
                        <Text style={styles.noData}>No Notifications</Text>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default Notifications;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(4),
        },
        listStyle: {
            paddingVertical: 20,
            gap: 10,
        },
        noData: {
            fontSize: hp(1.8),
            fontWeight: theme.fonts.medium,
            color: colors.text,
            textAlign: "center",
        },
    });
