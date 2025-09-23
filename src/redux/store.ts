import { configureStore } from '@reduxjs/toolkit';
import { courseApi } from './rtk/course';

export const store = configureStore({
  reducer: {
    [courseApi.reducerPath]: courseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(courseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;