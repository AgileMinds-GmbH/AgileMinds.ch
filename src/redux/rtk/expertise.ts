import { ApiResponse } from '../../types/common';
import { Expertise } from '../../types/expertise';
import { api } from './rtkApi';

const enhancedApi = api.enhanceEndpoints({
    addTagTypes: ['ExpertiseList', 'Expertise'],
});

export const expertiseApi = enhancedApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET /expertise/list
        getExpertiseList: builder.query<Expertise[], void | ApiResponse<Expertise>>({
            query: (params) => ({
                url: '/expertise/list',
                method: 'GET',
                params,
            }),
            providesTags: ['ExpertiseList'],
            transformResponse: (res: ApiResponse<Expertise[]>) => res?.data ?? [],
        }),

        // GET /expertise/:id
        getExpertiseById: builder.query<Expertise, string>({
            query: (id) => ({
                url: `/expertise/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Expertise', id }],
        }),

        // POST /expertise
        createExpertise: builder.mutation<Expertise, ApiResponse<Expertise>>({
            query: (body) => ({
                url: '/expertise',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ExpertiseList'],
        }),

        // PUT /expertise/:id
        updateExpertise: builder.mutation<Expertise, { id: string; body: ApiResponse<Expertise> }>({
            query: ({ id, body }) => ({
                url: `/expertise/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['ExpertiseList', 'Expertise'],
        }),

        // DELETE /expertise/:id
        deleteExpertise: builder.mutation<{ id: string }, string>({
            query: (id) => ({
                url: `/expertise/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ExpertiseList', 'Expertise'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetExpertiseListQuery,
    useGetExpertiseByIdQuery,
    useCreateExpertiseMutation,
    useUpdateExpertiseMutation,
    useDeleteExpertiseMutation,
} = expertiseApi;
