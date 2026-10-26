import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import moment from "moment";
import { useCallback, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Icon from "../../../assets/icons/Icon";
import { supabase } from "../../../lib/supabase";
import { getSupabaseFileUrl } from "../../../services/imageService";
import { fetchPosts, fetchProfileStats } from "../../../services/postService";
import Avatar from "../../components/Avatar";
import Loading from "../../components/Loading";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import { hp, stripHtmlTags, wp } from "../../helpers/common";

const PAGE_SIZE = 18;
const GRID_COLUMNS = 3;
const GRID_GAP = 2;

const Profile = () => {
    const { styles } = useThemedStyles(createStyles);
    const { user } = useAuth();
    const router = useRouter();
    const { width } = useWindowDimensions();

    const limitRef = useRef(0);
    const loadingMoreRef = useRef(false);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loaded, setLoaded] = useState(false);

    const tileSize = Math.floor(
        (width - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    );

    const loadPosts = async (count) => {
        const res = await fetchPosts(count, user.id);
        if (res.success) {
            setPosts(res.data);
            setHasMore(res.data.length >= count);
        }
        setLoaded(true);
    };

    // Reload whenever the screen regains focus so deletes, edits and likes show up
    useFocusEffect(
        useCallback(() => {
            if (!user?.id) return;
            limitRef.current = Math.max(limitRef.current, PAGE_SIZE);
            loadPosts(limitRef.current);
            fetchProfileStats(user.id).then((res) => {
                if (res.success) setStats(res.data);
            });
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

    const openPost = (item) =>
        router.push({ pathname: "postDetails", params: { postId: item.id } });

    return (
        <ScreenWrapper>
            <FlatList
                data={posts}
                numColumns={GRID_COLUMNS}
                columnWrapperStyle={{ gap: GRID_GAP }}
                ListHeaderComponent={
                    <ProfileHeader
                        user={user}
                        stats={stats}
                        router={router}
                        handleLogout={handleLogout}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listStyle}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <PostTile
                        item={item}
                        size={tileSize}
                        onPress={() => openPost(item)}
                    />
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListEmptyComponent={
                    loaded ? (
                        <View style={styles.empty}>
                            <Icon name="image" size={hp(5)} strokeWidth={1.4} />
                            <Text style={styles.emptyText}>No posts yet</Text>
                        </View>
                    ) : (
                        <View style={{ marginVertical: 40 }}>
                            <Loading />
                        </View>
                    )
                }
            />
        </ScreenWrapper>
    );
};

const Stat = ({ value, label }) => {
    const { styles } = useThemedStyles(createStyles);

    return (
        <View style={styles.stat}>
            <Text style={styles.statValue}>{value ?? "–"}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
};

const ContactRow = ({ icon, label, value }) => {
    const { styles, colors } = useThemedStyles(createStyles);

    return (
        <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
                <Icon name={icon} size={hp(2.2)} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        </View>
    );
};

const ProfileHeader = ({ user, stats, router, handleLogout }) => {
    const { styles, colors } = useThemedStyles(createStyles);
    const avatarSize = hp(11);

    return (
        <View style={styles.header}>
            <View style={styles.topBar}>
                <Text style={styles.screenTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    accessibilityLabel="Log out"
                >
                    <Icon name="logout" size={hp(2.6)} color={colors.rose} />
                </TouchableOpacity>
            </View>

            <View style={styles.identityRow}>
                <View style={styles.avatarRing}>
                    <Avatar
                        uri={user?.image}
                        size={avatarSize}
                        rounded={avatarSize / 2}
                    />
                </View>
                <View style={styles.stats}>
                    <Stat value={stats?.posts} label="Posts" />
                    <Stat value={stats?.likes} label="Likes" />
                    <Stat
                        value={
                            user?.created_at
                                ? moment(user.created_at).format("MMM YYYY")
                                : null
                        }
                        label="Joined"
                    />
                </View>
            </View>

            <View style={styles.about}>
                <Text style={styles.name}>{user?.name}</Text>
                {!!user?.address && (
                    <View style={styles.locationRow}>
                        <Icon
                            name="location"
                            size={hp(2)}
                            color={colors.textLight}
                        />
                        <Text style={styles.location}>{user.address}</Text>
                    </View>
                )}
                {!!user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
            </View>

            {(!!user?.email || !!user?.phoneNumber) && (
                <View style={styles.contactCard}>
                    {!!user?.email && (
                        <ContactRow
                            icon="mail"
                            label="Email"
                            value={user.email}
                        />
                    )}
                    {!!user?.phoneNumber && (
                        <ContactRow
                            icon="phone"
                            label="Phone"
                            value={user.phoneNumber}
                        />
                    )}
                </View>
            )}

            <Pressable
                style={styles.editButton}
                onPress={() => router.push("/editProfile")}
            >
                <Icon name="edit" size={hp(2.2)} color={colors.text} />
                <Text style={styles.editButtonText}>Edit profile</Text>
            </Pressable>

            <View style={styles.gridHeader}>
                <Icon name="image" size={hp(2.4)} color={colors.primary} />
                <Text style={styles.gridTitle}>Posts</Text>
            </View>
        </View>
    );
};

const PostTile = ({ item, size, onPress }) => {
    const { styles } = useThemedStyles(createStyles);
    const isImage = item?.file?.includes("postImages");
    const isVideo = item?.file?.includes("postVideos");

    return (
        <Pressable
            onPress={onPress}
            style={[styles.tile, { width: size, height: size }]}
        >
            {isImage ? (
                <Image
                    source={getSupabaseFileUrl(item.file)}
                    contentFit="cover"
                    transition={100}
                    style={{ flex: 1 }}
                />
            ) : isVideo ? (
                <View style={styles.videoTile}>
                    <Icon name="video" size={hp(3.6)} color="white" />
                </View>
            ) : (
                <View style={styles.textTile}>
                    <Text style={styles.textTileBody} numberOfLines={6}>
                        {stripHtmlTags(item?.body)}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};

export default Profile;

const createStyles = (colors) =>
    StyleSheet.create({
        listStyle: {
            paddingBottom: 20,
            gap: GRID_GAP,
        },
        header: {
            paddingHorizontal: wp(4),
            gap: 18,
            marginBottom: 6,
        },
        topBar: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        screenTitle: {
            fontSize: hp(3),
            fontWeight: theme.fonts.bold,
            color: colors.textDark,
        },
        logoutButton: {
            padding: 9,
            borderRadius: 50,
            backgroundColor: colors.roseSoft,
        },
        identityRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: wp(6),
        },
        avatarRing: {
            padding: 3,
            borderRadius: 100,
            borderWidth: 2.5,
            borderColor: colors.primary,
        },
        stats: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
        },
        stat: {
            alignItems: "center",
            gap: 2,
        },
        statValue: {
            fontSize: hp(2.2),
            fontWeight: theme.fonts.bold,
            color: colors.textDark,
        },
        statLabel: {
            fontSize: hp(1.5),
            color: colors.textLight,
        },
        about: {
            gap: 5,
        },
        name: {
            fontSize: hp(2.7),
            fontWeight: theme.fonts.bold,
            color: colors.textDark,
        },
        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        location: {
            fontSize: hp(1.7),
            fontWeight: theme.fonts.medium,
            color: colors.textLight,
        },
        bio: {
            marginTop: 4,
            fontSize: hp(1.75),
            lineHeight: hp(2.6),
            color: colors.text,
        },
        contactCard: {
            gap: 14,
            padding: 14,
            borderRadius: theme.radius.xl,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.darkLight,
            backgroundColor: colors.card,
        },
        contactRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        contactIcon: {
            height: hp(4.4),
            width: hp(4.4),
            borderRadius: theme.radius.md,
            borderCurve: "continuous",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
        },
        contactLabel: {
            fontSize: hp(1.4),
            color: colors.textLight,
        },
        contactValue: {
            fontSize: hp(1.8),
            fontWeight: theme.fonts.medium,
            color: colors.textDark,
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
        gridHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 10,
            borderBottomWidth: 2,
            borderBottomColor: colors.primary,
        },
        gridTitle: {
            fontSize: hp(1.9),
            fontWeight: theme.fonts.semiBold,
            color: colors.textDark,
        },
        tile: {
            overflow: "hidden",
            backgroundColor: colors.gray,
        },
        videoTile: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#22262D",
        },
        textTile: {
            flex: 1,
            padding: 9,
            justifyContent: "center",
            backgroundColor: colors.gray,
        },
        textTileBody: {
            fontSize: hp(1.45),
            color: colors.text,
        },
        empty: {
            alignItems: "center",
            gap: 10,
            marginTop: 50,
        },
        emptyText: {
            fontSize: hp(1.9),
            color: colors.textLight,
        },
    });
