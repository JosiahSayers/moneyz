/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Benefactor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Benefactor_name_key" ON "Benefactor"("name");
