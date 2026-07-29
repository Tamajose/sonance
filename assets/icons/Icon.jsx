import { StyleSheet } from "react-native";
import { theme } from "../../src/constants/theme";
import ArrowLeft from "./ArrowLeft";
import Bio from "./Bio";
import Camera from "./Camera";
import Comment from "./Comment";
import Delete from "./Delete";
import Edit from "./Edit";
import Heart from "./Heart";
import HomeIcon from "./Home";
import Image from "./Image";
import Location from "./Location";
import Lock from "./Lock";
import Logout from "./Logout";
import Mail from "./Mail";
import Options from "./Options";
import Phone from "./Phone";
import Plus from "./Plus";
import User from "./User";
import Video from "./Video";
import Share from "./Share";

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
    camera: Camera,
    location: Location,
    bio: Bio,
    image: Image,
    video: Video,
    delete: Delete,
    options: Options,
    comment: Comment,
    share: Share,
};

const Icon = ({ name, ...props }) => {
    const IconComponent = icons[name];

    if (!IconComponent) return null;

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
