import { Button, StyleSheet, Text } from "react-native";
import { supabase } from "../../../lib/supabase";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";

const Home = () => {
    const { setAuth } = useAuth();

    const onLogout = async () => {
        const { error } = await supabase.auth.signOut();

        console.log(error);
        if (error) {
            if (Platform.OS === "web") {
                alert(error.message);
            } else {
                Alert.alert("Sign Out", error.message);
            }
            return;
        }
    };

    return (
        <ScreenWrapper>
            <Text>Home</Text>
            <Button title="logout" onPress={onLogout}></Button>
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({});
