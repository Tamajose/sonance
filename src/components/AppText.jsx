import { StyleSheet, Text as RNText } from "react-native";
import { fontFamilyFor } from "../constants/fonts";

const AppText = ({ style, ...props }) => {
    const { fontWeight, fontFamily, ...rest } = StyleSheet.flatten(style) ?? {};

    return (
        <RNText
            {...props}
            style={[
                rest,
                { fontFamily: fontFamily ?? fontFamilyFor(fontWeight) },
            ]}
        />
    );
};

export default AppText;
