import { GetServiceListRequest, Service } from "../../types/services";
import { api } from "./rtkApi"

const enhancedApi = api.enhanceEndpoints({
    addTagTypes: ['ServicesList'],
});


export const courseApi = enhancedApi.injectEndpoints({
    endpoints: (builder) => ({
        getCourseList: builder.query<Service[], GetServiceListRequest | void>({
            query: (params) => ({
                url: '/service/list',
                method: 'GET',
                params,
            }),
            providesTags: ['ServicesList'],
            transformResponse: (res: Service[]) => res
        }),

        // POST /courses
        createService: builder.mutation<Service, Partial<Service>>({
            query: (body) => ({
                url: '/services',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ServicesList'],
        }),
    }),
    overrideExisting: false,
});