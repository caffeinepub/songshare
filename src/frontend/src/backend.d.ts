import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Song {
    id: bigint;
    title: string;
    link: string;
    submittedBy: Principal;
    description: string;
    likes: bigint;
    genre: string;
    timestamp: Time;
    artist: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSong(id: bigint): Promise<void>;
    getAllSongs(): Promise<Array<Song>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGenres(): Promise<Array<string>>;
    getSong(id: bigint): Promise<Song>;
    getSongsByGenre(genre: string): Promise<Array<Song>>;
    getTopSongs(count: bigint): Promise<Array<Song>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeSong(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitSong(title: string, artist: string, genre: string, link: string, description: string): Promise<void>;
}
