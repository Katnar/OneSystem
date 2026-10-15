import { Role, type User } from "@onesystem/shared/auth/authTypes";
import { allowOnly, hasPermission, unitePermissions } from "@onesystem/shared/auth/permissions";

type ManagedUser = Pick<User, "role" | "mador">;

export const manageUsersPermission = unitePermissions([
	allowOnly({ roles: [Role.SYSTEM_ADMIN] }),
	allowOnly({ roles: [Role.SECTION_HEAD] }),
]);

export function canManageUser(actor: User, target: ManagedUser): boolean {
	const permission =
		target.role === Role.SYSTEM_ADMIN
			? allowOnly({ roles: [Role.SYSTEM_ADMIN] })
			: unitePermissions([
					allowOnly({ roles: [Role.SYSTEM_ADMIN] }),
					allowOnly({
						roles: [Role.SECTION_HEAD],
						madors: [target.mador],
					}),
				]);

	return hasPermission(permission, actor);
}

export function requiresUserReapproval(actor: User, target: ManagedUser, proposed: ManagedUser): boolean {
	const isSectionHead = hasPermission(allowOnly({ roles: [Role.SECTION_HEAD] }), actor);

	return isSectionHead && (proposed.mador !== target.mador || proposed.role === Role.SYSTEM_ADMIN);
}
