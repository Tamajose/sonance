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

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setAuth(session?.user);
                updateUserData(session?.user, session?.user?.email);
                router.replace("/home");
            } else {
                setAuth(null);
                router.replace("/welcome");
            }
        });
    }, []);

    const updateUserData = async (user, email) => {
        let res = await getUserData(user?.id);
        if (res.success) setUserData({ ...res.data, email });
    };

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
};

export default _layout;
