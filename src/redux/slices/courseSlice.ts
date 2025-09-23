import { createSlice } from "@reduxjs/toolkit";
import { Course } from "../../types";

interface CourseState {
    list: Course[];
    loading: boolean;
    error: string | null;
}

const initialState: CourseState = {
    list: [],
    loading: false,
    error: null,
};


const courseSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {},
    extraReducers: () => { },
});

export default courseSlice.reducer;
