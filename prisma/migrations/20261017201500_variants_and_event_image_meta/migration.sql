-- Догоняющая миграция: поля, которые появились в схеме после первых двух
-- миграций и до сих пор жили только в локальной базе (через db push).
--
-- Без неё `prisma migrate deploy` на чистой базе создаёт таблицы без variants,
-- imageWidth, imageHeight и imageFit, и `pnpm db:seed` падает с ошибкой
-- «The column variants does not exist». На существующей базе колонки уже есть,
-- поэтому миграцию достаточно пометить применённой.

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN "variants" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "imageWidth" INTEGER;
ALTER TABLE "Event" ADD COLUMN "imageHeight" INTEGER;
ALTER TABLE "Event" ADD COLUMN "imageFit" TEXT NOT NULL DEFAULT 'natural';
