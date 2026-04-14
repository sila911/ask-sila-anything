-- AlterTable
ALTER TABLE `Design` ADD COLUMN `answerText` TEXT NULL,
    ADD COLUMN `questionId` VARCHAR(191) NULL,
    ADD COLUMN `questionText` TEXT NULL;

-- CreateIndex
CREATE INDEX `Design_questionId_idx` ON `Design`(`questionId`);
