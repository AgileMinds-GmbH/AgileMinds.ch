import { GetServiceListRequest, Service } from "../../types/services";
import { api } from "./rtkApi";

const enhancedApi = api.enhanceEndpoints({
    addTagTypes: ["getServiceList"],
});

export const serviceApi = enhancedApi.injectEndpoints({
    endpoints: (builder) => ({
        getServiceList: builder.query<Service[], GetServiceListRequest | void>({
            query: (params) => ({
                url: "/service/list",
                method: "GET",
                params,
            }),
            providesTags: ["getServiceList"],
            transformResponse: (res: Service[]) => res,
        }),

        createService: builder.mutation<Service, Partial<Service>>({
            query: (body) => ({
                url: "/services",
                method: "POST",
                body,
            }),
            invalidatesTags: ["getServiceList"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetServiceListQuery,
    useCreateServiceMutation,
} = serviceApi;
