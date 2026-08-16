<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investment\StoreInvestmentRequest;
use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use App\Models\Project;
use App\Services\EarningService;
use App\Services\InvestmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class InvestmentController extends Controller
{
    public function __construct(
        private readonly InvestmentService $investmentService,
        private readonly EarningService $earningService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->string('status');

        $query = $request->user()->investments()->with('project');

        if ($request->has('status')) {
            $query->where('status', $status);
        }

        $investments = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10));

        return $this->paginated(InvestmentResource::collection($investments), 'Daftar investasi.');
    }

    public function store(StoreInvestmentRequest $request): JsonResponse
    {
        $project = Project::findOrFail($request->validated('project_id'));

        try {
            $investment = $this->investmentService->create(
                $request->user(),
                $project,
                (float) $request->validated('amount'),
                $request->validated('pin'),
                $request->validated('idempotency_key'),
            );
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        $this->investmentService->processReferralCommission($investment);

        return $this->success(new InvestmentResource($investment->load('project')), 'Investasi berhasil dibuat.', 201);
    }

    public function show(Request $request, Investment $investment): JsonResponse
    {
        if ($investment->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke investasi ini.', 403);
        }

        $investment->load('project', 'earnings');

        $earnings = $investment->earnings()->orderBy('earning_date')->get();
        $earningsChart = $earnings->map(fn ($e) => [
            'date' => Carbon::parse($e->earning_date)->format('d M'),
            'amount' => (float) $e->amount,
        ]);

        return $this->success([
            'investment' => new InvestmentResource($investment),
            'earnings_chart' => $earningsChart,
        ], 'Detail investasi.');
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $active = $user->investments()->where('status', Investment::STATUS_ACTIVE);
        $completed = $user->investments()->where('status', Investment::STATUS_COMPLETED);

        return $this->success([
            'total_invested' => (float) $user->wallet->total_invested,
            'active_investments' => (int) $active->count(),
            'active_amount' => (float) $active->sum('amount'),
            'total_expected_return' => (float) $completed->sum('expected_return_amount'),
            'total_earned' => (float) $user->wallet->total_profit,
            'today_profit' => (float) $this->earningService->getTodayProfit($user),
        ], 'Ringkasan portfolio.');
    }
}
