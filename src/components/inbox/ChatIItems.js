import ChatItem from "./ChatItem";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  conversationApi,
  useGetConversationsQuery,
} from "../../features/conversation/conversationApi";
import Error from "../ui/Error";
import { Link } from "react-router-dom";
import gravatarUrl from "gravatar-url";
import moment from "moment/moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import InfiniteScroll from "react-infinite-scroll-component";

const ChatIItems = () => {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};

  const { data, isLoading, isError, error } =
    useGetConversationsQuery(email) || {};

  const { data: conversations, totalCount } = data || {};

  const myConversations = conversations?.filter((conversation) =>
    conversation.participants.includes(email)
  );

  // local states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch();

  const fetchMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (page > 1) {
      dispatch(
        conversationApi.endpoints.getMoreConversations.initiate({
          email,
          page,
        })
      );
    }
  }, [page, email, dispatch]);

  useEffect(() => {
    if (totalCount > 0) {
      const more =
        Math.ceil(
          totalCount / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE)
        ) > page;

      setHasMore(more);
    }
  }, [totalCount, page]);

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <li className="m-2 text-center">Loading...</li>;
  } else if (!isLoading && isError) {
    content = (
      <li className="m-2 text-center">
        <Error message={error?.data} />
      </li>
    );
  } else if (!isLoading && !isError && myConversations?.length === 0) {
    content = <li className="m-2 text-center">No Conversation Found</li>;
  } else if (!isLoading && !isError && myConversations?.length > 0) {
    content = (
      <InfiniteScroll
        dataLength={myConversations?.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<h4 className=" text-center py-1">Loading...</h4>}
        height={window.innerHeight - 129}
      >
        {myConversations.map((conversation) => {
          const { id, users, message, timestamp } = conversation || {};

          const { email: partnerEmail, name } = getPartnerInfo(users, email);

          return (
            <li key={conversation.id}>
              <Link to={`/inbox/${id}`}>
                <ChatItem
                  avatar={gravatarUrl(partnerEmail, {
                    size: 80,
                  })}
                  name={name}
                  lastMessage={message}
                  id={id}
                  lastTime={moment(timestamp).fromNow()}
                />
              </Link>
            </li>
          );
        })}
      </InfiniteScroll>
    );
  }

  return <ul>{content}</ul>;
};

export default ChatIItems;
