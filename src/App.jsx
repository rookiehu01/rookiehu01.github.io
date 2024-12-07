import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "./routes/Search";
import SearchResult from "./routes/SearchResult";
import MovieDetails from "./routes/MovieDetails";
import Favourites from "./routes/Favourites";
import Header from "./components/Header";
import { AppProvider } from "./context/context";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/searchresult" element={<SearchResult />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/favourites" element={<Favourites />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
