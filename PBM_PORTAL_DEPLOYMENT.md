# PBM Children Portal Setup

The admission, College, and graduate Career workflows use their own Neon database and PBM-only accounts. They do not use the ERP `DATABASE_URL`, ERP staff users, or ERP child records.

## Required server environment

Configure these as server-only environment variables in the PBM portal's Vercel project and in `.env.local` for local development:

- `PBM_DATABASE_URL`: connection string for the `pbm_children` database in the separate **PBM Children Progress** Neon project.
- `PBM_SESSION_SECRET`: a cryptographically random secret with at least 32 characters, used to sign PBM-only sessions.
- `PBM_SETUP_KEY`: a separate, one-time secret with at least 32 characters. Use it at `/pbm-staff/setup` to create the first administrator. The application never returns this value.
- `BLOB_READ_WRITE_TOKEN`: required to store private child photos and documents.

Do not copy the PBM connection string into `DATABASE_URL` or `DIRECT_URL`. The PBM-specific tables are created by the PBM API when first accessed; use a database role that can create tables.

## First-time accounts

1. Set the three `PBM_*` values in the Production environment and deploy.
2. Open `/pbm-staff/setup`, provide the `PBM_SETUP_KEY`, then choose the administrator's username, name, and password (at least 12 characters).
3. After sign-in, open **Staff Accounts** to create individual PBM staff accounts.
4. Staff add a child and may create that child's Career username/password from the admission form. The child uses `/professional-career` to add University and later employment updates.

The first administrator setup is atomic and can only succeed once. Graduate passwords and staff passwords are stored as password hashes.

## Existing browser records

After the first PBM staff sign-in, genuine records in the old `psh_admissions_records` browser storage are imported if the PBM database is empty. Built-in sample rows are excluded. Browser storage is cleared only after the import completes successfully. JSON backup import writes to the PBM database; JSON export remains available to staff.

## Database isolation

The application keeps the ERP Prisma client and its `DATABASE_URL` unchanged. All child portal reads and writes in the admission, Academic, and Professional Career paths use the dedicated PBM client and `PBM_DATABASE_URL`.
