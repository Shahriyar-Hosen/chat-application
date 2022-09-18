import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (id) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,

      transformResponse(apiResponse, meta) {
        const totalMessage = meta.response.headers.get("X-Total-Count");

        return {
          data: apiResponse,
          totalMessage: Number(totalMessage),
        };
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // create socket
        const socket = io("http://localhost:9000", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;

          socket.on("message", ({ data }) => {
            updateCachedData((draft) => {
              draft.data.unshift(data);
            });
          });
        } catch (err) {
          // err there
        }

        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getMoreMessages: builder.query({
      query: ({ id, page }) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      async onQueryStarted({ id }, { queryFulfilled, dispatch }) {
        try {
          const { data: resData } = (await queryFulfilled) || {};

          if (resData?.length > 0) {
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                id.toString(),
                (draft) => {
                  return {
                    data: [...draft.data, ...resData],
                    totalMessage: Number(draft.totalMessage),
                  };
                }
              )
            );
          }
        } catch (err) {}
      },
    }),
    addMessage: builder.mutation({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
