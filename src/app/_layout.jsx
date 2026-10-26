import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../services/userService";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const _layout = () => {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
};

const MainLayout = () => {
    const { setAuth, setUserData } = useAuth();
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
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="(main)/postDetails"
                options={{
                    presentation: "modal",
                }}
            />
        </Stack>
    );
};

export default _layout;
