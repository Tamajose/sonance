import { StyleSheet } from "react-native";
import { theme } from "../../src/constants/theme";
import ArrowLeft from "./ArrowLeft";
import HomeIcon from "./Home";
import Lock from "./Lock";
import Mail from "./Mail";
import User from "./User";

const icons = {
    home: HomeIcon,
    arrowLeft: ArrowLeft,
    mail: Mail,
    user: User,
    lock: Lock,
};

const Icon = ({ name, ...props }) => {
    const IconComponent = icons[name];

    return (
        <IconComponent
            height={props.size || 24}
            width={props.size || 24}
            strokeWidth={props.strokeWidth || 1.9}
            color={theme.colors.textLight}
            {...props}
        />
    );
};

export default Icon;

const styles = StyleSheet.create({});
