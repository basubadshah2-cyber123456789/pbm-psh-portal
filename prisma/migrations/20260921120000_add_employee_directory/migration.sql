CREATE TABLE "EmployeeDirectoryEntry" (
    "id" TEXT NOT NULL,
    "srNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "idCardNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDirectoryEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeDirectoryEntry_srNo_key" ON "EmployeeDirectoryEntry"("srNo");
CREATE UNIQUE INDEX "EmployeeDirectoryEntry_idCardNo_key" ON "EmployeeDirectoryEntry"("idCardNo");

INSERT INTO "EmployeeDirectoryEntry" ("id", "srNo", "name", "designation", "idCardNo", "updatedAt") VALUES
('employee-dir-001', 1, 'Farkhanda Bibi', 'Act. Assistant', '36103-6336697-8', CURRENT_TIMESTAMP),
('employee-dir-002', 2, 'Umer Farooq', 'Receptionist', '36104-7963791-5', CURRENT_TIMESTAMP),
('employee-dir-003', 3, 'Tehmina Mehr', 'Mother Maid', '32102-1471175-4', CURRENT_TIMESTAMP),
('employee-dir-004', 4, 'M. Shaban', 'Naib Qasid', '36303-3028504-3', CURRENT_TIMESTAMP),
('employee-dir-005', 5, 'Kalsoom Akhtar', 'Mother Maid', '36302-7461560-4', CURRENT_TIMESTAMP),
('employee-dir-006', 6, 'Shakila Zafar', 'Mother Maid', '36303-0936762-6', CURRENT_TIMESTAMP),
('employee-dir-007', 7, 'Pathano Mai', 'Mother Maid', '32304-8591639-8', CURRENT_TIMESTAMP),
('employee-dir-008', 8, 'Mumtaz Mai', 'Mother Maid', '32304-0805467-8', CURRENT_TIMESTAMP),
('employee-dir-009', 9, 'Naseem Bibi', 'Mother Maid', '36201-0548367-4', CURRENT_TIMESTAMP),
('employee-dir-010', 10, 'Shamim Bibi', 'Mother Maid', '32304-2244755-4', CURRENT_TIMESTAMP),
('employee-dir-011', 11, 'M. Tahir', 'Care Taker', '36302-3832508-7', CURRENT_TIMESTAMP),
('employee-dir-012', 12, 'Shakeel Ur Rahman', 'Care Taker', '36303-8778594-5', CURRENT_TIMESTAMP),
('employee-dir-013', 13, 'M. Sajjad', 'Cook', '36303-8160567-3', CURRENT_TIMESTAMP),
('employee-dir-014', 14, 'Mehboob Qadir', 'Cook', '36602-0967702-9', CURRENT_TIMESTAMP),
('employee-dir-015', 15, 'Jaffar Jamal', 'Helper Cook', '36303-0150824-9', CURRENT_TIMESTAMP),
('employee-dir-016', 16, 'M. Shaban', 'Helper Cook', '36303-9076944-9', CURRENT_TIMESTAMP),
('employee-dir-017', 17, 'Muneer Ahmad', 'Attendant', '36303-7252274-7', CURRENT_TIMESTAMP),
('employee-dir-018', 18, 'M. Umar', 'Attendant', '36302-9056199-7', CURRENT_TIMESTAMP),
('employee-dir-019', 19, 'Niaz Ahmad', 'Laundry Man', '363018354744', CURRENT_TIMESTAMP),
('employee-dir-020', 20, 'Shahzad', 'Sweeper', '36302-0584064-5', CURRENT_TIMESTAMP),
('employee-dir-021', 21, 'Ratheel John', 'Sweeper', '36302-2065894-4', CURRENT_TIMESTAMP);
