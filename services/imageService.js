import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";
import { readAsStringAsync } from "expo-file-system/legacy";
import { Platform } from "react-native";
import { supabaseUrl } from "../src/constants/index";

export const getUserImageSrc = (imagePath) => {
    if (imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require("../assets/images/defaultUser.png");
    }
};

export const getSupabaseFileUrl = (filePath) => {
    if (filePath) {
        return {
            uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
        };
    }
    return null;
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage);

        let imageData;
        if (Platform.OS === "web") {
            const response = await fetch(fileUri);
            imageData = await response.blob();
        } else {
            const fileBase64 = await readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            imageData = decode(fileBase64);
        }

        let { data, error } = await supabase.storage
            .from("uploads")
            .upload(fileName, imageData, {
                contentType: isImage ? "image/*" : "video/*",
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.log("File upload error: ", error);
            return { success: false, msg: "Could not upload media" };
        }

        console.log("Data: ", data);
        return { success: true, data: data.path };
    } catch (error) {
        console.log("File upload error: ", error);
        return { success: false, msg: "Could not upload media" };
    }
};

export const getFilePath = (folderName, isImage) => {
    return `/${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};
