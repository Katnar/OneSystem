import axios from "axios";
import { buildErrorPath, ERROR_PATH, SIGN_IN_RAW_PATH } from "../../../Backend/src/errorHandling/paths";
import { clearSignInInfo, getAuthToken } from "../store/AuthStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL && window.location.pathname !== ERROR_PATH) {
	window.location.replace(buildErrorPath("דבאופס טמבל"));
}

export const authenticatedApi = axios.create({ baseURL: API_BASE_URL });

authenticatedApi.interceptors.request.use(config => {
	const token = getAuthToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

authenticatedApi.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			clearSignInInfo();

			if (window.location.pathname !== SIGN_IN_RAW_PATH) {
				window.location.replace(SIGN_IN_RAW_PATH);
			}
		}

		return Promise.reject(error);
	}
);
