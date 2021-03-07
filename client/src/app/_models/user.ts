export interface User {
    username: string;
    token: string;
    refreshToken: string;
    photoUrl: string;
    knownAs: string;
    gender: string;
    roles: string[]
}