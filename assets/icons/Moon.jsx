import Svg, { Path } from "react-native-svg";

const Moon = (props) => {
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
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
    );
};

export default Moon;
