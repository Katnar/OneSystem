import { Role, User } from "./authTypes"
import { NonEmptyArray, tryIntoNonEmptyArr, unwrap } from "../global"
import { Mador } from "../mador"

// this is inspired by TA's union and intersection system for filters (since permissions are glorified filters)

type AllowOnlyPermission = {
    type: "allowOnly";
    acceptedMadors: NonEmptyArray<Mador>;
    acceptedRoles: NonEmptyArray<Role>;
};

type UnionPermission = {
    type: "union";
    permissions: NonEmptyArray<Permission>;
};

type IntersectionPermission = {
    type: "intersection";
    permissions: NonEmptyArray<Permission>;
};


export type Permission =
    | AllowOnlyPermission
    | UnionPermission
    | IntersectionPermission;



export function allowOnly({
    madors,
    roles
}: {
    madors?: NonEmptyArray<Mador>;
    roles?: NonEmptyArray<Role>;
}): Permission {
    return {
        type: "allowOnly",
        acceptedMadors:
            madors ?? unwrap(tryIntoNonEmptyArr(Object.values(Mador))),
        acceptedRoles:
            roles ?? unwrap(tryIntoNonEmptyArr(Object.values(Role)))
    };
}

// allow if user satisfies AT LEAST ONE permission 
export function unitePermissions(
    permissions: NonEmptyArray<Permission>
): Permission {
    return {
        type: "union",
        permissions
    };
}

// allow only if user satisfies ALL permissions
export function intersectPermissions(
    permissions: NonEmptyArray<Permission>
): Permission {
    return {
        type: "intersection",
        permissions
    };
}


export function hasPermission(
    permission: Permission,
    user: User
): boolean {
    switch (permission.type) {
        case "allowOnly":
            return (
                permission.acceptedMadors.includes(user.mador) &&
                permission.acceptedRoles.includes(user.role)
            );

        case "union":
            return permission.permissions.some(
                p => hasPermission(p, user)
            );

        case "intersection":
            return permission.permissions.every(
                p => hasPermission(p, user)
            );
    }
}