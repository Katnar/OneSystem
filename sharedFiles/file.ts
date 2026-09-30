import { PersonalNumber } from "./auth/authTypes";
import { BrandedString, NonEmptyString, Result } from "./global";


// ---------------------- BASIC TYPES --------------------------------------

export type FileID = BrandedString<"file identifier">

export type FileMetaData = {
    _id: FileID,
    uploadedBy: PersonalNumber,
    fileName: NonEmptyString,
    mimeType: NonEmptyString,
    createdAt: Date
}


// ---------------------- WIRE TYPES --------------------------------------
// GET {api}/files/{fileID}
export type GetFileMetaDataResponse = Result<FileMetaData, NonEmptyString>
// GET {api}/files/{fileID}/content   --->    should return the actual file Blob