import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieList from "../components/MovieList";
import "../styles/Favourites.css";

const Favourites = () => {
  const navigate = useNavigate();
  const [favouriteMovies, setFavouriteMovies] = useState([]);

  useEffect(() => {
    const storedFavourites = localStorage.getItem("favourites");
    if (storedFavourites) {
      try {
        const parsedFavourites = JSON.parse(storedFavourites);
        const formattedFavourites = parsedFavourites.map((movie) => ({
          "#IMDB_ID": movie.imdbId,
          "#TITLE": movie.name,
          "#YEAR": new Date(movie.year).getFullYear(),
          "#IMG_POSTER": movie.image,
        }));
        setFavouriteMovies(formattedFavourites);
      } catch (error) {
        console.error("Error parsing favourite movies:", error);
      }
    }
  }, []);

  return (
    <div>
      <h1 className="favourites-title">Your Favourites</h1>
      <MovieList
        movies={favouriteMovies}
        emptyMessage="You haven't added any favourites yet"
      />
    </div>
  );
};

export default Favourites;
