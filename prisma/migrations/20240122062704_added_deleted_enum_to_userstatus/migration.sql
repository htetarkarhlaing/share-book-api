-- AlterTable
ALTER TABLE `User` MODIFY `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'PENDING';
