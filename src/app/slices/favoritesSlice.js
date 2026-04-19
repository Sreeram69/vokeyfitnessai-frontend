import { createSlice } from "@reduxjs/toolkit";
import {
  notifySuccess,
  notifyError,
  notifyInfo,
} from "../../utils/toast";

const STORAGE_KEY = "fitforge_favorites";

const initialState = {
  favorites:
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.favorites.find(
        (item) => item.id === action.payload.id
      );

      if (exists) {
        notifyInfo("Exercise already in favorites 💪");
        return;
      }

      state.favorites.push(action.payload);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.favorites)
      );

      notifySuccess("Added to favorites ❤️");
    },

    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(
        (item) => item.id !== action.payload
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.favorites)
      );

      notifyError("Removed from favorites");
    },

    clearFavorites: (state) => {
      state.favorites = [];

      localStorage.removeItem(STORAGE_KEY);

      notifyInfo("Favorites cleared");
    },
  },
});

export const {
  addFavorite,
  removeFavorite,
  clearFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;