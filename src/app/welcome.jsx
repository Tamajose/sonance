import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import { useThemedStyles } from "../contexts/ThemeContext";

const Welcome = () => {
    const { styles, colors } = useThemedStyles(createStyles);
    const router = useRouter();
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={{ gap: 20 }}>
                    <Text style={styles.title}>Sonance</Text>
                    <Text style={styles.punchline}>
                        A Safe Space for Expression
                    </Text>
                </View>
                <View style={styles.footer}>
                    <Button
                        title="Getting Started"
                        buttonStyle={{ marginHorizontal: wp(3) }}
                        onPress={() => router.push("/signUp")}
                    />
                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>
                            Already have an account?
                        </Text>
                        <Pressable onPress={() => router.push("/login")}>
                            <Text
                                style={[
                                    styles.loginText,
                                    {
                                        color: colors.primaryDark,
                                        fontWeight: theme.fonts.semiBold,
                                    },
                                ]}
                            >
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default Welcome;

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
            backgroundColor: colors.background,
            marginHorizontal: wp(4),
        },
        title: {
            color: colors.text,
            fontSize: hp(4),
            textAlign: "center",
            fontWeight: theme.fonts.extraBold,
        },
        punchline: {
            textAlign: "center",
            paddingHorizontal: wp(10),
            fontSize: hp(1.7),
            color: colors.text,
        },
        footer: {
            gap: 30,
            width: "100%",
        },
        bottomTextContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
        },
        loginText: {
            textAlign: "center",
            color: colors.text,
            fontSize: hp(1.6),
        },
    });
