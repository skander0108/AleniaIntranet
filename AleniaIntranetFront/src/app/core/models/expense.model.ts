export enum ExpenseStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID'
}

export enum ExpenseCategory {
    TRANSPORT = 'TRANSPORT',
    HOTEL = 'HOTEL',
    MEAL = 'MEAL',
    OTHER = 'OTHER'
}

export enum ExpenseAction {
    CREATED = 'CREATED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID'
}

export interface ExpenseReport {
    id: string;
    userId: string;
    userName?: string;
    missionName: string;
    startDate: string;
    endDate: string;
    description?: string;
    status: ExpenseStatus;
    totalAmount: number;
    lines?: ExpenseLine[];
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseLine {
    id: string;
    reportId: string;
    category: ExpenseCategory;
    amount: number;
    currency: string;
    expenseDate: string;
    vatAmount?: number;
    comment?: string;
    receiptUrl?: string;
}

export interface ExpenseAuditLog {
    id: string;
    reportId: string;
    actionById: string;
    actionByName?: string;
    action: ExpenseAction;
    comment?: string;
    createdAt: string;
}

export interface ExpenseReportCreateDto {
    missionName: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export interface ExpenseLineCreateDto {
    category: string;
    amount: number;
    currency?: string;
    expenseDate: string;
    vatAmount?: number;
    comment?: string;
}
