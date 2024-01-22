-- AlterTable
ALTER TABLE `Category` ADD COLUMN `deleted_by_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_deleted_by_id_fkey` FOREIGN KEY (`deleted_by_id`) REFERENCES `Admin`(`login_id`) ON DELETE CASCADE ON UPDATE CASCADE;
