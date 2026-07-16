import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ro_token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ro_token");
      localStorage.removeItem("ro_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// --------------- Auth ---------------
export const loginUser = (data) =>
  api.post("/auth/login", data).then((r) => r.data);

export const registerUser = (data) =>
  api.post("/auth/register", data).then((r) => r.data);

export const logoutUser = () =>
  api.post("/auth/logout").then((r) => r.data);

export const fetchMe = () =>
  api.get("/auth/me").then((r) => r.data);

// --------------- Dashboard ---------------
export const fetchDashboard = () => api.get("/dashboard").then((r) => r.data);

// --------------- Customers ---------------
export const fetchCustomers = (search = "") =>
  api.get(`/customers${search ? `?search=${search}` : ""}`).then((r) => r.data);

export const fetchCustomer = (id) =>
  api.get(`/customers/${id}`).then((r) => r.data);

export const createCustomer = (data) =>
  api.post("/customers", data).then((r) => r.data);

export const updateCustomer = (id, data) =>
  api.put(`/customers/${id}`, data).then((r) => r.data);

export const deleteCustomer = (id) =>
  api.delete(`/customers/${id}`).then((r) => r.data);

// --------------- RO Systems ---------------
export const fetchCustomerSystems = (custId) =>
  api.get(`/customers/${custId}/systems`).then((r) => r.data);

export const fetchSystem = (id) =>
  api.get(`/systems/${id}`).then((r) => r.data);

export const createSystem = (custId, data) =>
  api.post(`/customers/${custId}/systems`, data).then((r) => r.data);

export const updateSystem = (id, data) =>
  api.put(`/systems/${id}`, data).then((r) => r.data);

export const deleteSystem = (id) =>
  api.delete(`/systems/${id}`).then((r) => r.data);

// --------------- Products ---------------
export const fetchProducts = (search = "") =>
  api.get(`/products${search ? `?search=${search}` : ""}`).then((r) => r.data);

export const fetchProduct = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);

export const createProduct = (data) =>
  api.post("/products", data).then((r) => r.data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`).then((r) => r.data);

// --------------- Filter Replacements ---------------
export const fetchFilterReplacements = (sysId) =>
  api.get(`/systems/${sysId}/filter-replacements`).then((r) => r.data);

export const createFilterReplacement = (sysId, data) =>
  api.post(`/systems/${sysId}/filter-replacements`, data).then((r) => r.data);

export const deleteFilterReplacement = (id) =>
  api.delete(`/filter-replacements/${id}`).then((r) => r.data);

// --------------- Service History ---------------
export const fetchServiceHistory = (sysId) =>
  api.get(`/systems/${sysId}/service-history`).then((r) => r.data);

export const createServiceRecord = (sysId, data) =>
  api.post(`/systems/${sysId}/service-history`, data).then((r) => r.data);

// --------------- Notifications ---------------
export const fetchNotifications = () =>
  api.get("/notifications").then((r) => r.data);
