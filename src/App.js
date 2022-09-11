import React from "react";
import { Route, Routes } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  return (
    <section>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inbox" element={<Conversation />} />
        <Route path="/inbox/:id" element={<Inbox />} />
      </Routes>
    </section>
  );
};

export default App;
