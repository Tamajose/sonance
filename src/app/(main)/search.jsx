import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Text from "../../components/AppText";
import { searchPosts } from "../../../services/postService";
import Header from "../../components/Header";
import PostCard from "../../components/PostCard";
import ScreenWrapper from "../../components/ScreenWrapper";
import { PostSkeleton } from "../../components/Skeleton";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { useThemedStyles } from "../../contexts/ThemeContext";

const Search = () => {
    const { styles, colors } = useThemedStyles(createStyles);
    const { user } = useAuth();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const onSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        const res = await searchPosts(query.trim());
        setLoading(false);
        setSearched(true);
        setPosts(res.success ? res.data : []);
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Header title="Search" />
                <View style={styles.searchRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search by meaning, e.g. concert"
                        placeholderTextColor={colors.textLight}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={onSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.button} onPress={onSearch}>
                        <Text style={styles.buttonText}>Go</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <View>
                        <PostSkeleton />
                        <PostSkeleton />
                    </View>
                ) : (
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
                        ListEmptyComponent={
                            searched ? (
                                <Text style={styles.empty}>
                                    No matching posts
                                </Text>
                            ) : null
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default Search;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(4),
            gap: 12,
        },
        searchRow: {
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
        },
        input: {
            flex: 1,
            height: hp(6),
            borderWidth: 0.4,
            borderColor: colors.text,
            borderRadius: theme.radius.xl,
            borderCurve: "continuous",
            paddingHorizontal: 18,
            fontSize: hp(1.9),
            color: colors.text,
        },
        button: {
            height: hp(6),
            paddingHorizontal: 20,
            justifyContent: "center",
            borderRadius: theme.radius.xl,
            borderCurve: "continuous",
            backgroundColor: colors.primary,
        },
        buttonText: {
            color: "white",
            fontSize: hp(2),
            fontWeight: theme.fonts.bold,
        },
        listStyle: {
            paddingTop: 10,
        },
        empty: {
            textAlign: "center",
            marginTop: 40,
            fontSize: hp(2),
            color: colors.textLight,
        },
    });
