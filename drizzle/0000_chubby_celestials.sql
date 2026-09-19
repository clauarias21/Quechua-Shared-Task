CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`region` text NOT NULL,
	`language` text NOT NULL,
	`astro` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`attribution` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`rate_key` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contributions_created` ON `contributions` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contributions_rate_key` ON `contributions` (`rate_key`);