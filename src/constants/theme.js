export const lightColors = {
  primary: "#00C26F",
  primaryDark: "#00AC62",
  dark: "#3E3E3E",
  darkLight: "#E1E1E1",
  gray: "#e3e3e3",

  text: "#494949",
  textLight: "#7C7C7C",
  textDark: "#1D1D1D",
  icon: "#7C7C7C",

  rose: "#ef4444",
  roseLight: "#f87171",
  roseSoft: "#fee2e2",

  background: "#FFFFFF",
  card: "#FFFFFF",
  surface: "rgba(0, 0, 0, 0.06)",
  onPrimary: "#FFFFFF",
  shadow: "#000000",
};

export const darkColors = {
  primary: "#00C26F",
  primaryDark: "#1FD688",
  dark: "#E6E8EB",
  darkLight: "#2F343D",
  gray: "#2A2F37",

  text: "#D5D8DD",
  textLight: "#8E95A1",
  textDark: "#F5F6F7",
  icon: "#E4E7EC",

  rose: "#ef4444",
  roseLight: "#f87171",
  roseSoft: "rgba(239, 68, 68, 0.18)",

  background: "#0E1013",
  card: "#171A1F",
  surface: "rgba(255, 255, 255, 0.08)",
  onPrimary: "#FFFFFF",
  shadow: "#000000",
};

export const theme = {
  // Static light palette; components should read colors from useTheme()
  colors: lightColors,

  fonts: {
    medium: "500",
    semiBold: "600",
    bold: "700",
    extraBold: "800",
  },

  radius: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
  },
};
