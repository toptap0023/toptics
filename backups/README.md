# Backups

`toptics.sql` is a full `pg_dump` of the Supabase database, refreshed every 3 days by
`.github/workflows/backup.yml`. Git history keeps every past version, so you can recover
any month's state with `git log -- backups/toptics.sql`.

The 3-day cadence also keeps the free-tier Supabase project from auto-pausing. A paused
project makes token refresh fail, which is what kicked you back to the login screen after
a few weeks of not opening the app.

## Restore into any Postgres (Supabase, Neon, local)

```bash
psql "<TARGET_DB_URL>" < backups/toptics.sql
```

## Setup (one time)

1. Supabase dashboard > Settings > Database > Connection string > **URI**. Copy it.
2. GitHub repo > Settings > Secrets and variables > Actions > New repository secret.
   Name: `SUPABASE_DB_URL`, value: the URI from step 1.
3. Actions tab > "DB backup + keep-alive" > Run workflow, to test it once.
