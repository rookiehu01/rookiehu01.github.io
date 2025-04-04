import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useEffect } from "react";
import Alert from "../components/Alert.jsx";


function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user]);

    if (!user) {
        return (
            <Alert title="Logging out" message="Please wait"/>
        );
    }
    return (
        <div className="profile-page">
            <div className="name-div">
                <h1> {user.firstName} {user.lastName} </h1>
            </div>
            <div className="logout-div">
                <button onClick={handleLogout} className="fancy-button">Logout</button>
            </div>
        </div>
    );
}

export default Profile;
