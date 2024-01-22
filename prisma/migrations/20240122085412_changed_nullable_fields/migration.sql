-- AlterTable
ALTER TABLE `Category` MODIFY `updated_by_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Post` MODIFY `deleted_by_id` VARCHAR(191) NULL,
    MODIFY `updated_by_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `updated_by_id` VARCHAR(191) NULL;
