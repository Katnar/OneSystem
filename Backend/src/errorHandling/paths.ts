export const ERROR_PATH = "/error";
export const SIGN_IN_RAW_PATH = "/signin";
export const buildErrorPath = (message: string) => `${ERROR_PATH}?message=${encodeURIComponent(message)}`;
