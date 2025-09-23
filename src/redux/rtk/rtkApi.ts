import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../services/baseQuery';

export const api = createApi({
    reducerPath: "queryhandler",
    baseQuery: axiosBaseQuery(),
    endpoints: () => ({})
});

