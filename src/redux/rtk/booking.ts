import { api } from './rtkApi';

export const bookingApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createBooking: builder.mutation<any, any>({
            query: (body) => {
                console.log(body, "data")
                return {
                    url: '/booking',
                    method: 'POST',
                    body
                };
            },
        }),
    }),
});

export const { useCreateBookingMutation } = bookingApi;
