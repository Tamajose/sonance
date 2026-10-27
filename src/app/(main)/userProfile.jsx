import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../../assets/icons/Icon";
import {
    fetchFollowCounts,
    fetchIsFollowing,
    followUser,
    unfollowUser,
} from "../../../services/followService";
import { createNotification } from "../../../services/notificationService";
import { fetchPosts, fetchProfileStats } from "../../../services/postService";
import { getUserData } from "../../../services/userService";
import Loading from "../../components/Loading";
import ProfileView from "../../components/ProfileView";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { hp } from "../../helpers/common";

const PAGE_SIZE = 18;

const UserProfile = () => {
    const { styles, colors } = useThemedStyles(createStyles);
    const { userId } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();

    const limitRef = useRef(PAGE_SIZE);
    const loadingMoreRef = useRef(false);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [counts, setCounts] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const isSelf = !!user?.id && user.id === userId;

    const loadPosts = async (count) => {
        const res = await fetchPosts(count, userId);
        if (res.success) {
            setPosts(res.data);
            setHasMore(res.data.length >= count);
        }
        setLoaded(true);
    };

    const loadCounts = async () => {
        const [postStats, followCounts] = await Promise.all([
            fetchProfileStats(userId),
            fetchFollowCounts(userId),
        ]);
        setCounts((prev) => ({
            ...prev,
            ...(postStats.success ? postStats.data : {}),
            ...(followCounts.success ? followCounts.data : {}),
        }));
    };

    useFocusEffect(
        useCallback(() => {
            if (isSelf) {
                router.replace("/profile");
                return;
            }
            if (!user?.id || !userId) return;

            getUserData(userId).then((res) => {
                if (res.success) setProfile(res.data);
                else setNotFound(true);
            });
            fetchIsFollowing(user.id, userId).then((res) => {
                if (res.success) setIsFollowing(res.data);
            });
            loadCounts();
            loadPosts(limitRef.current);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [user?.id, userId]),
    );

    const loadMore = async () => {
        if (!hasMore || loadingMoreRef.current || !loaded) return;
        loadingMoreRef.current = true;
        limitRef.current += PAGE_SIZE;
        await loadPosts(limitRef.current);
        loadingMoreRef.current = false;
    };

    const onToggleFollow = async () => {
        if (followBusy) return;
        setFollowBusy(true);

        const next = !isFollowing;
        setIsFollowing(next);
        setCounts((prev) => ({
            ...prev,
            followers: Math.max(0, (prev?.followers ?? 0) + (next ? 1 : -1)),
        }));

        const res = next
            ? await followUser(user.id, userId)
            : await unfollowUser(user.id, userId);

        if (!res.success) {
            setIsFollowing(!next);
            loadCounts();
            Alert.alert("Follow", res.msg);
        } else if (next) {
            createNotification({
                senderId: user.id,
                receiverId: userId,
                title: "started following you",
                data: JSON.stringify({ userId: user.id }),
            });
        }
        setFollowBusy(false);
    };

    if (notFound) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <Text style={styles.message}>User not found</Text>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.link}>Go back</Text>
                    </Pressable>
                </View>
            </ScreenWrapper>
        );
    }

    if (!profile) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <Loading />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ProfileView
                profile={profile}
                stats={counts}
                posts={posts}
                loaded={loaded}
                onEndReached={loadMore}
                onPressPost={(item) =>
                    router.push({
                        pathname: "postDetails",
                        params: { postId: item.id },
                    })
                }
                showBack
                title="Profile"
                actions={
                    <Pressable
                        style={[
                            styles.followButton,
                            isFollowing && styles.followingButton,
                        ]}
                        onPress={onToggleFollow}
                        disabled={followBusy}
                        accessibilityRole="button"
                        accessibilityLabel={isFollowing ? "Unfollow" : "Follow"}
                    >
                        <Icon
                            name={isFollowing ? "user" : "plus"}
                            size={hp(2.2)}
                            strokeWidth={2.2}
                            color={isFollowing ? colors.text : colors.onPrimary}
                        />
                        <Text
                            style={[
                                styles.followText,
                                isFollowing && styles.followingText,
                            ]}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </Text>
                    </Pressable>
                }
            />
        </ScreenWrapper>
    );
};

export default UserProfile;

const createStyles = (colors) =>
    StyleSheet.create({
        center: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        },
        message: {
            fontSize: hp(2),
            color: colors.textLight,
        },
        link: {
            fontSize: hp(1.9),
            fontWeight: theme.fonts.semiBold,
            color: colors.primary,
        },
        followButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 11,
            borderRadius: theme.radius.lg,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.primary,
            backgroundColor: colors.primary,
        },
        followingButton: {
            borderColor: colors.darkLight,
            backgroundColor: colors.surface,
        },
        followText: {
            fontSize: hp(1.8),
            fontWeight: theme.fonts.semiBold,
            color: colors.onPrimary,
        },
        followingText: {
            color: colors.text,
        },
    });
