import { ApiResponse } from '../../types/common';
import { Course, GetCourseListRequest } from '../../types/course';
import { api } from './rtkApi';

const enhancedApi = api.enhanceEndpoints({
    addTagTypes: ['CourseList', 'CourseItem'],
});

export const courseApi = enhancedApi.injectEndpoints({
    endpoints: (builder) => ({
        getCourseList: builder.query<Course[], GetCourseListRequest | void>({
            query: (params) => ({
                url: '/course/list',
                method: 'GET',
                params,
            }),
            providesTags: ['CourseList'],
            transformResponse: (res: ApiResponse<Course[]>) =>
                res?.data?.map((c) => ({
                    ...c,
                    spotsAvailable: c.spotsAvailable ?? c.spotsAvailable,
                    skillLevel: c.skillLevel ?? c.skillLevel,
                })),
        }),

        // GET /courses/:id
        getCourseById: builder.query<Course, string>({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'CourseItem', id }],
        }),

        // POST /courses
        createCourse: builder.mutation<Course, Partial<Course>>({
            query: (body) => ({
                url: '/courses',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CourseList'],
        }),

        // PUT /courses/:id
        updateCourse: builder.mutation<Course, { id: string; body: Partial<Course> }>({
            query: ({ id, body }) => ({
                url: `/courses/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['CourseList', 'CourseItem'],
        }),

        // DELETE /courses/:id
        deleteCourse: builder.mutation<{ id: string }, string>({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CourseList', 'CourseItem'],
        }),
    }),
    overrideExisting: false,
});

// Export hooks
export const {
    useGetCourseListQuery,
    useGetCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
} = courseApi;
