CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`professor_id` text,
	`type` text NOT NULL,
	`due_at` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`snoozed_until` text,
	`payload_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reminders_user_due_status_idx` ON `reminders` (`user_id`,`due_at`,`status`);--> statement-breakpoint
CREATE INDEX `reminders_professor_due_idx` ON `reminders` (`professor_id`,`due_at`);