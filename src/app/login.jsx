import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../../assets/icons/Icon";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import Input from "../components/Input";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

const Login = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit = () => {
        if (!emailRef.current.trim() || !passwordRef.current.trim()) {
            if (Platform.OS === 'web') {
                alert("Please fill all the fields!");
            } else {
                Alert.alert("Login", "Please fill all the fields!");
            }
            return;
        }
    };

    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={styles.container}>
                <BackButton router={router} />
                <View>
                    <Text style={styles.welcomeText}>Hey,</Text>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                </View>
                <View style={styles.form}>
                    <Text
                        style={{ fontSize: hp(1.5), color: theme.colors.text }}
                    >
                        Please login to continue
                    </Text>
                    <Input
                        icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                        placeholder="Enter your email address"
                        onChangeText={(value) => (emailRef.current = value)}
                    />
                    <Input
                        icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                        placeholder="Enter your password"
                        secureTextEntry
                        onChangeText={(value) => (passwordRef.current = value)}
                    />
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    <Button
                        title={"Login"}
                        loading={loading}
                        onPress={onSubmit}
                    ></Button>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?
                    </Text>
                    <Pressable onPress={() => router.push("/signUp")}>
                        <Text
                            style={[
                                styles.footerText,
                                {
                                    color: theme.colors.primaryDark,
                                    fontWeight: theme.fonts.semiBold,
                                },
                            ]}
                        >
                            Sign Up
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form: {
        gap: 25,
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: theme.fonts.semiBold,
        color: theme.colors.text,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    footerText: {
        textAlign: "center",
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});
