export const ERROR_PATH = "/error";
export const buildErrorPath = (message: string) => `${ERROR_PATH}?message=${encodeURIComponent(message)}`;
