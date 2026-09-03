ALTER TABLE `users` ADD `plan` enum('none','free','monthly','annual') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `planActivatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `dailyUsageDate` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `dailyUsageSeconds` int DEFAULT 0 NOT NULL;