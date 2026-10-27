import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import Text from "../../components/AppText";
import Icon from "../../../assets/icons/Icon";
import { supabase } from "../../../lib/supabase";
import { fetchFollowCounts } from "../../../services/followService";
import { fetchPosts, fetchProfileStats } from "../../../services/postService";
import ProfileView from "../../components/ProfileView";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { hp } from "../../helpers/common";

const PAGE_SIZE = 18;

const Profile = () => {
    const { styles, colors } = useThemedStyles(createStyles);
    const { user } = useAuth();
    const router = useRouter();

    const limitRef = useRef(0);
    const loadingMoreRef = useRef(false);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loaded, setLoaded] = useState(false);

    const loadPosts = async (count) => {
        const res = await fetchPosts(count, user.id);
        if (res.success) {
            setPosts(res.data);
            setHasMore(res.data.length >= count);
        }
        setLoaded(true);
    };

    const loadStats = async () => {
        const [postStats, followCounts] = await Promise.all([
            fetchProfileStats(user.id),
            fetchFollowCounts(user.id),
        ]);
        setStats((prev) => ({
            ...prev,
            ...(postStats.success ? postStats.data : {}),
            ...(followCounts.success ? followCounts.data : {}),
        }));
    };

    useFocusEffect(
        useCallback(() => {
            if (!user?.id) return;
            limitRef.current = Math.max(limitRef.current, PAGE_SIZE);
            loadPosts(limitRef.current);
            loadStats();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [user?.id]),
    );

    const loadMore = async () => {
        if (!hasMore || loadingMoreRef.current || !loaded) return;
        loadingMoreRef.current = true;
        limitRef.current += PAGE_SIZE;
        await loadPosts(limitRef.current);
        loadingMoreRef.current = false;
    };

    const onLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.log(error);
    };

    const handleLogout = () => {
        if (Platform.OS === "web") {
            if (window.confirm("Are you sure you want to log out?")) {
                onLogout();
            }
        } else {
            Alert.alert("Confirm", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    onPress: () => onLogout(),
                    style: "destructive",
                },
            ]);
        }
    };

    return (
        <ScreenWrapper>
            <ProfileView
                profile={user}
                stats={stats}
                posts={posts}
                loaded={loaded}
                onEndReached={loadMore}
                onPressPost={(item) =>
                    router.push({
                        pathname: "postDetails",
                        params: { postId: item.id },
                    })
                }
                showContact
                topRight={
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        accessibilityLabel="Log out"
                    >
                        <Icon
                            name="logout"
                            size={hp(2.6)}
                            color={colors.rose}
                        />
                    </TouchableOpacity>
                }
                actions={
                    <Pressable
                        style={styles.editButton}
                        onPress={() => router.push("/editProfile")}
                    >
                        <Icon name="edit" size={hp(2.2)} color={colors.text} />
                        <Text style={styles.editButtonText}>Edit profile</Text>
                    </Pressable>
                }
            />
        </ScreenWrapper>
    );
};

export default Profile;

const createStyles = (colors) =>
    StyleSheet.create({
        logoutButton: {
            padding: 9,
            borderRadius: 50,
            backgroundColor: colors.roseSoft,
        },
        editButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 11,
            borderRadius: theme.radius.lg,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.darkLight,
            backgroundColor: colors.surface,
        },
        editButtonText: {
            fontSize: hp(1.8),
            fontWeight: theme.fonts.semiBold,
            color: colors.text,
        },
    });
