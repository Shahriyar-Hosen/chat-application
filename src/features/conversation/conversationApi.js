import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
    }),
    getConversation: builder.query({
      query: ({ userEmail, participantEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted({ data, sender }, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const pathResultAdd = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            draft.push(data);
          })
        );

        // optimistic cache update end
        try {
          const conversation = await queryFulfilled;
          if (conversation?.data?.id) {
            // silent entry to message table

            const { users, message, timestamp } = data || {};
            const senderUser = users.find((user) => user.email === sender);
            const receiverUser = users.find((user) => user.email !== sender);

            dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation?.data?.id,
                sender: senderUser,
                receiver: receiverUser,
                message: message,
                timestamp: timestamp,
              })
            );
          }
        } catch (err) {
          pathResultAdd.undo();
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, data, sender }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, data, sender }, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const pathResultEdit = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            const draftConversation = draft.find((c) => c.id == id);
            draftConversation.message = data?.message;
            draftConversation.timestamp = data?.timestamp;
          })
        );

        // optimistic cache update end

        try {
          const conversation = await queryFulfilled;
          if (conversation?.data?.id) {
            // silent entry to message table
            const { users, message, timestamp } = data || {};

            const senderUser = users.find((user) => user.email === sender);
            const receiverUser = users.find((user) => user.email !== sender);

            const res = await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation?.data?.id,
                sender: senderUser,
                receiver: receiverUser,
                message: message,
                timestamp: timestamp,
              })
            ).unwrap();
            // update messages cache pessimistically start
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                res?.conversationId.toString(),
                (draft) => {
                  draft.push(res);
                }
              )
            );
            // update messages cache pessimistically start
          }
        } catch (err) {
          pathResultEdit.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationApi;
