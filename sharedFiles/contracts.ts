import { PersonalNumber } from "./auth/authTypes";
import { FileID } from "./file";
import { BrandedNumber, BrandedString, MoneyILS } from "./global";
import { Mador } from "./mador";
import { SupplierID } from "./supplier";


export type ContractNumber = BrandedString<"contract number">;
export const ContractType = {
    TENDER: "מכרז",
    EXEMPTION: "פטור",
    SMALL_ORDER: "הזמנה קטנה"
} as const;
export type ContractType = typeof ContractType[keyof typeof ContractType];

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
export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

export type Mihlak = BrandedNumber<"mihlak">;

export type Contract = {
    contractNumber: ContractNumber,
    mador: Mador,
    contractType: ContractType,
    endDate: Date,
    agreementValueExclVat: MoneyILS,
    usedAmountExclVat: MoneyILS,
    previousContract: ContractNumber | null,
    status: ContractStatus,
    responsibleUser: PersonalNumber,
    supplier: SupplierID,
    SOW: FileID | null,
    shaaton: FileID | null,
    pricingList: FileID | null,
    SLA: FileID | null,
    mihlak: Mihlak,
    lastUpdate: Date,
    contract: FileID
}