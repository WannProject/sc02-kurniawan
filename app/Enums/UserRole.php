<?php

namespace App\Enums;

enum UserRole: string
{
    case User = 'user';
    case Agent = 'agent';
    case Admin = 'admin';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    public function isSupport(): bool
    {
        return $this === self::Agent || $this === self::Admin;
    }

    public function isPrivileged(): bool
    {
        return $this === self::Admin;
    }
}
