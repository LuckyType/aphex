export interface MigrateOptions {
    /** Folder holding the generated `.sql` migrations + `meta/`. Default `./drizzle`. */
    migrationsFolder?: string;
}
export interface MigrateResult {
    driver: 'postgresql' | 'pglite' | 'sqlite';
    target: string;
}
export declare function runMigrations(options?: MigrateOptions): Promise<MigrateResult>;
//# sourceMappingURL=migrate.d.ts.map