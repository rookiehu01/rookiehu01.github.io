import { useNavigate, Link } from "react-router-dom";
import "../styles/MovieList.css";
import React from 'react';


const MovieList = ({ movies = [], emptyMessage }) => {
    const navigate = useNavigate();
    return (
        <div className="result-div">
            <ul className="result-ul">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <Link to={`/movie/${movie["#IMDB_ID"]}`} key={movie["#IMDB_ID"]}>
                            <li>
                                <img src={movie["#IMG_POSTER"]} alt={movie["#TITLE"]} />
                                {movie["#TITLE"]} ({movie["#YEAR"]})
                            </li>
                        </Link>
                    ))
                ) : (
                    <div>
                        <p>{emptyMessage}</p>
                        <button className="error-button" onClick={() => navigate("/")}>Search</button>
                    </div>
                )}
            </ul>
        </div>
    );
};

export default MovieList;
