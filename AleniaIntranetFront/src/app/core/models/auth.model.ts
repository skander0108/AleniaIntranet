export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}
