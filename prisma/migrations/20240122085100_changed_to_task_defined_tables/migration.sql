/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Post` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(3))`.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `Report` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(1))`.
  - The required column `category_id` was added to the `Category` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_by_id` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted_by_admin_id` to the `Post` table without a default value. This is not possible if the table is not empty.
  - The required column `post_id` was added to the `Post` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_by_id` to the `Post` table without a default value. This is not possible if the table is not empty.
  - The required column `report_id` was added to the `Report` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `report_post_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `user_id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_deleted_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_reported_by_id_fkey`;

-- AlterTable
ALTER TABLE `Category` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `category_id` VARCHAR(45) NOT NULL,
    ADD COLUMN `updated_by_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`category_id`);

-- AlterTable
ALTER TABLE `Post` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `deleted_by_admin_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `post_id` VARCHAR(45) NOT NULL,
    ADD COLUMN `updated_by_id` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'PUBLISHED', 'REPORTED', 'DELETED') NOT NULL DEFAULT 'DRAFT',
    ADD PRIMARY KEY (`post_id`);

-- AlterTable
ALTER TABLE `Report` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `post_id`,
    ADD COLUMN `report_id` VARCHAR(45) NOT NULL,
    ADD COLUMN `report_post_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`report_id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `role`,
    ADD COLUMN `token` VARCHAR(191) NULL,
    ADD COLUMN `updated_by_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(45) NOT NULL,
    ADD COLUMN `user_type` ENUM('NORMAL', 'PREMIUM') NOT NULL DEFAULT 'NORMAL',
    MODIFY `password` VARCHAR(300) NOT NULL,
    MODIFY `status` ENUM('NOT_VERIFY', 'VERIFIED', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'NOT_VERIFY',
    ADD PRIMARY KEY (`user_id`);

-- CreateTable
CREATE TABLE `Admin` (
    `login_id` VARCHAR(45) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(300) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_name_key`(`name`),
    PRIMARY KEY (`login_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `Admin`(`login_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `Admin`(`login_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `Admin`(`login_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_deleted_by_id_fkey` FOREIGN KEY (`deleted_by_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_deleted_by_admin_id_fkey` FOREIGN KEY (`deleted_by_admin_id`) REFERENCES `Admin`(`login_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_report_post_id_fkey` FOREIGN KEY (`report_post_id`) REFERENCES `Post`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reported_by_id_fkey` FOREIGN KEY (`reported_by_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
