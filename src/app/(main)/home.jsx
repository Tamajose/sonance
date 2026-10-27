import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../../assets/icons/Icon";
import { supabase } from "../../../lib/supabase";
import { fetchFollowingIds } from "../../../services/followService";
import {
    fetchFollowingPosts,
    fetchPosts,
    fetchRecommendedPosts,
} from "../../../services/postService";
import { getUserData } from "../../../services/userService";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme, useThemedStyles } from "../../contexts/ThemeContext";
import { hp, wp } from "../../helpers/common";

const FEEDS = [
    ["latest", "Latest"],
    ["forYou", "For you"],
    ["following", "Following"],
];

const Home = () => {
    const { styles, colors } = useThemedStyles(createStyles);
    const { isDark, toggleTheme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    const limitRef = useRef(0);
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [feed, setFeed] = useState("latest");

    // The realtime handler is registered once, so it reads these through refs
    const userIdRef = useRef(user?.id);
    const feedRef = useRef(feed);
    const followingRef = useRef(new Set());
    useEffect(() => {
        userIdRef.current = user?.id;
        feedRef.current = feed;
    });

    // Own posts never appear in the feed
    const loadFeed = (mode, count) => {
        if (mode === "forYou") return fetchRecommendedPosts(user.id, count);
        if (mode === "following") return fetchFollowingPosts(user.id, count);
        return fetchPosts(count, undefined, user.id);
    };

    const mounted = useRef(false);
    useFocusEffect(
        useCallback(() => {
            if (!user?.id) return;
            fetchFollowingIds(user.id).then((res) => {
                if (res.success) followingRef.current = new Set(res.data);
            });
            if (mounted.current && feedRef.current === "following") {
                loadFeed("following", Math.max(limitRef.current, 10)).then(
                    (res) => {
                        if (res.success) setPosts(res.data);
                    },
                );
            }
            mounted.current = true;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [user?.id]),
    );

    const getPosts = async () => {
        if (!hasMore) return null;

        limitRef.current += 10;

        let res = await loadFeed(feed, limitRef.current);
        if (res.success) {
            if (posts.length === res.data.length) setHasMore(false);
            setPosts(res.data);
        }
    };

    const switchFeed = async (mode) => {
        if (mode === feed) return;

        limitRef.current = 10;
        setFeed(mode);
        setHasMore(true);
        setPosts([]);

        let res = await loadFeed(mode, limitRef.current);
        if (res.success) setPosts(res.data);
    };

    const handlePostEvents = async (payload) => {
        if (payload.eventType == "INSERT" && payload?.new?.id) {
            let newPost = { ...payload.new };
            delete newPost.embedding;
            if (newPost.userId === userIdRef.current) return;
            if (
                feedRef.current === "following" &&
                !followingRef.current.has(newPost.userId)
            ) {
                return;
            }
            let res = await getUserData(newPost.userId);
            newPost.likes = [];
            newPost.comments = [{ count: 0 }];
            newPost.user = res.success ? res.data : {};
            setPosts((prevPosts) => [newPost, ...prevPosts]);
        }
        if (payload.eventType == "DELETE" && payload.old.id) {
            setPosts((prevPosts) => {
                let updatedPosts = prevPosts.filter(
                    (post) => post.id != payload.old.id,
                );
                return updatedPosts;
            });
        }
        if (payload.eventType == "UPDATE" && payload?.new?.id) {
            setPosts((prevPosts) => {
                let updatedPosts = prevPosts.map((post) => {
                    if (post.id == payload.new.id) {
                        post.body = payload.new.body;
                        post.file = payload.new.file;
                    }
                    return post;
                });
                return updatedPosts;
            });
        }
    };

    useEffect(() => {
        let postChannel = supabase
            .channel("posts_" + Date.now())
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "posts" },
                handlePostEvents,
            )
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
        };
    }, []);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Sonance</Text>
                    <Pressable
                        onPress={toggleTheme}
                        style={styles.themeButton}
                        accessibilityRole="button"
                        accessibilityLabel={
                            isDark
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        <Icon
                            name={isDark ? "sun" : "moon"}
                            size={hp(2.8)}
                            strokeWidth={2}
                            color={colors.text}
                        />
                    </Pressable>
                </View>

                <View style={styles.tabs}>
                    {FEEDS.map(([mode, label]) => (
                        <Pressable
                            key={mode}
                            onPress={() => switchFeed(mode)}
                            style={[
                                styles.tab,
                                feed === mode && styles.tabActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    feed === mode && styles.tabTextActive,
                                ]}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    ))}
                    <Pressable
                        onPress={() => router.push("search")}
                        style={styles.tab}
                    >
                        <Text style={styles.tabText}>Search</Text>
                    </Pressable>
                </View>

                <FlatList
                    data={posts}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <PostCard
                            item={item}
                            currentUser={user}
                            router={router}
                        />
                    )}
                    onEndReached={() => {
                        getPosts();
                    }}
                    onEndReachedThreshold={0}
                    ListFooterComponent={
                        hasMore ? (
                            <View
                                style={{
                                    marginVertical:
                                        posts.length === 0 ? 200 : 30,
                                }}
                            >
                                <Loading />
                            </View>
                        ) : (
                            <View style={{ marginVertical: 30 }}>
                                <Text style={styles.noPost}>
                                    {feed === "following" && posts.length === 0
                                        ? "Follow people to see their posts here"
                                        : "All Caught Up!"}
                                </Text>
                            </View>
                        )
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

export default Home;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            marginHorizontal: wp(4),
        },
        title: {
            color: colors.textDark,
            fontSize: hp(3.2),
            fontWeight: theme.fonts.bold,
        },
        themeButton: {
            padding: 9,
            borderRadius: 50,
            backgroundColor: colors.surface,
        },
        tabs: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: wp(4),
        },
        tab: {
            paddingVertical: 7,
            paddingHorizontal: 14,
            borderRadius: theme.radius.xl,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.darkLight,
        },
        tabActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        tabText: {
            fontSize: hp(1.8),
            color: colors.text,
        },
        tabTextActive: {
            color: colors.onPrimary,
            fontWeight: theme.fonts.semiBold,
        },
        listStyle: {
            paddingTop: 20,
            paddingHorizontal: wp(4),
        },
        noPost: {
            fontSize: hp(2),
            textAlign: "center",
            color: colors.text,
        },
    });
