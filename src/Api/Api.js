// import axios from "axios";

// const BASE_URL = "https://dar.kg/api/v1";
// const api = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } });

// api.interceptors.request.use((config) => {
//   const t = localStorage.getItem("access_token");
//   if (t) config.headers.Authorization = `Bearer ${t}`;
//   return config;
// });

// let isRefreshing = false;
// let queue = [];

// const flush = (err, token) => {
//   queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
//   queue = [];
// };

// api.interceptors.response.use(
//   (r) => r,
//   async (err) => {
//     const original = err.config || {};
//     if (err?.response?.status !== 401 || original._retry) {
//       if (err?.message) console.error(err.message);
//       return Promise.reject(err);
//     }
//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         queue.push({
//           resolve: (token) => {
//             original.headers.Authorization = `Bearer ${token}`;
//             resolve(api(original));
//           },
//           reject,
//         });
//       });
//     }
//     original._retry = true;
//     isRefreshing = true;
//     try {
//       const refresh = localStorage.getItem("refresh_token");
//       if (!refresh) throw new Error("Refresh token not found");
//       const { data } = await axios.post(`${BASE_URL}/users/auth/token/refresh/`, { refresh });
//       const access = data?.access;
//       if (!access) throw new Error("No access token");
//       localStorage.setItem("access_token", access);
//       api.defaults.headers.Authorization = `Bearer ${access}`;
//       flush(null, access);
//       original.headers.Authorization = `Bearer ${access}`;
//       return api(original);
//     } catch (e) {
//       console.error(e?.message || "Auth error");
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//       flush(e, null);
//       return Promise.reject(e);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );

// export const getMe = () => api.get("/users/me/");
// export default api;


import axios from "axios";

export const BASE_URL = "https://dar.kg/api/v1";
const api = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("access_token");
  if (t) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

const flush = (err, token) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config || {};
    if (err?.response?.status !== 401 || original._retry) {
      if (err?.message) console.error(err.message);
      return Promise.reject(err);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) throw new Error("Refresh token not found");
      const { data } = await axios.post(`${BASE_URL}/users/auth/token/refresh/`, { refresh });
      const access = data?.access;
      if (!access) throw new Error("No access token");
      localStorage.setItem("access_token", access);
      api.defaults.headers.Authorization = `Bearer ${access}`;
      flush(null, access);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch (e) {
      console.error(e?.message || "Auth error");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      flush(e, null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getMe = () => api.get("/users/me/");
export default api;
