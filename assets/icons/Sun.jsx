import Svg, { Circle, Path } from "react-native-svg";

const Sun = (props) => {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={24}
            height={24}
            color="currentColor"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <Circle cx="12" cy="12" r="4.5" />
            <Path d="M12 2.5v2M12 19.5v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2.5 12h2M19.5 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </Svg>
    );
};

export default Sun;
