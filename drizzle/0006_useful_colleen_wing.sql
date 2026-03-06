ALTER TABLE `deliveryPersons` ADD `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `deliveryPersons` ADD `shift` enum('manha','tarde','noite','integral') DEFAULT 'integral';--> statement-breakpoint
ALTER TABLE `deliveryPersons` ADD `hiredAt` varchar(10);--> statement-breakpoint
ALTER TABLE `deliveryPersons` ADD `notes` text;