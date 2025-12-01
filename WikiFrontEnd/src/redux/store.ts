import { configureStore } from "@reduxjs/toolkit";
import knowledgeContentReducer from "./slices/knowledgeContentSlice";
import questionsReducer from "./slices/AllQuastion";
import searchReducer from "./slices/searchSlice";

export const store = configureStore({
  reducer: {
    knowledgeContent: knowledgeContentReducer,
    questions: questionsReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
