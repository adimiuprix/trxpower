<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramTaskController extends Controller
{
    public function index()
    {
        // Fetch semua tasks dari database (data publik saja)
        $tasks = Task::all()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'category' => $task->category,
                'icon' => $task->image,
                'reward' => $task->reward,
            ];
        });

        return Inertia::render('TaskPage', [
            'tasks' => $tasks,
        ]);
    }
}
