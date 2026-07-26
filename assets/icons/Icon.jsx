import { StyleSheet } from "react-native";
import { theme } from "../../src/constants/theme";
import ArrowLeft from "./ArrowLeft";
import Edit from "./Edit";
import Heart from "./Heart";
import HomeIcon from "./Home";
import Lock from "./Lock";
import Logout from "./Logout";
import Mail from "./Mail";
import Phone from "./Phone";
import Plus from "./Plus";
import User from "./User";

const icons = {
    home: HomeIcon,
    arrowLeft: ArrowLeft,
    mail: Mail,
    user: User,
    lock: Lock,
    heart: Heart,
    plus: Plus,
    logout: Logout,
    edit: Edit,
    phone: Phone,
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
