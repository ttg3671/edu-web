import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lang: 'ep',
  theme: 'dark',
  isLoading: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleLang: (state) => {
      state.lang = state.lang === 'en' ? 'ep' : 'en';
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setLang: (state, action) => {
      state.lang = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { toggleLang, toggleTheme, setLang, setTheme, setGlobalLoading } = settingsSlice.actions;
export default settingsSlice.reducer;
