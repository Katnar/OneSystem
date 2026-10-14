import { toast } from "react-toastify";

export function unexpectedError(error: unknown) {
    // NOTE: we probably want to change this to redirecting to an error page or something
	console.error("Unexpected error:", error);
	toast.error("אירעה שגיאה בלתי צפויה. מידע נוסף בקונסולה");
}
