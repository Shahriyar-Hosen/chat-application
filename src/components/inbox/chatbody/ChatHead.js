import React from "react";
import { useSelector } from "react-redux";
import gravatarUrl from "gravatar-url";

const ChatHead = ({ message }) => {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const { sender, receiver } = message || {};

  const partnerEmail = sender.email === email ? receiver.email : sender.email;

  const partnerName = sender.email === email ? receiver.name : sender.name;

  return (
    <div className="relative flex items-center p-3 border-b border-gray-300">
      <img
        className="object-cover w-10 h-10 rounded-full"
        src={gravatarUrl(partnerEmail)}
        alt={partnerName}
      />
      <span className="block ml-2 font-bold text-gray-600">{partnerName}</span>
    </div>
  );
};

export default ChatHead;
