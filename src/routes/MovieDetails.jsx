import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/context";
import { useEffect, useState } from "react";
import "../styles/MovieDetails.css";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://imdb.iamidiotareyoutoo.com/search?tt=${encodeURIComponent(id)}`
        );
        const data = await response.json();
        if (data.ok) {
          setMovie(data.short);

          const alreadyFavourite = state.favourites.some(
            (fav) => fav.imdbId === extractImdbId(data.short.url)
          );
          setIsFavourite(alreadyFavourite);
        } else {
          setError("I wasn't able to load movie details. Sorry :(");
        }
      } catch (err) {
        setError("I wasn't able to fetch movie details. Sorry :(.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, state.favourites]);

  const handleToggleFavourite = () => {
    const imdbId = extractImdbId(movie.url);

    if (isFavourite) {
      dispatch({ type: "REMOVE_FAVOURITE", payload: imdbId });
    } else {
      const newFavourite = {
        name: movie.name,
        year: movie.datePublished,
        imdbId: imdbId,
        image: movie.image,
      };
      dispatch({ type: "ADD_FAVOURITE", payload: newFavourite });
    }

    setIsFavourite(!isFavourite);
  };

  const formatDuration = (duration) => {
    if (!duration) {
      return "Unknown Duration";
    }
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? `${hoursMatch[1]} h` : "";
    const minutes = minutesMatch ? `${minutesMatch[1]} min` : "";

    return `${hours} ${minutes}`.trim();
  };


  const extractImdbId = (url) => {
    const regex = /tt\d+/;
    const match = url.match(regex);
    return match ? match[0] : null;
  };

  const decodeHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  if (loading) {
    return <p className="loading">Loading</p>;
  }

  if (error || !movie) {
    return (
      <div>
        <h1 className="error-h1"> Error </h1>
        <p>{error || "Movie details not found! Use search to access movie details!"}</p>
        <button className="error-button" onClick={() => navigate("/")}>Try searching again</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="movie-details-title">{decodeHtml(movie.name)}</h1>
      <div className="movie-details-container">
        <div className="movie-details-div">
          <p><strong>Description</strong><br />{movie.description}</p>
          <p><strong>Release Year</strong><br />{movie.datePublished}</p>
          <p><strong>Rating</strong><br />{movie.aggregateRating.ratingValue} / 10</p>
          <p><strong>Genre</strong><br />{movie.genre.join(", ")}</p>
          <p><strong>Duration</strong><br />{formatDuration(movie.duration)}</p>
          <p><strong>Actors</strong>
            <ul>
              {movie.actor && movie.actor.length > 0 ? (
                movie.actor.map((actor, index) => (
                  <li key={index}>
                    <a href={actor.url} target="_blank" rel="noopener noreferrer">
                      {actor.name}
                    </a>
                  </li>
                ))
              ) : (
                <li>Unknown</li>
              )}
            </ul>
          </p>

          <p><strong>Director</strong>
            <ul>
              {movie.director && movie.director.length > 0 ? (
                movie.director.map((director, index) => (
                  <li key={index}>
                    <a href={director.url} target="_blank" rel="noopener noreferrer">
                      {director.name}
                    </a>
                  </li>
                ))
              ) : (
                <li>I couldn't get the director's name :(</li>
              )}
            </ul>
          </p>

          <div className="imdb-image-div">
            <p>
              <a href={movie.url} target="_blank">
                <img className="imdb-image" src="/images/imdb.png" alt="IMDb" />
              </a>
            </p>
          </div>
        </div>
        <div className="movie-image-div">
          <img className="movie-image" src={movie.image} alt={movie.name} />
          <button className="favourite-button" onClick={handleToggleFavourite}>
            {isFavourite ? "💔 Remove from Favourites" : "❤️ Add to Favourites"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
