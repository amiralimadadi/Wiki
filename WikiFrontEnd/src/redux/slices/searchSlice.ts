import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/api";

export const searchItems = createAsyncThunk(
  "search/fetchResults",
  async ({
    searchText,
    path,
    goalId,
  }: {
    searchText: string;
    path: string;
    goalId?: number | null;
  }) => {
    let url = "";
    const encodedText = encodeURIComponent(searchText);

    // اگر goalId داشته باشیم، به کوئری اضافه می‌شود، وگرنه خالی است
    const goalQuery = goalId != null ? `&goalId=${goalId}` : "";

    switch (path) {
      case "knowledgeContent":
        // قبلاً goalId خالی می‌فرستادی، الان فقط اگر goalId داشته باشی اضافه میشه
        url = `KnowledgeContent/getKnowledgeContent?knowledgeContentFilter=All${goalQuery}&searchText=${encodedText}&pageNo=1`;
        break;

      case "questions":
        url = `QuestionAndAnswer/GetQuestions?questionFilter=AllQuestions${goalQuery}&pageNo=1&searchText=${encodedText}`;
        break;

      case "proposal":
        // این یکی goalId لازم ندارد (طبق کدی که خودت داشتی)
        url = `ProjectAndProposal/GetAllProposal?proposalFilter=AllProposal&pageNo=1&searchText=${encodedText}`;
        break;

      case "project":
        url = `project/GetAllproject?projectFilter=AllProject${goalQuery}&pageNo=1&searchText=${encodedText}`;
        break;

      case "documentation":
        url = `Documentation/GetUnitDocumentation?documentationFilter=AllDocumentation${goalQuery}&pageNo=1&searchText=${encodedText}`;
        break;

      default:
        throw new Error("مسیر نامعتبر برای جستجو");
    }

    const response = await api.get(url);
    // طبق کد خودت: data اصلی داخل response.data.data است
    return response.data.data;
  }
);

type SearchState = {
  results: any[];
  loading: boolean;
  error: string | null;
};

const initialState: SearchState = {
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "خطا در جستجو";
      });
  },
});

export const { clearResults } = searchSlice.actions;
export default searchSlice.reducer;
