# Chat Application with RTK Query - Project RTK Query Plan & setup

## RTK Query Configuration ⚜ ⬇⬇⬇

### API Slice creation & Store configuration

#### 1. Create Api Slice -

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

#### 2. Store configuration

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

#### 3. Create API

- `chat-application\src\features\auth\authApi.js`

```sh
    import { apiSlice } from "../api/apiSlice";

    export const authApi = apiSlice.injectEndpoints({
        endpoints: (builder) => {
            // endpoints here
        },
    });
```

#### 4. Create Slice

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

#### 5. Create Register & Login API

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

#### 6. Create Register & Login API on Query Started function

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
