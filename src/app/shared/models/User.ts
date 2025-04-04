import { Tweet } from "./Tweet";

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    password: string;
    created_at: string;
    updated_at: string;
    bio?: string;
    profile_image_url?: string;
    birthday?: string;
    tweets?: Tweet[];
}