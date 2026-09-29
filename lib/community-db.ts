import {env} from "cloudflare:workers";
export function communityDb():D1Database {const db=(env as {DB?:D1Database}).DB;if(!db)throw new Error("Community storage unavailable");return db;}

export function communityAudio():R2Bucket {const bucket=(env as {AUDIO?:R2Bucket}).AUDIO;if(!bucket)throw new Error("Audio storage unavailable");return bucket;}
