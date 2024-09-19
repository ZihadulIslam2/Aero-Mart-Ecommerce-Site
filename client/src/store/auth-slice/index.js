import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  isLoading: false, // Fixed capitalization (optional)
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload // Update the user in the state
      state.isAuthenticated = true // Set authenticated to true if the user is set
    },
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
