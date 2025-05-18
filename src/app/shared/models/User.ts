import { Tweet } from "./Tweet";

export interface User {
    id: string;
    username: string;
    email: string;
    created_at: string;
    bio?: string;
    profile_image_url?: string;
    birthday?: string;
    phoneNumber?: string;
    tweets?: Tweet[];
}