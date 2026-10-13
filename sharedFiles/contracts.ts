import type { PersonalNumber } from "./auth/authTypes";
import type { FileID } from "./file";
import type { NonEmptyArray } from "./general/Arrays/nonEmptyArray";
import type { BrandedNumber, MoneyILS } from "./general/NumberStrings/numberStrings";
import type { BrandedString } from "./general/Strings/brandedString";
import type { NonEmptyString } from "./general/Strings/nonEmptyString";
import type { APIResult, AsWireType, SomeOrDefault } from "./global";
import type { Mador } from "./mador/mador";
import type { SupplierID } from "./supplier";

export type ContractNumber = BrandedString<"contract number">;
export const ContractType = {
	TENDER: "מכרז",
	EXEMPTION: "פטור",
	SMALL_ORDER: "הזמנה קטנה",
} as const;
export type ContractType = (typeof ContractType)[keyof typeof ContractType];

export const ContractStatus = {
	ACTIVE: "פעילה",
	BUDGET_LOW: "תקציב אוזל",
	NEAR_EXPIRY: "לקראת סיום",
	STOPPED: "בעצירה",
	RENEWAL_STARTED: "תחילת חידוש",
	LESSONS_LEARNED: "לקחים",
	KICKOFF: "התנעה",
	PRICING: "תמחור",
	RECOMMENDATIONS: "המלצות",
	MANHAR: "מנה״ר",
	MANHAR_COMMENTS: "הערות מנה״ר",
	BLM: "בל״מ",
	RENEWAL_TENDER: "מכרז",
	SUPPLIER_QUESTIONS: "שאלות ספקים",
	THRESHOLD_REQUIREMENTS: "תנאי סף",
	WINNER_SELECTION: "קביעת זוכה",
	AGREEMENT_OPENING: "פתיחת הסכם",
	EXPIRED: "פגת תוקף",
} as const;
export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export type Mihlak = BrandedNumber<"mihlak">;

export type Contract = {
	contractNumber: ContractNumber;
	mador: Mador;
	contractType: ContractType;
	endDate: Date;
	agreementValueExclVat: MoneyILS;
	usedAmountExclVat: MoneyILS;
	previousContract: ContractNumber | null;
	status: ContractStatus;
	responsibleUser: PersonalNumber;
	supplier: SupplierID;
	SOW: FileID | null;
	shaaton: FileID | null;
	pricingList: FileID | null;
	SLA: FileID | null;
	mihlak: Mihlak;
	lastUpdate: Date;
	contract: FileID | null;
};

export const ContractFileField = ["SOW", "shaaton", "pricingList", "SLA", "contract"] as const;
export type ContractFileField = (typeof ContractFileField)[number];
// --------------------------------- WIRE TYPES ----------------------------------------------------------
// GET {api}/{mador}/contracts
export type GetContractsResponse<M extends Mador> = APIResult<
	{ contracts: SomeOrDefault<NonEmptyArray<Contract & { mador: M }>, "נראה שאין התקשרויות זמינות במערכת"> },
	NonEmptyString
>;

// POST {api}/{mador}/contracts
export type AddNewContractPayload = AsWireType<{
	contract: Omit<Contract, ContractFileField | "lastUpdate" | "mador"> & {
		previousContract: SomeOrDefault<ContractNumber, null>;
	};
}>;
export type AddNewContractResponse = APIResult<
	{ added: Contract; message: "ההתקשרות נוספה בהצלחה" },
	"לא ניתן היה להוסיף את ההתקשרות. יש לנסות שוב" | "לא נמצאו מנהלי חוזה במדור שנבחר."
>;

// POST {api}/{mador}/contracts/{contractNumber}/{contractFileField}/
export type AddFileToContractPayload = AsWireType<{}>;
export type AddFileToContractResponse = APIResult<
	{ added: Contract; message: "הקובץ התווסף בהצלחה" },
	"לא ניתן היה להוסיף את הקובץ. יש לנסות שוב"
>;

// PATCH {api}/{mador}/contracts/{contractNumber}
export type EditContractPayload = AsWireType<{
	patch: Partial<
		Omit<Contract, ContractFileField | "lastUpdate" | "contractNumber" | "mador"> & {
			previousContract: SomeOrDefault<ContractNumber, null>;
		}
	>;
}>;
export type EditContractResponse = APIResult<
	{ edited: Contract; message: "ההתקשרות התעדכנה בהצלחה" },
	"לא ניתן היה לעדכן את ההתקשרות. יש לנסות שוב"
>;
// DELETE {api}/{mador}/contracts/{contractNumber}
export type DeleteContractResponse = APIResult<
	"ההתקשרות נמחקה בהצלחה",
	| "לא ניתן למחוק את ההתקשרות משום שקיימות הזמנות המקושרות אליה והיא מוגדרת כהתקשרות קודמת של התקשרויות אחרות."
	| "לא ניתן למחוק את ההתקשרות. יש לנסות שוב."
>;
