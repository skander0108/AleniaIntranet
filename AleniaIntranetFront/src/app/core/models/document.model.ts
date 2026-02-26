export interface Document {
    id: number;
    title: string;
    fileName: string;
    fileType: string;
    category: string;
    accessLevel: string;
    department?: string;
    uploadDate: Date;
    archived: boolean;
}
