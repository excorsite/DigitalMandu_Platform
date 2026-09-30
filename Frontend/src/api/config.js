export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const API_ENDPOINTS = {
  // AUTH (actual backend: /api/register, /api/login, /api/forgot, etc.)
  AUTH_LOGIN: "/login",
  AUTH_REGISTER: "/register",
  AUTH_FORGOT: "/forgot",
  AUTH_VERIFY_OTP: "/verify_otp",
  AUTH_RESET_PASSWORD: "/reset_password",

  // USER PROFILE (mounted at /api/profile)
  USER_PROFILE: "/profile/:id",
  USER_UPDATE_PROFILE: "/profile/:id",
  USER_DELETE_PROFILE: "/profile/:id",
  USER_CHANGE_PASSWORD: "/profile/changePassword/:id",

  // PRODUCTS (public + admin)
  PRODUCTS_LIST: "/products",
  PRODUCT_DETAIL: "/products/:id",
  PRODUCT_CREATE: "/add_product",
  PRODUCT_UPDATE: "/products/:id",
  PRODUCT_DELETE: "/products/:id",
  RECOMMENDATIONS_LIST: "/recommendations",

  // CART
  CART_GET: "/cart",
  CART_ADD: "/cart/:productID",
  CART_REMOVE: "/cart/:cartID",
  CART_UPDATE: "/cart/:cartID",

  // ORDERS (USER)
  ORDER_LIST: "/orders",
  ORDER_CREATE: "/orders",
  ORDER_CANCEL: "/orders/cancel",
  ORDER_UPDATE: "/orders/:id",
  ORDER_DELETE: "/orders/:id",

  // ORDERS (ADMIN)
  ADMIN_ORDERS: "/getOrdersAsAnAdmin",
  ADMIN_ORDER_DETAIL: "/ordersAsAnAdmin/:id",
  ADMIN_ORDER_UPDATE: "/ordersAsAnAdmin/:id",
  ADMIN_ORDER_DELETE: "/ordersAsAnAdmin/:id",

  // PAYMENT
  PAYMENT_INITIATE: "/payment",
  PAYMENT_VERIFY: "/payment/verifyPidx",

  // REVIEWS
  REVIEWS_LIST: "/reviews",
  PRODUCT_REVIEWS: "/reviews/:id",
  REVIEW_CREATE: "/reviews/:id",
  REVIEW_DELETE: "/reviews/:id",

  // ADMIN USERS
  ADMIN_USERS: "/users",
  ADMIN_USER_COUNT: "/users/count",
  ADMIN_USER_DELETE: "/users/:id",
};
