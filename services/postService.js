import { supabase } from "../lib/supabase";
import {
    analyzeContent,
    embedText,
    moderateContent,
    stripHtml,
} from "./aiService";
import { uploadFile } from "./imageService";

const POST_COLUMNS = "id, created_at, body, file, userId, tags";

export const createOrUpdatePost = async (post) => {
    try {
        const text = stripHtml(post.body);
        const isLocalImage =
            post.file &&
            typeof post.file == "object" &&
            post.file.type == "image";
        const imageBase64 = isLocalImage ? post.file.base64 : undefined;

        if (!(await moderateContent({ text, imageBase64 }))) {
            return {
                success: false,
                msg: "This post violates community guidelines",
            };
        }

        if (post.file && typeof post.file == "object") {
            let isImage = post?.file?.type == "image";
            let folderName = isImage ? "postImages" : "postVideos";
            let fileResult = await uploadFile(
                folderName,
                post?.file?.uri,
                isImage,
            );
            if (fileResult.success) post.file = fileResult.data;
            else {
                return fileResult;
            }
        }

        if (!post.tags || !post.tags.length) {
            const meta = await analyzeContent({ text, imageBase64 });
            if (meta.success) {
                post.tags = meta.data.tags;
                post.caption = meta.data.caption;
            }
        }
        const embedding = await embedText(text || post.caption || "");
        if (embedding) post.embedding = JSON.stringify(embedding);
        delete post.caption;

        const { data, error } = await supabase
            .from("posts")
            .upsert(post)
            .select()
            .single();

        if (error) {
            console.log("Error in post creation: ", error);
            return { success: false, msg: "Could not create post" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("Error in post creation: ", error);
        return { success: false, msg: "Could not create post" };
    }
};

export const fetchPosts = async (limit = 10, userId, excludeUserId) => {
    try {
        let query = supabase
            .from("posts")
            .select(
                `${POST_COLUMNS}, user: users (id, name, image), postLikes(*), comments(count)`,
            )
            .order("created_at", { ascending: false })
            .limit(limit);

        if (userId) query = query.eq("userId", userId);
        if (excludeUserId) query = query.neq("userId", excludeUserId);

        const { data, error } = await query;

        if (error) {
            console.log("Error in post fetching: ", error);
            return { success: false, msg: "Could not fetch posts" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("Error in post fetching: ", error);
        return { success: false, msg: "Could not fetch posts" };
    }
};

export const likePost = async (postLike) => {
    try {
        const { data, error } = await supabase
            .from("postLikes")
            .insert(postLike)
            .select()
            .single();

        if (error) {
            console.log("Error in liking post: ", error);
            return { success: false, msg: "Could not like post" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("Error in liking post: ", error);
        return { success: false, msg: "Could not like post" };
    }
};

export const unlikePost = async (postId, userId) => {
    try {
        const { error } = await supabase
            .from("postLikes")
            .delete()
            .eq("userId", userId)
            .eq("postId", postId);

        if (error) {
            console.log("Error in unliking post: ", error);
            return { success: false, msg: "Could not unlike post" };
        }

        return { success: true };
    } catch (error) {
        console.log("Error in unliking post: ", error);
        return { success: false, msg: "Could not unlike post" };
    }
};

export const fetchPostDetails = async (postId) => {
    try {
        const { data, error } = await supabase
            .from("posts")
            .select(
                `${POST_COLUMNS}, user: users (id, name, image), postLikes(*), comments(*, user: users(id, name, image))`,
            )
            .eq("id", postId)
            .order("created_at", { ascending: false, foreignTable: "comments" })
            .single();

        if (error) {
            console.log("Post details error: ", error);
            return { success: false, msg: "Could not fetch posts" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("Post details error: ", error);
        return { success: false, msg: "Could not fetch posts" };
    }
};

export const createComment = async (comment) => {
    if (!(await moderateContent({ text: comment.text }))) {
        return {
            success: false,
            msg: "This comment violates community guidelines",
        };
    }
    try {
        const { data, error } = await supabase
            .from("comments")
            .insert(comment)
            .select()
            .single();

        if (error) {
            console.log("Error in commenting: ", error);
            return { success: false, msg: "Could not comment" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("Error in commenting: ", error);
        return { success: false, msg: "Could not comment" };
    }
};

export const removeComment = async (commentId) => {
    try {
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            console.log("Error in deleting comment: ", error);
            return { success: false, msg: "Could not delete comment" };
        }

        return { success: true, data: { commentId } };
    } catch (error) {
        console.log("Error in deleting comment: ", error);
        return { success: false, msg: "Could not delete comment" };
    }
};

export const removePost = async (postId) => {
    try {
        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", postId);

        if (error) {
            console.log("Error in deleting post: ", error);
            return { success: false, msg: "Could not delete post" };
        }

        return { success: true, data: { postId } };
    } catch (error) {
        console.log("Error in deleting post: ", error);
        return { success: false, msg: "Could not delete post" };
    }
};

const fetchByIds = async (ids) => {
    try {
        const { data, error } = await supabase
            .from("posts")
            .select(
                `${POST_COLUMNS}, user: users (id, name, image), postLikes(*), comments(count)`,
            )
            .in("id", ids);

        if (error) {
            console.log("Error in fetching posts by id: ", error);
            return { success: false, msg: "Could not fetch posts" };
        }

        const order = new Map(ids.map((id, i) => [id, i]));
        data.sort((a, b) => order.get(a.id) - order.get(b.id));
        return { success: true, data: data };
    } catch (error) {
        console.log("Error in fetching posts by id: ", error);
        return { success: false, msg: "Could not fetch posts" };
    }
};

export const searchPosts = async (query) => {
    try {
        const embedding = await embedText(query);
        if (!embedding) return { success: false, msg: "Search unavailable" };

        const { data, error } = await supabase.rpc("match_posts", {
            query_embedding: JSON.stringify(embedding),
            match_count: 10,
        });

        if (error) {
            console.log("Error in searching posts: ", error);
            return { success: false, msg: "Could not search posts" };
        }

        if (!data.length) return { success: true, data: [] };
        return fetchByIds(data.map((p) => p.id));
    } catch (error) {
        console.log("Error in searching posts: ", error);
        return { success: false, msg: "Could not search posts" };
    }
};

export const fetchRecommendedPosts = async (userId, limit = 10) => {
    try {
        const { data, error } = await supabase.rpc("recommended_posts", {
            uid: userId,
            lim: limit,
        });

        if (error) {
            console.log("Error in fetching recommended posts: ", error);
            return { success: false, msg: "Could not fetch posts" };
        }

        if (!data.length) return { success: true, data: [] };
        return fetchByIds(data.map((p) => p.id));
    } catch (error) {
        console.log("Error in fetching recommended posts: ", error);
        return { success: false, msg: "Could not fetch posts" };
    }
};

export const fetchFollowingPosts = async (userId, limit = 10) => {
    try {
        const { data, error } = await supabase.rpc("following_posts", {
            uid: userId,
            lim: limit,
        });

        if (error) {
            console.log("Error in fetching following posts: ", error);
            return { success: false, msg: "Could not fetch posts" };
        }

        if (!data.length) return { success: true, data: [] };
        return fetchByIds(data.map((p) => p.id));
    } catch (error) {
        console.log("Error in fetching following posts: ", error);
        return { success: false, msg: "Could not fetch posts" };
    }
};

export const fetchProfileStats = async (userId) => {
    try {
        const { count, error } = await supabase
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("userId", userId);

        if (error) {
            console.log("Error in fetching profile stats: ", error);
            return { success: false, msg: "Could not fetch profile stats" };
        }

        return { success: true, data: { posts: count ?? 0 } };
    } catch (error) {
        console.log("Error in fetching profile stats: ", error);
        return { success: false, msg: "Could not fetch profile stats" };
    }
};
