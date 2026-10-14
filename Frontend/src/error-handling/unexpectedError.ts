import { toast } from "react-toastify";


export function unexpectedError(error: unknown) {
    console.error("Unexpected error:", error);
    toast.error("אירעה שגיאה בלתי צפויה. מידע נוסף בקונסולה");
}