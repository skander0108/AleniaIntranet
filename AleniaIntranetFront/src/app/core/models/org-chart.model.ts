export interface OrgNode {
    id: string;
    fullName: string;
    title: string;
    department: string;
    avatarUrl: string;
    statusColor: string;
    reportsCount: number;
    children: OrgNode[];
}
