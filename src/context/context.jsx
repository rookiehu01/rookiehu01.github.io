import { createContext, useReducer, useContext, useEffect } from "react";
import React from 'react';


const AppContext = createContext();

const initialState = {
  searchResults: [],
  favourites: JSON.parse(localStorage.getItem("favourites")) || [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_RESULTS":
      return { ...state, searchResults: action.payload };

    case "ADD_FAVOURITE": {
      const updatedFavourites = [...state.favourites, action.payload];
      localStorage.setItem("favourites", JSON.stringify(updatedFavourites));
      return { ...state, favourites: updatedFavourites };
    }

    case "REMOVE_FAVOURITE": {
      const updatedFavourites = state.favourites.filter(
        (fav) => fav.imdbId !== action.payload
      );
      localStorage.setItem("favourites", JSON.stringify(updatedFavourites));
      return { ...state, favourites: updatedFavourites };
    }

    default:
      throw new Error(`Nono action type: ${action.type}`);
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(state.favourites));
  }, [state.favourites]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
