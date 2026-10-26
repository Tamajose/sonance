import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { hp } from "../helpers/common";
import { theme } from "../constants/theme";
import { Image } from "expo-image";
import { getUserImageSrc } from "../../services/imageService";
import { useThemedStyles } from "../contexts/ThemeContext";

const Avatar = ({
    uri,
    size = hp(4.5),
    rounded = theme.radius.md,
    style = {},
}) => {
    const { styles } = useThemedStyles(createStyles);

    return (
        <Image
            source={getUserImageSrc(uri)}
            transition={100}
            style={[
                styles.avatar,
                { height: size, width: size, borderRadius: rounded },
                style,
            ]}
        />
    );
};

export default Avatar;

const createStyles = (colors) =>
    StyleSheet.create({
        avatar: {
            borderCurve: "continuous",
            borderColor: colors.darkLight,
            borderWidth: 1,
        },
    });
