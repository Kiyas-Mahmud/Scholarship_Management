CREATE TABLE `professor_tags` (
	`professor_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`professor_id`, `tag_id`)
);
--> statement-breakpoint
CREATE INDEX `professor_tags_tag_idx` ON `professor_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `professors` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`professor_name` text NOT NULL,
	`email` text NOT NULL,
	`university_name` text NOT NULL,
	`department` text,
	`country` text,
	`research_area` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`last_contact_at` text,
	`next_followup_at` text,
	`deadline_at` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `professors_user_status_idx` ON `professors` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `professors_user_deadline_idx` ON `professors` (`user_id`,`deadline_at`);--> statement-breakpoint
CREATE INDEX `professors_user_followup_idx` ON `professors` (`user_id`,`next_followup_at`);--> statement-breakpoint
CREATE INDEX `professors_user_country_idx` ON `professors` (`user_id`,`country`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tags_user_name_idx` ON `tags` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`degree_target` text DEFAULT 'MS' NOT NULL,
	`research_interests` text,
	`preferred_countries` text,
	`signature_block` text,
	`cv_file_key` text,
	`cv_file_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`auth_provider` text DEFAULT 'local' NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text,
	`is_active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);