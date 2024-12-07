import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RandomIDs from "../randomids/RandomIDs";
import "../styles/Search.css";


const Search = () => {
  const randomId = RandomIDs[Math.floor(Math.random() * RandomIDs.length)];
  const [inputValue, setInputValue] = useState("");
  const APIURL = "https://imdb.iamidiotareyoutoo.com/search";
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = async () => {
    if (inputValue === "") {
      alert("Write something");
    } else {
      const query = "?q=";
      const url = APIURL + query + encodeURIComponent(inputValue);

      try {
        const response = await fetch(url);
        const data = await response.json();
        navigate("/searchresult", { state: { searchResult: data } });
      } catch (error) {
        console.error("Couldn't get the data needed. Whoops:", error);
      }
    }
  };


  return (
    <div className="search-div">
      <h1>Search a Movie</h1>
      <div className="searchbar">
        <input type="text" value={inputValue} onChange={handleInputChange} onKeyDown={(e) => {
          if (e.key === "Enter")
            handleButtonClick();
        }} placeholder="Enter a movie name" />
        <button onClick={handleButtonClick}>
          <img className="search-icon" src="\images\searchicon.png" alt="Search" />
        </button>
      </div>
      <p>&#8203;</p>
      <a className="random-button" href={`/movie/${randomId}`}>
        random movie
      </a>
    </div>
  );
};

export default Search;
