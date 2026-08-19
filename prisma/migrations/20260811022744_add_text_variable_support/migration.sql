/*
  Warnings:

  - You are about to drop the column `value` on the `RecordValue` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecordValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    "numberValue" REAL,
    "textValue" TEXT,
    CONSTRAINT "RecordValue_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "CustomRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecordValue_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "TemplateVariable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecordValue" ("id", "recordId", "variableId") SELECT "id", "recordId", "variableId" FROM "RecordValue";
DROP TABLE "RecordValue";
ALTER TABLE "new_RecordValue" RENAME TO "RecordValue";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
