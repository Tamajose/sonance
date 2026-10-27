import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import Icon from "../../assets/icons/Icon";
import { getSupabaseFileUrl } from "../../services/imageService";
import { theme } from "../constants/theme";
import { useThemedStyles } from "../contexts/ThemeContext";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import BackButton from "./BackButton";
import Loading from "./Loading";

const GRID_COLUMNS = 3;
const GRID_GAP = 2;

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

const ProfileHeader = ({
    profile,
    stats,
    title,
    showBack,
    topRight,
    showContact,
    actions,
}) => {
    const { styles, colors } = useThemedStyles(createStyles);
    const router = useRouter();
    const avatarSize = hp(11);

    return (
        <View style={styles.header}>
            <View style={styles.topBar}>
                <View style={styles.topBarSide}>
                    {showBack && <BackButton router={router} />}
                </View>
                <Text style={styles.screenTitle}>{title}</Text>
                <View style={[styles.topBarSide, styles.topBarRight]}>
                    {topRight}
                </View>
            </View>

            <View style={styles.identityRow}>
                <View style={styles.avatarRing}>
                    <Avatar
                        uri={profile?.image}
                        size={avatarSize}
                        rounded={avatarSize / 2}
                    />
                </View>
                <View style={styles.stats}>
                    <Stat value={stats?.posts} label="Posts" />
                    <Stat value={stats?.followers} label="Followers" />
                    <Stat value={stats?.following} label="Following" />
                </View>
            </View>

            <View style={styles.about}>
                <Text style={styles.name}>{profile?.name}</Text>
                {!!profile?.address && (
                    <View style={styles.locationRow}>
                        <Icon
                            name="location"
                            size={hp(2)}
                            color={colors.textLight}
                        />
                        <Text style={styles.location}>{profile.address}</Text>
                    </View>
                )}
                {!!profile?.bio && (
                    <Text style={styles.bio}>{profile.bio}</Text>
                )}
            </View>

            {showContact && (!!profile?.email || !!profile?.phoneNumber) && (
                <View style={styles.contactCard}>
                    {!!profile?.email && (
                        <ContactRow
                            icon="mail"
                            label="Email"
                            value={profile.email}
                        />
                    )}
                    {!!profile?.phoneNumber && (
                        <ContactRow
                            icon="phone"
                            label="Phone"
                            value={profile.phoneNumber}
                        />
                    )}
                </View>
            )}

            {actions}

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

const ProfileView = ({
    profile,
    stats,
    posts,
    loaded,
    onEndReached,
    onPressPost,
    title = "Profile",
    showBack = false,
    topRight = null,
    showContact = false,
    actions = null,
}) => {
    const { styles } = useThemedStyles(createStyles);
    const { width } = useWindowDimensions();

    const tileSize = Math.floor(
        (width - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    );

    return (
        <FlatList
            data={posts}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={{ gap: GRID_GAP }}
            ListHeaderComponent={
                <ProfileHeader
                    profile={profile}
                    stats={stats}
                    title={title}
                    showBack={showBack}
                    topRight={topRight}
                    showContact={showContact}
                    actions={actions}
                />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listStyle}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <PostTile
                    item={item}
                    size={tileSize}
                    onPress={() => onPressPost(item)}
                />
            )}
            onEndReached={onEndReached}
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
    );
};

export default ProfileView;

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
        topBarSide: {
            minWidth: 44,
        },
        topBarRight: {
            alignItems: "flex-end",
        },
        screenTitle: {
            fontSize: hp(3),
            fontWeight: theme.fonts.bold,
            color: colors.textDark,
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
