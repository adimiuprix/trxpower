<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramTaskController extends Controller
{
    public function index(Request $request)
    {
        // Fetch semua tasks dari database
        $allTasks = Task::all();

        // Jika user sudah login via Sanctum, ambil status submission mereka
        $user = $request->user('sanctum');
        $submissionMap = [];

        if ($user) {
            TaskSubmission::where('user_id', $user->id)
                ->get()
                ->each(function ($submission) use (&$submissionMap) {
                    $submissionMap[$submission->task_id] = $submission;
                });
        }

        $tasks = $allTasks->map(function ($task) use ($submissionMap) {
            $submission = $submissionMap[$task->id] ?? null;

            return [
                'id'          => $task->id,
                'title'       => $task->title,
                'description' => $task->description,
                'category'    => $task->category,
                'icon'        => $task->image,
                'reward'      => $task->reward,
                'link'        => $task->task_url,
                'completed'   => (bool) $submission,
                'claimed'     => $submission ? $submission->isClaimed() : false,
            ];
        });

        return Inertia::render('TaskPage', [
            'tasks' => $tasks,
        ]);
    }
}
