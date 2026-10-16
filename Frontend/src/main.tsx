import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { APIContextProvider } from "./api";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { startAuthStorageSync } from "./features/auth";

const stopAuthStorageSync = startAuthStorageSync(store);
if (import.meta.hot) import.meta.hot.dispose(stopAuthStorageSync);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<ToastContainer position="bottom-center" rtl />
			<APIContextProvider>
				<h1>OneSystem</h1>
			</APIContextProvider>
		</Provider>
	</StrictMode>
);
