<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->api(append: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'force.json' => \App\Http\Middleware\ForceJsonResponse::class,
        ]);

        $middleware->throttleApi('api');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e) {
            if (request()->is('api/*') || request()->wantsJson()) {
                $status = 500;
                $message = 'Terjadi kesalahan pada server. Silakan coba lagi.';
                $errors = null;

                if ($e instanceof ValidationException) {
                    $status = 422;
                    $message = $e->getMessage();
                    $errors = $e->errors();
                } elseif ($e instanceof AuthenticationException) {
                    $status = 401;
                    $message = 'Sesi anda telah berakhir. Silakan login kembali.';
                } elseif ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    $status = 403;
                    $message = 'Anda tidak memiliki akses untuk melakukan aksi ini.';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    $status = 404;
                    $message = 'Sumber daya tidak ditemukan.';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException) {
                    $status = 405;
                    $message = 'Metode request tidak diizinkan.';
                } elseif ($e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException) {
                    $status = 429;
                    $message = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                    $status = $e->getStatusCode();
                    $message = $e->getMessage() ?: 'Terjadi kesalahan.';
                } elseif (config('app.debug')) {
                    $message = $e->getMessage();
                }

                return new JsonResponse([
                    'success' => false,
                    'message' => $message,
                    'errors' => $errors,
                ], $status);
            }

            return null;
        });
    })->create();
