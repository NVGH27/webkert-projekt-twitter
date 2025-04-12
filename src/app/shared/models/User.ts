import { Tweet } from "./Tweet";

export interface User {
    username: string;
    email: string;
    password: string;
    created_at: string;
    updated_at: string;
    bio?: string;
    profile_image_url?: string;
    birthday?: string;
    phoneNumber?: string;
    tweets?: Tweet[];
}