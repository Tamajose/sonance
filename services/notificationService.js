import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
    try {
        const { error } = await supabase
            .from("notifications")
            .insert(notification);

        if (error) {
            console.log("Error in notification: ", error);
            return { success: false, msg: "Something went wrong" };
        }

        return { success: true };
    } catch (error) {
        console.log("Error in notification: ", error);
        return { success: false, msg: "Something went wrong" };
    }
};

export const deleteNotification = async ({
    senderId,
    receiverId,
    title,
    data,
}) => {
    try {
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("senderId", senderId)
            .eq("receiverId", receiverId)
            .eq("title", title)
            .eq("data", data);

        if (error) {
            console.log("Error in deleting notification: ", error);
            return { success: false, msg: "Something went wrong" };
        }

        return { success: true };
    } catch (error) {
        console.log("Error in deleting notification: ", error);
        return { success: false, msg: "Something went wrong" };
    }
};

export const fetchNotifications = async (receiverId) => {
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select(`*, sender: senderId(id, name, image)`)
            .eq("receiverId", receiverId)
            .order("created_at", { ascending: false });

        if (error) {
            console.log("Notification error: ", error);
            return { success: false, msg: "Could not fetch notications" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("Notification error: ", error);
        return { success: false, msg: "Could not fetch notications" };
    }
};
