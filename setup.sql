
-- Create Database
CREATE DATABASE IF NOT EXISTS ask_sila_anything;
USE ask_sila_anything;

-- Create Question Table
CREATE TABLE IF NOT EXISTS `questions` (
    `id` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `answer_likes_count` INT NOT NULL DEFAULT 0,
    `reactions` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `answeredAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`),
    INDEX `questions_status_idx`(`status`),
    INDEX `questions_createdAt_idx`(`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Design Table
CREATE TABLE IF NOT EXISTS `designs` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NULL,
    `questionText` TEXT NULL,
    `answerText` TEXT NULL,
    `text` TEXT NOT NULL,
    `style` JSON NOT NULL,
    `imageDataUrl` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `stats` JSON NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `designs_questionId_idx`(`questionId`),
    INDEX `designs_updatedAt_idx`(`updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Event Table
CREATE TABLE IF NOT EXISTS `events` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `meta` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `events_type_idx`(`type`),
    INDEX `events_createdAt_idx`(`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
