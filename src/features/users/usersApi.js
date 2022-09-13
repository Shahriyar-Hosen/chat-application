import { apiSlice } from "../api/apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (email) => `/users?email=${email}`,
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
