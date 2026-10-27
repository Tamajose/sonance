import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const run = (fn) => {
    if (Platform.OS === "web") return;
    try {
        fn().catch(() => {});
    } catch {}
};

export const tap = () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const select = () => run(() => Haptics.selectionAsync());
