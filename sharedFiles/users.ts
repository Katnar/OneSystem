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
    INVALID_INPUT: "קלט אינו תקין",
    UNAUTHORIZED: "המשתמש אינו מחובר",
    FORBIDDEN: "המשתמש אינו רשאי",
    NOT_FOUND: "משתמש אינו נמצא",
    CONFLICT: "נמצא קונפליקט",
    SERVER_ERROR: "שגיאת שרת, נסה שוב מאוחר יותר",
} as const;
export type UsersErrorMessages = 
    (typeof USERS_ERROR_MESSAGES)[keyof typeof USERS_ERROR_MESSAGES];

export type GetUsersResponse = APIResult<User[], UsersErrorMessages>;
export type EditUserResponse = APIResult<User, UsersErrorMessages>;
export type ApproveUserResponse = APIResult<User, UsersErrorMessages>;
export type DeleteUserResponse =
    APIResult<{ personalNumber: PersonalNumber }, UsersErrorMessages>;