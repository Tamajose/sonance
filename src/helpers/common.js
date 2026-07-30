import { Dimensions } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

export const hp = (percentage) => {
    return (percentage * deviceHeight) / 100;
};

export const wp = (percentage) => {
    return (percentage * deviceWidth) / 100;
};

export const stripHtmlTags = (html) => {
    if (!html || typeof html !== "string") {
        return "";
    }
    return html.replace(/<[^>]*>?/gm, "");
};
