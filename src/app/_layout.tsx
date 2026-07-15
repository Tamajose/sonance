import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const _layout = () => {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
};

const MainLayout = () => {
    const { setAuth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            console.log("session user: ", session?.user?.id);

            if (session) {
                setAuth(session?.user);
                router.replace("/home");
            } else {
                setAuth(null);
                router.replace("/welcome");
            }
        });
    }, []);
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
};

export default _layout;
