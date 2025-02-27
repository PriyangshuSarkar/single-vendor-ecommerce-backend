-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "slug" DROP NOT NULL;
