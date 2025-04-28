import { createContext, useContext, useState } from "react";
import { useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = (userData) => {
        setUser(userData);
        const token = userData.token;
        localStorage.setItem("token", token);
        fetchUser(token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    const fetchUser = async (token) => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://140.238.168.70:8000/me`, {
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
        if (!token) {
            setIsLoading(false);
            return;
        }
        fetchUser(token);
    }, []);

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
