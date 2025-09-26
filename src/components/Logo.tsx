import logo from "../assets/images/app-logo.png";
import { useNavigate } from "react-router-dom";

const Logo = ({
    width = 120,
    height = "auto",
    alt = "Logo",
    className = "",
    clickable = false,
    to = "/",
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (clickable) navigate(to);
    };

    return (
        <img
            src={logo}
            alt={alt}
            width={width}
            height={height}
            className={`cursor-pointer ${className}`}
            onClick={handleClick}
            style={{ display: "block" }}
        />
    );
};

export default Logo;
