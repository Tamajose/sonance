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
            console.log("session user: ", session?.user?.id);

            if (session) {
                setAuth(session?.user);
                updateUserData(session?.user);
                router.replace("/home");
            } else {
                setAuth(null);
                router.replace("/welcome");
            }
        });
    }, []);

    const updateUserData = async (user) => {
        let res = await getUserData(user?.id);
        if (res.success) setUserData(res.data);
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
