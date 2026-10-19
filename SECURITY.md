# Public website security notes

This branch is purpose-built for public static delivery. No account handling, client storage, API credentials, vault operations, production telemetry or remote memory synchronization is implemented.

The in-browser demo holds invented sample records in memory only; user input is shown via textContent, never injected as HTML. No browser-originating data is transmitted. The public website cannot bypass any application server authorization boundary.

**Keep private** the Everloom Memory Nexus application repository, real agent identities, unpublished source reports, cloud keys, secrets, connection strings, migration-state dumps, backups and any real memory entries. Review every published file before a DNS cutover.
