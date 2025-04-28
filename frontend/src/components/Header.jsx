import { useNavigate } from "react-router"
import { useUser } from "../context/UserContext.jsx"
import { useState } from "react"
import Alert from "./Alert.jsx"

function Header() {
    const navigate = useNavigate()
    const { user } = useUser()
    const [alert, setAlert] = useState(null);
    const [status, setStatus] = useState()

    const handleStatusClick = async () => {
        let newStatus = "idk";
        try {
            const resp = await fetch('http://140.238.168.70:8000/heartbeat');
            if (!resp.ok) {
                newStatus = "error";
            } else {
                const data = await resp.json();
                newStatus = data.connection;
            }
        } catch (error) {
            newStatus = "error";
        }

        setStatus(newStatus);

        setAlert({
            title: "Server status",
            message: (
                <div className="heartbeat-button" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p style={{ margin: 0 }}>Connection to backend</p>
                    <div
                        style={{
                            background: newStatus === "ok" ? "green" : "red",
                            width: 20,
                            height: 20,
                            borderRadius: 100,
                            aspectRatio: 1,
                        }}
                    />
                </div>
            )
        });
    };

    return (
        <div className="header-div">
            {alert && (
                <Alert
                    title={alert.title}
                    message={alert.message}
                    color={alert.color}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="header-div-left">
                <a onClick={() => navigate("/")} className="header-a">Home</a>
                {user ? (<a onClick={() => navigate("/newblog")} className="header-a fancy-button">New Blog</a>) : null}
            </div>
            <div className="header-div-right">
                <a onClick={handleStatusClick} className="header-a">Server status</a>
                {user ? (
                    <a onClick={() => navigate(`/author/${user.username}`)} className="header-a">{user.username}</a>
                ) : (
                    <a onClick={() => navigate("/login")} className="header-a">Login</a>
                )}
            </div>
        </div>
    )
}
export default Header