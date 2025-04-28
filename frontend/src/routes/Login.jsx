import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import Alert from "../components/Alert.jsx";


function Login() {
    const navigate = useNavigate();
    const { login, user } = useUser();
    const [alert, setAlert] = useState(null);

    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: ""
    });

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user]);


    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setAlert(null);
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isRegistering ? "register" : "login";

        const payload = {
            username: formData.username,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
        };

        try {
            const res = await fetch(`/api/${url}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                setAlert({
                    title: "Error",
                    message: data.message || "Something went wrong!",
                    color: "red"
                });
                return;
            }
            if (isRegistering) {
                setAlert({
                    title: "Registration successful",
                    message: (
                        <>
                            <p>You can now log in with your credentials.</p>
                        </>
                    ),
                    color: "green"
                });
                setIsRegistering(false);
            }
            else {
                login({ token: data.token, username: formData.username });
                navigate("/");
            }

        } catch (err) {
            setAlert({
                title: "Network error",
                message: "Unable to connect to server.",
                color: "red"
            });
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {alert && (
                    <Alert
                        title={alert.title}
                        message={alert.message}
                        color={alert.color}
                        onClose={() => setAlert(null)}
                    />
                )}
                <div className="login-title">
                    <h1>{isRegistering ? "Register" : "Login"}</h1>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" maxLength={16} value={formData.username} onChange={handleChange} required placeholder="supercoolusername" />
                    {isRegistering && (
                        <>
                            <label htmlFor="firstName">First name</label>
                            <input id="firstName" type="text" value={formData.firstName} onChange={handleChange} required placeholder="John" />
                            <label htmlFor="lastName">Last name</label>
                            <input id="lastName" type="text" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                        </>
                    )}
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••" />

                    <button type="submit" className="fancy-button">{isRegistering ? "Register" : "Login"}</button>

                    <p className="toggle-text">
                        {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                        <span onClick={toggleMode} className="toggle-link">
                            {isRegistering ? "Login" : "Register"}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
