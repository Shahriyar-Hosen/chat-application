import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,

      transformResponse(apiResponse, meta) {
        const totalCount = meta.response.headers.get("X-Total-Count");

        return { data: apiResponse, totalCount: Number(totalCount) };
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

          socket.on("conversation", ({ data }) => {
            updateCachedData((draft) => {
              const conversation = draft?.data?.find(
                (c) => Number(c.id) === Number(data?.id)
              );

              if (conversation?.id) {
                conversation.message = data?.message;
                conversation.timestamp = data?.timestamp;
              } else {
                // do nothing
                draft.data.unshift(data); // ???
              }
            });
          });
        } catch (err) {
          // err there
        }
        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getMoreConversations: builder.query({
      query: ({ email, page }) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,

      async onQueryStarted({ email }, { queryFulfilled, dispatch }) {
        try {
          const { data: resData } = (await queryFulfilled) || {};

          if (resData?.length > 0) {
            // update conversation cache pessimistically start

            dispatch(
              apiSlice.util.updateQueryData(
                "getConversations",
                email,
                (draft) => {
                  return {
                    data: [...draft.data, ...resData],
                    totalCount: Number(draft.totalCount),
                  };
                }
              )
            );
            // update conversation cache pessimistically start
          }
        } catch (err) {
          // do nothing
        }
      },
    }),
    getConversation: builder.query({
      query: ({ userEmail, participantEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantEmail}&participants_like=${participantEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted({ data, sender }, { queryFulfilled, dispatch }) {
        /*         
        // optimistic cache update start
        const pathResultAdd = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            draft.push(data);
          })
        );

        // optimistic cache update end
 */
        try {
          const { data: resData } = (await queryFulfilled) || {};

          if (resData?.id) {
            // silent entry to message table

            const messageSender = resData.users.find(
              (user) => user.email === sender
            );
            const messageReceiver = resData.users.find(
              (user) => user.email !== sender
            );

            await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: resData.id,
                sender: messageSender,
                receiver: messageReceiver,
                message: resData.message,
                timestamp: resData.timestamp,
              })
            );
          }
        } catch (err) {
          // err there
          // pathResultAdd.undo();
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, data, sender }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, sender, data }, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const pathResult = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            const draftConversation = draft?.data?.find(
              (conversation) => Number(conversation.id) === Number(id)
            );
            draftConversation.message = data.message;
            draftConversation.timestamp = data.timestamp;
          })
        );

        // optimistic cache update end

        try {
          const { data: resData } = (await queryFulfilled) || {};

          if (resData?.id) {
            // silent entry to message table

            const messageSender = resData.users.find(
              (user) => user.email === sender
            );
            const messageReceiver = resData.users.find(
              (user) => user.email !== sender
            );

            // const res =
            await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: resData.id,
                sender: messageSender,
                receiver: messageReceiver,
                message: resData.message,
                timestamp: resData.timestamp,
              })
            );
            /* 
            .unwrap();
            // update messages cache pessimistically start
            // dispatch(
            //   apiSlice.util.updateQueryData(
            //     "getMessages",
            //     res?.conversationId.toString(),
            //     (draft) => {
            //       draft.push(res);
            //     }
            //   )
            // );
            // update messages cache pessimistically start
             */
          }
        } catch (err) {
          pathResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMoreConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationApi;
