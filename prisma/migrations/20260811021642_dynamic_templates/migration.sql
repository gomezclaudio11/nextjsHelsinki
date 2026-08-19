-- CreateTable
CREATE TABLE "SpreadsheetTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpreadsheetTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'number',
    "templateId" TEXT NOT NULL,
    CONSTRAINT "TemplateVariable_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SpreadsheetTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomRecord_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SpreadsheetTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecordValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "RecordValue_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "CustomRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecordValue_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "TemplateVariable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
