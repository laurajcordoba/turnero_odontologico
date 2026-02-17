-- CreateTable
CREATE TABLE "implantes_requests" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_dni" TEXT NOT NULL,
    "client_phone" TEXT NOT NULL,
    "client_email" TEXT,
    "client_location" TEXT,
    "obra_social_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "implantes_requests_pkey" PRIMARY KEY ("id")
);
