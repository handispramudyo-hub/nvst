<?php

namespace App\Support;

class ReferenceNumber
{
    public static function generate(string $prefix): string
    {
        return strtoupper($prefix.'-'.date('ymd').strtoupper(str()->random(8)));
    }
}
