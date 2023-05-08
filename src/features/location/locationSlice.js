import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchLocation } from "./locationAPI";

const initialState = {
    location: null,
    modal: null,
    status: 'idle',
    error: null
};

export const fetchLocationAsync = createAsyncThunk(
    'location/fetchLocation',
    async () => {
      const response = await fetchLocation();
      return response;
    }
);

export const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        updateLocation: (state, action) => {
            state.location = action.payload;
        },
        updateModal: (state, action) => {
            state.modal = action.payload;
        },
        updateLocationAddress: (state, action) => {
            state.location.address = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchLocationAsync.pending, (state) => {
            state.status = 'loading';
          })
          .addCase(fetchLocationAsync.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.location = action.payload;
          })
          .addCase(fetchLocationAsync.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
          })
    }
});

export const { updateLocation, updateModal, updateLocationAddress } = locationSlice.actions;

export const getModal = state => state.location.modal;

export default locationSlice.reducer;