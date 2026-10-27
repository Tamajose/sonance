import { supabase } from "../lib/supabase";

const UNIQUE_VIOLATION = "23505";

export const followUser = async (followerId, followingId) => {
    try {
        const { error } = await supabase
            .from("follows")
            .insert({ follower_id: followerId, following_id: followingId });

        if (error && error.code !== UNIQUE_VIOLATION) {
            console.log("Error in following user: ", error);
            return { success: false, msg: "Could not follow user" };
        }

        return { success: true };
    } catch (error) {
        console.log("Error in following user: ", error);
        return { success: false, msg: "Could not follow user" };
    }
};

export const unfollowUser = async (followerId, followingId) => {
    try {
        const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", followerId)
            .eq("following_id", followingId);

        if (error) {
            console.log("Error in unfollowing user: ", error);
            return { success: false, msg: "Could not unfollow user" };
        }

        return { success: true };
    } catch (error) {
        console.log("Error in unfollowing user: ", error);
        return { success: false, msg: "Could not unfollow user" };
    }
};

export const fetchIsFollowing = async (followerId, followingId) => {
    try {
        const { count, error } = await supabase
            .from("follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("follower_id", followerId)
            .eq("following_id", followingId);

        if (error) {
            console.log("Error in fetching follow state: ", error);
            return { success: false, msg: "Could not fetch follow state" };
        }

        return { success: true, data: count > 0 };
    } catch (error) {
        console.log("Error in fetching follow state: ", error);
        return { success: false, msg: "Could not fetch follow state" };
    }
};

export const fetchFollowCounts = async (userId) => {
    try {
        const [followers, following] = await Promise.all([
            supabase
                .from("follows")
                .select("follower_id", { count: "exact", head: true })
                .eq("following_id", userId),
            supabase
                .from("follows")
                .select("following_id", { count: "exact", head: true })
                .eq("follower_id", userId),
        ]);

        if (followers.error || following.error) {
            console.log(
                "Error in fetching follow counts: ",
                followers.error || following.error,
            );
            return { success: false, msg: "Could not fetch follow counts" };
        }

        return {
            success: true,
            data: {
                followers: followers.count ?? 0,
                following: following.count ?? 0,
            },
        };
    } catch (error) {
        console.log("Error in fetching follow counts: ", error);
        return { success: false, msg: "Could not fetch follow counts" };
    }
};

export const fetchFollowingIds = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", userId);

        if (error) {
            console.log("Error in fetching following: ", error);
            return { success: false, msg: "Could not fetch following" };
        }

        return { success: true, data: data.map((row) => row.following_id) };
    } catch (error) {
        console.log("Error in fetching following: ", error);
        return { success: false, msg: "Could not fetch following" };
    }
};
