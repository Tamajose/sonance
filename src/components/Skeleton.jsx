import { useEffect, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { theme } from "../constants/theme";
import { useThemedStyles } from "../contexts/ThemeContext";
import { hp, wp } from "../helpers/common";

export const Skeleton = ({
    width = "100%",
    height = 14,
    radius = 8,
    style,
}) => {
    const { styles } = useThemedStyles(createStyles);
    const [opacity] = useState(() => new Animated.Value(0.55));

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 750,
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(opacity, {
                    toValue: 0.55,
                    duration: 750,
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.block,
                { width, height, borderRadius: radius, opacity },
                style,
            ]}
        />
    );
};

// Mirrors the layout of PostCard
export const PostSkeleton = () => {
    const { styles } = useThemedStyles(createStyles);

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Skeleton
                    width={hp(4.5)}
                    height={hp(4.5)}
                    radius={theme.radius.md}
                />
                <View style={{ gap: 6 }}>
                    <Skeleton width={wp(30)} height={12} />
                    <Skeleton width={wp(16)} height={10} />
                </View>
            </View>
            <Skeleton height={12} />
            <Skeleton width="70%" height={12} />
            <Skeleton height={hp(28)} radius={theme.radius.xl} />
        </View>
    );
};

export const NotificationSkeleton = () => {
    const { styles } = useThemedStyles(createStyles);

    return (
        <View style={[styles.card, styles.row, { marginBottom: 10 }]}>
            <Skeleton width={hp(5)} height={hp(5)} radius={theme.radius.md} />
            <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="45%" height={12} />
                <Skeleton width="70%" height={10} />
            </View>
        </View>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        block: {
            backgroundColor: colors.surface,
        },
        card: {
            gap: 12,
            marginBottom: 15,
            padding: 14,
            borderRadius: theme.radius.xxl,
            borderCurve: "continuous",
            backgroundColor: colors.card,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
    });
