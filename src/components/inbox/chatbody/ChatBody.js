// import Blank from "./Blank";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";
import React from "react";
import { useParams } from "react-router-dom";
import { useGetMessagesQuery } from "../../../features/messages/messagesApi";
import Error from "../../ui/Error";

const ChatBody = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetMessagesQuery(id) || {};
  const { data: messages, totalMessage } = data || {};

  const myMessages = messages?.filter(
    (message) => message.conversationId === Number(id)
  );

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <div className="m-2 text-center">Loading...</div>;
  } else if (!isLoading && isError) {
    content = (
      <div className="m-2 text-center">
        <Error message={error?.data} />
      </div>
    );
  } else if (!isLoading && !isError && myMessages?.length === 0) {
    content = <div className="m-2 text-center">No messages found!</div>;
    
  } else if (!isLoading && !isError && myMessages?.length > 0) {
    content = (
      <>
        <ChatHead message={myMessages[0]} />
        <Messages messages={myMessages} totalMessage={totalMessage} />
        <Options messageInfo={myMessages[0]} />
      </>
    );
  }

  return (
    <div className="w-full lg:col-span-2 lg:block">
      <div className="w-full grid conversation-row-grid">{content}</div>
    </div>
  );
};

export default ChatBody;
