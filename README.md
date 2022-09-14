# Chat Application with RTK Query - Project RTK Query Plan & Setup Notes ⚜

## RTK Query Configuration API Slice creation & Store configuration ⬇⬇⬇

### 1. Create Api Slice -

```sh
    import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

    export const apiSlice = createApi({
        reducerPath: "api",
        baseQuery: fetchBaseQuery({
            baseUrl: "http://localhost:9000",
        }),
        tagTypes: [],
        endpoints: (builder) => ({

        }),
    });
```

### 2. Store configuration

```sh
    import { configureStore } from "@reduxjs/toolkit";
    import { apiSlice } from "../features/api/apiSlice";

    export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddlewares) =>
        getDefaultMiddlewares().concat(apiSlice.middleware),
    });
```

### 3. Create API

- `chat-application\src\features\auth\authApi.js`

```sh
    import { apiSlice } from "../api/apiSlice";

    export const authApi = apiSlice.injectEndpoints({
        endpoints: (builder) => ({
            // endpoints here
        }),
    });

    export const {  } = authApi;
```

### 4. Create Slice

- `chat-application\src\features\auth\authSlice.js`

```sh
    import { createSlice } from "@reduxjs/toolkit";

    const initialState = {};

    const authSlice = createSlice({
        name: "auth",
        initialState,
        reducers: {},
    });

    export const {} = authSlice.actions;
    export default authSlice.reducer;

```

### 5. Create Register & Login API

```sh
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data) => ({
                url: "/register",
                method: "POST",
                body: data,
            }),
        }),

        login: builder.mutation({
            query: (data) => ({
                url: "/login",
                method: "POST",
                body: data,
            }),
        }),
    }),

```

## Project Plan & Setup Notes ⬇⬇⬇

### 6. On Query Started function in Create Register & Login API

- API URL এ হিট করার সাথে সাথে এই ফাংশনটি কল হয়, এবং যদি রিকোয়েস্ট ফুলফিল হয় তাহলে পরবর্তী কাজগুলো করে। ==> This function is called as soon as the API URL is hit, and if the request is fulfilled, it performs the following actions.

- This function should be used after the query ==> এই ফাংশনটি কুয়েরি এরপরে ব্যবহার করতে হবে

```sh
    async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          localStorage.setItem(
            "auth",
            JSON.stringify({
              accessToken: result.data.accessToken,
              user: result.data.user,
            })
          );
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            })
          );
        } catch (err) {
          // do nothing
        }
    },

```

### Auth hooks

hooks useAuth

```sh
    import { useSelector } from "react-redux";

    const useAuth = () => {
    const auth = useSelector((state) => state.auth);

    if (auth?.accessToken && auth?.user) {
        return auth;
    } else {
        return false;
    }
    };

    export default useAuth;

```

### Private & Public Route

**Private Component**

```sh
    import React from "react";
    import { Navigate } from "react-router-dom";
    import useAuth from "../hooks/useAuth";

    const PrivateRoute = ({ children }) => {
    const isLoggedIn = useAuth();

    return isLoggedIn ? children : <Navigate to="/" />;
    };

    export default PrivateRoute;
```

**Public Component**

```sh
    import React from "react";
    import { Navigate } from "react-router-dom";
    import useAuth from "../hooks/useAuth";

    const PublicRoute = ({ children }) => {
    const isLoggedIn = useAuth();

    return !isLoggedIn ? children : <Navigate to="/inbox" />;
    };

    export default PublicRoute;
```

### Conversation Api Add Pagination & Latest / Revers Conversation

```sh
    getConversations: builder.query({

        // filter by email ==> participants_like=${email}
        // Latest / Revers Conversation ==> _sort=timestamp&_order=desc
        // Pagination ==> _page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}

        query: (email) =>
            `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
    }),
```

### Valid Email Checker

```sh
    // Valid Email Checker

    const isValidEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    export default isValidEmail;

```

### Debounce Function

```sh
  const debounceHandler = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const doSearch = (value) => {
    if (isValidEmail(value)) {
      // check user API
      console.log(value);
      setToValue(value);
    }
  };

  const handleSearch = debounceHandler(doSearch, 500);
```

### Skip initial call getQuery API

```sh
  const [userCheck, setUserCheck] = useState(false);

  const { data: participant } = useGetUsersQuery(to, {
    skip: !userCheck,
  });

  const handleSubmit = () => {
      setUserCheck(true);
    };
```
