-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "obra_social_id" TEXT;

-- CreateTable
CREATE TABLE "obra_social" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obra_social_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_obra_social_id_fkey" FOREIGN KEY ("obra_social_id") REFERENCES "obra_social"("id") ON DELETE SET NULL ON UPDATE CASCADE;
