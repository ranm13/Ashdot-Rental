-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "house_number" INTEGER NOT NULL,
    "map_x" REAL NOT NULL,
    "map_y" REAL NOT NULL,
    "units_per_building" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ResidentApartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "building_id" TEXT NOT NULL,
    "apartment_name" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "rent" REAL,
    "square_meters" REAL DEFAULT 0,
    "arnona_id" TEXT NOT NULL,
    "water_id" TEXT NOT NULL DEFAULT '',
    "electricity_id" TEXT NOT NULL DEFAULT '',
    "contract_end" TEXT NOT NULL,
    "is_linked" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "payment_dest" TEXT NOT NULL DEFAULT '',
    "maintenance_log" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ResidentApartment_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentApartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "building_id" TEXT NOT NULL,
    "apartment_num" INTEGER NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "rent" REAL,
    "arnona_id" TEXT NOT NULL,
    "water_id" TEXT NOT NULL,
    "contract_end" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "payment_dest" TEXT NOT NULL DEFAULT '',
    "maintenance_log" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StudentApartment_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "business_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "parcel_id" INTEGER NOT NULL,
    "rent" REAL,
    "arnona_id" TEXT NOT NULL,
    "water_id" TEXT NOT NULL,
    "contract_end" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "maintenance_log" TEXT NOT NULL DEFAULT '',
    "square_meters" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "salary" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MaintenanceIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "building_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "cost" REAL NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL DEFAULT '',
    "supplier" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'external',
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Building_house_number_key" ON "Building"("house_number");
