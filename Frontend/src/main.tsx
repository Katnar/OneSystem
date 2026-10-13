import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { APIContextProvider } from "./api/ApiWrapper";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<APIContextProvider>
			<h1>OneSystem</h1>
		</APIContextProvider>
	</StrictMode>
);
