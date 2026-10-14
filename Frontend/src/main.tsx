import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { APIContextProvider } from "./api/ApiWrapper";
import { ToastContainer } from "react-toastify";


createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ToastContainer position="bottom-center" rtl />
		<APIContextProvider>
			<h1>OneSystem</h1>
		</APIContextProvider>
	</StrictMode>
);
