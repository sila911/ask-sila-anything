
-- Create Database
CREATE DATABASE IF NOT EXISTS ask_sila_anything;
USE ask_sila_anything;

-- Create Question Table
CREATE TABLE IF NOT EXISTS `Question` (
    `id` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `answeredAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`),
    INDEX `Question_status_idx`(`status`),
    INDEX `Question_createdAt_idx`(`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Design Table
CREATE TABLE IF NOT EXISTS `Design` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NULL,
    `questionText` TEXT NULL,
    `answerText` TEXT NULL,
    `text` TEXT NOT NULL,
    `style` JSON NOT NULL,
    `imageDataUrl` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `stats` JSON NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `Design_questionId_idx`(`questionId`),
    INDEX `Design_updatedAt_idx`(`updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Event Table
CREATE TABLE IF NOT EXISTS `Event` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `meta` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `Event_type_idx`(`type`),
    INDEX `Event_createdAt_idx`(`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
