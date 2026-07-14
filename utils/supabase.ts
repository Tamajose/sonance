import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

const isWeb = Platform.OS === "web";

const customStorage = {
    getItem: async (key: string) => {
        if (isWeb) {
            if (typeof window !== "undefined" && window.localStorage) {
                return window.localStorage.getItem(key);
            }
            return null;
        }
        return AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        if (isWeb) {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } else {
            await AsyncStorage.setItem(key, value);
        }
    },
    removeItem: async (key: string) => {
        if (isWeb) {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } else {
            await AsyncStorage.removeItem(key);
        }
    },
};

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
            storage: customStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
);
