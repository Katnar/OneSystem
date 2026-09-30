import { Role, User } from "./authTypes"
import { NonEmptyArray, tryIntoNonEmptyArr, unwrap } from "../global"
import { Mador } from "../mador"

// this is inspired by TA's union and intersection system for filters (since permissions are glorified filters)
export type Permission = {
    acceptedMadors: NonEmptyArray<Mador>,
    acceptedRoles: NonEmptyArray<Role>,
    unionWith: readonly Permission[],
    intersectionWith: readonly Permission[]
}

export function allowOnly({
    madors,
    roles
}: {
    madors?: NonEmptyArray<Mador>,
    roles?: NonEmptyArray<Role>
}): Permission {
    return {
        acceptedMadors: madors ?? unwrap(tryIntoNonEmptyArr(Object.values(Mador))),
        acceptedRoles: roles ?? unwrap(tryIntoNonEmptyArr(Object.values(Role))),
        unionWith: [],
        intersectionWith: []
    }
}

// allow if user satisfies AT LEAST ONE permission 
export function unitePermissions(permissions: NonEmptyArray<Permission>): Permission {
    const basePerm = permissions[0];
    const toUniteWith = permissions.slice(1);
    return {
        ...basePerm,
        unionWith: [...basePerm.unionWith, ...toUniteWith]
    };
}

// allow only if user satisfies ALL permissions
export function intersectPermissions(permissions: NonEmptyArray<Permission>): Permission {
    const basePerm = permissions[0];
    const toUniteWith = permissions.slice(1);
    return {
        ...basePerm,
        intersectionWith: [...basePerm.unionWith, ...toUniteWith]
    };
}

function hasAnyPermission(permissions: readonly Permission[], user: User): boolean {
    for (const p of permissions) {
        if (hasPermission(p, user)) {
            return true;
        }
    }
    return false;
}

function hasAllPermissions(permissions: readonly Permission[], user: User): boolean {
    for (const p of permissions) {
        if (!hasPermission(p, user)) {
            return false;
        }
    }
    return true;
}

export function hasPermission(permission: Permission, user: User): boolean {
    return (
        (
            permission.acceptedMadors.includes(user.mador),
            permission.acceptedRoles.includes(user.role)
        ) ?? hasAnyPermission(permission.unionWith, user)
    ) && hasAllPermissions(permission.intersectionWith, user);
}