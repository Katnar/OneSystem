import { Permission } from "../../../sharedFiles/auth/permissions";
import { FileMetaData } from "../../../sharedFiles/file";

export type FileFullMetaData = {
	whoHasAccess: Permission;
} & FileMetaData;
