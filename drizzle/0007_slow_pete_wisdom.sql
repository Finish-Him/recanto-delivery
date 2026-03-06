CREATE TABLE `addonCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`required` boolean NOT NULL DEFAULT false,
	`minSelect` int NOT NULL DEFAULT 0,
	`maxSelect` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `addonCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `addons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`available` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `addons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `addonCategories` ADD CONSTRAINT `addonCategories_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `addons` ADD CONSTRAINT `addons_categoryId_addonCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `addonCategories`(`id`) ON DELETE no action ON UPDATE no action;