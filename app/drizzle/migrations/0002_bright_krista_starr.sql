CREATE TABLE `outreach_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`professor_id` text NOT NULL,
	`template_id` text,
	`template_version_id` text,
	`action_type` text NOT NULL,
	`subject_final` text,
	`body_final` text,
	`sent_at` text,
	`meta_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `outreach_logs_user_created_idx` ON `outreach_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `outreach_logs_professor_created_idx` ON `outreach_logs` (`professor_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `outreach_logs_user_action_idx` ON `outreach_logs` (`user_id`,`action_type`);