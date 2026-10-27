import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

export const fontAssets = {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
};

const FAMILY_BY_WEIGHT = {
    400: "Inter_400Regular",
    500: "Inter_500Medium",
    600: "Inter_600SemiBold",
    700: "Inter_700Bold",
    800: "Inter_800ExtraBold",
};

export const fontFamilyFor = (weight) => {
    if (weight === "bold") return FAMILY_BY_WEIGHT[700];
    const n = Number(weight);
    if (!n || n <= 400) return FAMILY_BY_WEIGHT[400];
    if (n <= 500) return FAMILY_BY_WEIGHT[500];
    if (n <= 600) return FAMILY_BY_WEIGHT[600];
    if (n <= 700) return FAMILY_BY_WEIGHT[700];
    return FAMILY_BY_WEIGHT[800];
};
