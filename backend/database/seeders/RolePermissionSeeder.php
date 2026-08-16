<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public const PERMISSIONS = [
        'users.view',
        'users.manage',
        'projects.view',
        'projects.manage',
        'deposits.view',
        'deposits.manage',
        'withdrawals.view',
        'withdrawals.manage',
        'investments.view',
        'transactions.view',
        'referrals.view',
        'notifications.manage',
        'reports.view',
        'audit.view',
        'settings.manage',
    ];

    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $superAdmin->syncPermissions(self::PERMISSIONS);
        $admin->syncPermissions(self::PERMISSIONS);
    }
}
