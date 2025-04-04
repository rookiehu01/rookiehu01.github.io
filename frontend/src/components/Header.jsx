import { useNavigate } from "react-router"
import { useUser } from "../context/UserContext.jsx"

function Header() {
    const navigate = useNavigate()
    const { user } = useUser()

    return (
        <div className="header-div">
            <div className="header-div-left">
                <a onClick={() => navigate("/")} className="header-a">Home</a>
                <a onClick={() => navigate("/newblog")} className="header-a fancy-button">New Blog</a>
            </div>
            <div className="header-div-right">
                <div>
                    <a onClick={() => navigate("/heartbeat")} className="header-a">Server status</a>
                </div>
                <div>
                    {user ? (
                        <a onClick={() => navigate("/profile")} className="header-a">Profile</a>
                    ): (
                        <a onClick={() => navigate("/login")} className="header-a">Login</a>
                    )}
                </div>
            </div>
        </div>
    )
}
export default Header