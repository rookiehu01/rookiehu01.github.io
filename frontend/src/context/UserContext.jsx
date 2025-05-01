import { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import BACKEND_URL from "../config.jsx";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = (userData) => {
        setUser(userData);
        const token = userData.token;
        const username = userData.username;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        fetchUser(token, username);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
    };

    const fetchUser = async (token, username) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/users/${username}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                logout();
                return;
            }

            const data = await res.json();
            setUser({ ...data, token });

        } catch (err) {
            console.error("Auto-login failed", err);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        if (!token) {
            setIsLoading(false);
            return;
        }
        fetchUser(token, username);
    }, []);

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
