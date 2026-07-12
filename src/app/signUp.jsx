import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Icon from "../../assets/icons/Icon";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import Input from "../components/Input";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

const SignUp = () => {
    const router = useRouter();
    const nameRef = useRef("");
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const confirmPasswordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit = () => {
        if (
            !nameRef.current.trim() ||
            !emailRef.current.trim() ||
            !passwordRef.current.trim() ||
            !confirmPasswordRef.current.trim()
        ) {
            if (Platform.OS === "web") {
                alert("Please fill all the fields!");
            } else {
                Alert.alert("Sign Up", "Please fill all the fields!");
            }
            return;
        }

        if (passwordRef.current !== confirmPasswordRef.current) {
            if (Platform.OS === "web") {
                alert("Passwords do not match!");
            } else {
                Alert.alert("Sign Up", "Passwords do not match!");
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
                    <Text style={styles.welcomeText}>Let's</Text>
                    <Text style={styles.welcomeText}>Get Started</Text>
                </View>
                <View style={styles.form}>
                    <Text
                        style={{ fontSize: hp(1.5), color: theme.colors.text }}
                    >
                        Please fill the details to create an account
                    </Text>
                    <Input
                        icon={<Icon name="user" size={26} strokeWidth={1.6} />}
                        placeholder="Enter your name"
                        onChangeText={(value) => (nameRef.current = value)}
                    />
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
                    <Input
                        icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                        placeholder="Confirm your password"
                        secureTextEntry
                        onChangeText={(value) => (confirmPasswordRef.current = value)}
                    />
                    <Button
                        title={"Sign Up"}
                        loading={loading}
                        onPress={onSubmit}
                    ></Button>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Already have an account?
                    </Text>
                    <Pressable onPress={() => router.push("/login")}>
                        <Text
                            style={[
                                styles.footerText,
                                {
                                    color: theme.colors.primaryDark,
                                    fontWeight: theme.fonts.semiBold,
                                },
                            ]}
                        >
                            Login
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default SignUp;

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
