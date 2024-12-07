import { useLocation, useNavigate } from "react-router-dom";
import MovieList from "../components/MovieList";
import "../styles/SearchResult.css";

const SearchResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResult = location.state?.searchResult?.description || [];

  return (
    <div>
      <h1 className="search-result-title">Search Results</h1>
      <MovieList
        movies={searchResult}
        emptyMessage="I wasn't able to find a movie with this search query. Try again with a comprehensible title."
      />
    </div>
  );
};

export default SearchResult;
