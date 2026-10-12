import { BrandedString } from "../global";
import { Mador } from "../mador";
// just putting this here so it will cause a merge conflict with the auth PR.
// I need this type but I also need to make sure someone remembers to clean the temporary type I created and a merge conflict is a great reminder.
export type PersonalNumber = BrandedString<"personal number">;

// this one you should actually keep when merging if not already implemented in  the PR
export const Role = {
    SYSTEM_ADMIN: "מנהל מערכת",
    BUDGET_MANAGER: "מנהל תקציב",
    SECTION_HEAD: "ראש מדור",
    CONTRACT_MANAGER: "מנהל חוזה"
} as const;
export type Role = typeof Role[keyof typeof Role]

// again, i need this type but i need for someone to remember to replace it with the actual type so merge conflict it is
export type User = {
    mador: Mador,
    role: Role
}