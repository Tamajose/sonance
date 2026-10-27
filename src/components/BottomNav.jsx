import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../assets/icons/Icon";
import { supabase } from "../../lib/supabase";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { useThemedStyles } from "../contexts/ThemeContext";
import { hp } from "../helpers/common";

const TABS = [
    { key: "home", label: "Home", icon: "home", path: "/home", match: ["/home", "/search", "/userProfile"] },
    { key: "notifications", label: "Alerts", icon: "heart", path: "/notifications", match: ["/notifications"] },
    { key: "newPost", label: "Post", icon: "plus", path: "/newPost", match: ["/newPost"] },
    { key: "profile", label: "Profile", icon: "user", path: "/profile", match: ["/profile", "/editProfile"] },
];

const HIDDEN_ROUTES = ["/", "/welcome", "/login", "/signUp"];

const BottomNav = () => {
    const { styles, colors } = useThemedStyles(createStyles);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();

    const [unread, setUnread] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        pathnameRef.current = pathname;
    });

    useEffect(() => {
        const show = Keyboard.addListener("keyboardDidShow", () =>
            setKeyboardVisible(true),
        );
        const hide = Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardVisible(false),
        );
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel("nav_notifications_" + Date.now())
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `receiverId=eq.${user.id}`,
                },
                () => {
                    if (pathnameRef.current !== "/notifications") {
                        setUnread((prev) => prev + 1);
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    if (!user || HIDDEN_ROUTES.includes(pathname) || keyboardVisible) {
        return null;
    }

    const activeKey = TABS.find((tab) => tab.match.includes(pathname))?.key;

    const onPress = (tab) => {
        if (tab.key === "notifications") setUnread(0);
        router.navigate(tab.path);
    };

    return (
        <View style={[styles.wrapper, { paddingBottom: Math.max(bottom, 12) }]}>
            <View style={styles.pill}>
                {TABS.map((tab) => {
                    const active = tab.key === activeKey;
                    const badge = tab.key === "notifications" && !active ? unread : 0;

                    return (
                        <Pressable
                            key={tab.key}
                            onPress={() => onPress(tab)}
                            accessibilityRole="tab"
                            accessibilityLabel={tab.label}
                            accessibilityState={{ selected: active }}
                            style={[styles.item, active && styles.itemActive]}
                        >
                            <View>
                                <Icon
                                    name={tab.icon}
                                    size={hp(2.8)}
                                    strokeWidth={active ? 2.3 : 1.9}
                                    color={active ? colors.onPrimary : colors.textLight}
                                />
                                {badge > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {badge > 9 ? "9+" : badge}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {active && <Text style={styles.label}>{tab.label}</Text>}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

export default BottomNav;

const createStyles = (colors) =>
    StyleSheet.create({
        wrapper: {
            paddingHorizontal: 20,
            paddingTop: 8,
            backgroundColor: colors.background,
        },
        pill: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 6,
            borderRadius: 40,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.darkLight,
            backgroundColor: colors.card,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
        },
        item: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 30,
            borderCurve: "continuous",
        },
        itemActive: {
            backgroundColor: colors.primary,
        },
        label: {
            color: colors.onPrimary,
            fontSize: hp(1.7),
            fontWeight: theme.fonts.semiBold,
        },
        badge: {
            position: "absolute",
            top: -7,
            right: -9,
            minWidth: 17,
            height: 17,
            paddingHorizontal: 4,
            borderRadius: 9,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.rose,
        },
        badgeText: {
            color: colors.onPrimary,
            fontSize: hp(1.2),
            fontWeight: theme.fonts.bold,
        },
    });
