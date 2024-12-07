import { Link } from "react-router-dom";
import "../styles/Header.css"
import React from 'react';


const Header = () => {
    return (
        <nav>
            <id className="header-div">
                <Link to="/">
                    Search a Movie
                </Link>
                <Link to="/favourites">
                    Favourites
                </Link>
            </id>
        </nav>
    );
};

export default Header;
