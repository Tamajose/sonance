import { useRouter } from "expo-router";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "../../../assets/icons/Icon";
import { supabase } from "../../../lib/supabase";
import Header from "../../components/Header";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";

const Profile = () => {
    const { user, setAuth } = useAuth;
    const router = useRouter();

    const onLogout = async () => {
        const { error } = await supabase.auth.signOut();
    };

    const handleLogout = async () => {
        if (Platform.OS === "web") {
            if (window.confirm("Are you sure you want to log out?")) {
                onLogout();
            }
        } else {
            Alert.alert(
                "Confirm",
                "Are you sure you want to log out?"[
                    ({
                        text: "Cancel",
                        onPress: () => console.log("Modal cancelled"),
                        style: "Cancel",
                    },
                    {
                        text: "Log Out",
                        onPress: () => onLogout(),
                        style: "destructive",
                    })
                ],
            );
        }
        return;
    };
    return (
        <ScreenWrapper bg="white">
            <UserHeader
                user={user}
                router={router}
                handleLogout={handleLogout}
            />
        </ScreenWrapper>
    );
};

const UserHeader = ({ user, router, handleLogout }) => {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "white",
                paddingHorizontal: wp(4),
            }}
        >
            <View>
                <Header title="Profile" showBackButton={true} />
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Icon name="logout" color={theme.colors.rose} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginHorizontal: wp(4),
        marginBottom: 20,
    },
    headerShape: {
        width: wp(100),
        height: hp(20),
    },
    avatarContainer: {
        height: hp(12),
        width: hp(12),
        alignSelf: "center",
    },
    editIcon: {
        position: "absolute",
        bottom: 0,
        right: -12,
        padding: 7,
        borderRadius: 50,
        backgroundColor: "white",
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7,
    },
    userName: {
        fontsize: hp(3),
        fontWeight: "500",
        gap: 10,
    },
    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    infoText: {
        fontSize: hp(1.6),
        fontWeight: "500",
        color: theme.colors.textLight,
    },
    logoutButton: {
        position: "absolute",
        right: 0,
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: "#fee2e2",
    },
    listStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30,
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: "center",
        color: theme.colors.text,
    },
});
