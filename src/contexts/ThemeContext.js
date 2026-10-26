import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { darkColors, lightColors } from "../constants/theme";

const STORAGE_KEY = "sonance.theme";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [mode, setMode] = useState(systemScheme === "dark" ? "dark" : "light");

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((saved) => {
                if (saved === "light" || saved === "dark") setMode(saved);
            })
            .catch(() => {});
    }, []);

    // Keeps native pieces (alerts, keyboard) in step with the chosen theme
    useEffect(() => {
        Appearance.setColorScheme?.(mode);
    }, [mode]);

    const toggleTheme = useCallback(() => {
        const next = mode === "dark" ? "light" : "dark";
        setMode(next);
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    }, [mode]);

    const value = useMemo(
        () => ({
            mode,
            isDark: mode === "dark",
            colors: mode === "dark" ? darkColors : lightColors,
            toggleTheme,
        }),
        [mode, toggleTheme],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

// Builds a screen's StyleSheet from the active palette, rebuilt on theme change
export const useThemedStyles = (createStyles) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [createStyles, colors]);
    return { styles, colors };
};
