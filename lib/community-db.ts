import {env} from "cloudflare:workers";
export function communityDb():D1Database {const db=(env as {DB?:D1Database}).DB;if(!db)throw new Error("Community storage unavailable");return db;}
