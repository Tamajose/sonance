import { theme } from "@/constants/theme";
import { hp } from "@/helpers/common";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import BackButton from "./BackButton";
import { useThemedStyles } from "../contexts/ThemeContext";

const Header = ({ title, showBackButton = true, mb = 10 }) => {
  const router = useRouter();
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.container, { marginBottom: mb }]}>
      {showBackButton && (
        <View style={styles.backButton}>
          <BackButton router={router} />
        </View>
      )}
      <Text style={styles.title}>{title || ""}</Text>
    </View>
  );
};

export default Header;

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 5,
      gap: 10,
    },
    title: {
      fontSize: hp(2.7),
      fontWeight: theme.fonts.semiBold,
      color: colors.textDark,
    },
    backButton: {
      position: "absolute",
      left: 0,
    },
  });
