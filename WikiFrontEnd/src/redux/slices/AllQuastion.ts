import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllQuestions as fetchQuestionsApi } from "../../services/auth";
import type { KnowledgeContentFilterType } from "../../types/Interfaces";

interface AllQuestions {
  data: KnowledgeContentFilterType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AllQuestions = {
  data: [],
  status: "idle",
  error: null,
};

export const getAllQuestions = createAsyncThunk(
  "questions/fetchAll",
  async () => {
    const response = await fetchQuestionsApi();
    return response; // فرض میکنیم response همون آرایه هست
  }
);

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllQuestions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(getAllQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "خطا در دریافت اطلاعات";
      });
  },
});

export default questionsSlice.reducer;
