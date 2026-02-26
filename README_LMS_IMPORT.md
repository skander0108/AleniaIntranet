# LMS Data Import Guide

## Setup
1.  Open a terminal in this folder.
2.  Install dependencies:
    ```bash
    npm install pg dotenv
    ```

## How to Import Data
1.  Export your LMS data to a CSV file named `lms_progress_export.csv` in this folder.
2.  Ensure the CSV has the following columns (in order, or update the script):
    *   **Email** (Must match a user email in the database)
    *   **Course Title**
    *   **Status** (Completed, In Progress, Passed, etc.)
    *   **Date** (YYYY-MM-DD)
    *   **Score** (0-100)
3.  Run the script:
    ```bash
    node ingest_lms_data.mjs
    ```
4.  Check the output for success/error messages.

## Troubleshooting
-   **User not found**: Ensure the email in the CSV matches exactly with the email in the `users` table.
-   **Database connection error**: Check your `.env` file or the `DB_CONFIG` in `ingest_lms_data.mjs`.
