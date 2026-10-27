import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { fontAssets } from "../constants/fonts";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../services/userService";
import BottomNav from "../components/BottomNav";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const [fontsLoaded, fontError] = useFonts(fontAssets);
    const ready = fontsLoaded || !!fontError;

    useEffect(() => {
        if (ready) SplashScreen.hide();
    }, [ready]);

    if (!ready) return null;

    return (
        <ThemeProvider>
            <AuthProvider>
                <MainLayout />
            </AuthProvider>
        </ThemeProvider>
    );
};

const MainLayout = () => {
    const { setAuth, setUserData } = useAuth();
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const updateUserData = async (user, email) => {
        let res = await getUserData(user?.id);
        if (res.success) setUserData({ ...res.data, email });
    };

    useEffect(() => {
        let currentUserId = null;

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                if (session.user.id === currentUserId) return;
                currentUserId = session.user.id;

                setAuth(session.user);
                setTimeout(
                    () => updateUserData(session.user, session.user.email),
                    0,
                );
                router.replace("/home");
            } else {
                currentUserId = null;
                setAuth(null);
                router.replace("/welcome");
            }
        });

        return () => data.subscription.unsubscribe();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <View style={{ flex: 1 }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.background },
                    }}
                >
                    <Stack.Screen
                        name="(main)/postDetails"
                        options={{
                            presentation: "modal",
                        }}
                    />
                </Stack>
            </View>
            <BottomNav />
        </View>
    );
};

export default RootLayout;
