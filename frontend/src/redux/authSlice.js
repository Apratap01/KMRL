import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: true, // start as true (important!)
  user: null,
  SelectedDoc : null,
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRecentDoc: (state, action) =>{
        state.SelectedDoc = action.payload
    }
  },
});

export const { setLoading, setUser, setRecentDoc } = authSlice.actions;
export default authSlice.reducer;
