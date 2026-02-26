export enum LeaveStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum LeavePeriod {
    AM = 'AM',
    PM = 'PM'
}

export interface LeaveType {
    id: string;
    name: string;
    requiresApproval: boolean;
    deductsBalance: boolean;
    allowancePerYear: number;
    colorCode: string;
}

export interface LeaveBalance {
    id: string;
    leaveType: LeaveType;
    totalAllowance: number;
    daysTaken: number;
    daysPending: number;
    daysRemaining: number;
    year: number;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: LeaveType;
    startDate: string; // ISO Date
    startPeriod: LeavePeriod;
    endDate: string; // ISO Date
    endPeriod: LeavePeriod;
    duration: number;
    status: LeaveStatus;
    reason: string;
    managerComment?: string;
    attachmentUrl?: string;
    createdAt: string;
}

export interface LeaveRequestCreate {
    leaveTypeId: string;
    startDate: string; // YYYY-MM-DD
    startPeriod: LeavePeriod;
    endDate: string; // YYYY-MM-DD
    endPeriod: LeavePeriod;
    reason: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
