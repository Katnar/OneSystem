import type { PersonalNumber } from "./auth/authTypes";
import type { BrandedString } from "./general/Strings/brandedString";
import type { NonEmptyString } from "./general/Strings/nonEmptyString";
import type { APIResult } from "./global";

// ---------------------- BASIC TYPES --------------------------------------

export type FileID = BrandedString<"file identifier">;

export type FileMetaData = {
	_id: FileID;
	uploadedBy: PersonalNumber;
	fileName: NonEmptyString;
	mimeType: NonEmptyString;
	createdAt: Date;
};

// ---------------------- WIRE TYPES --------------------------------------
// GET {api}/files/{fileID}
export type GetFileMetaDataResponse = APIResult<FileMetaData, NonEmptyString>;
// GET {api}/files/{fileID}/content   --->    should return the actual file Blob
