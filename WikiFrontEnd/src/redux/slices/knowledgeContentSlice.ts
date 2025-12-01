import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllKnow } from "../../services/auth";
import type { KnowledgeContentFilterType } from "../../types/Interfaces";

interface KnowledgeContentState {
  data: KnowledgeContentFilterType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: KnowledgeContentState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchKnowledgeContent = createAsyncThunk(
  "knowledgeContent/fetchAll",
  async () => {
    const response = await getAllKnow();
    return response;
  }
);

const knowledgeContentSlice = createSlice({
  name: "knowledgeContent",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeContent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchKnowledgeContent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchKnowledgeContent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "خطا در دریافت اطلاعات";
      });
  },
});

export default knowledgeContentSlice.reducer;
