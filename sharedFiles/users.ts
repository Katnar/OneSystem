import { z } from "zod";
import type { APIResult } from "./global";
import type { PersonalNumber, User } from "./auth/authTypes";
import {
    hasValidUserManagementFields,
    userManagementFieldsSchema,
} from "./auth/authSchemas";

export type EditUserPayload =
    Pick<User, "role" | "mador" | "meshekDescription">;

export const editUserPayloadSchema = userManagementFieldsSchema
    .strict()
    .refine(hasValidUserManagementFields, {
        message: "Invalid role, mador, or meshekDescription combination",
        path: ["role"],
    }) satisfies z.ZodType<EditUserPayload>;

export const USERS_ERROR_MESSAGES = {
    INVALID_INPUT:
        "פרטי המשתמש אינם תקינים. יש לבדוק את המספר האישי ואת התאמת התפקיד, המדור ותיאור המשקים.",
    UNAUTHORIZED:
        "לא ניתן לאמת את ההתחברות. יש להתחבר מחדש. משתמש שטרם אושר אינו יכול לבצע פעולה זו.",
    FORBIDDEN:
        "אין לך הרשאה לצפות במשתמשים אלה או לבצע פעולה על המשתמש שנבחר.",
    NOT_FOUND:
        "המשתמש לא נמצא. יש לרענן את הרשימה ולנסות שוב.",
    CONFLICT:
        "פרטי המשתמש השתנו או שהבקשה כבר טופלה. יש לרענן את הרשימה לפני ביצוע פעולה נוספת.",
    SERVER_ERROR:
        "לא ניתן להשלים את הבקשה עקב שגיאת שרת. יש לרענן את הרשימה ולנסות שוב מאוחר יותר.",
} as const;
export type UsersErrorMessages = 
    (typeof USERS_ERROR_MESSAGES)[keyof typeof USERS_ERROR_MESSAGES];

export type GetUsersResponse = APIResult<User[], UsersErrorMessages>;
export type EditUserResponse = APIResult<User, UsersErrorMessages>;
export type ApproveUserResponse = APIResult<User, UsersErrorMessages>;
export type DeleteUserResponse =
    APIResult<{ personalNumber: PersonalNumber }, UsersErrorMessages>;