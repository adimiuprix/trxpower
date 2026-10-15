<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class TelegramWebhookController extends Controller
{
    public function setWebhook()
    {
        $url = url('/api/telegram/webhook');

        $response = Http::post("https://api.telegram.org/bot" . config('services.telegram.token') . "/setWebhook", compact('url'));

        return response()->json([
            'success' => $response->successful() && $response->json('ok'),
            'message' => $response->json('description') ?? 'Webhook registered successfully.',
            'webhook_url' => $url,
        ], $response->successful() && $response->json('ok') ? 200 : 500);
    }

    public function Webhook(Request $request)
    {
        if ($message = $request->input('message')) {
            Http::post('https://api.telegram.org/bot' . config('services.telegram.token') . '/sendMessage', [
                'chat_id' => $message['chat']['id'],
                'text' => "⚡️ Welcome to Tron Minerry! ⚡️\n\nStart earning daily TRX yields directly on TRON Network with secure cloud mining rigs.",
                'reply_markup' => [
                    'inline_keyboard' => [
                        [
                            [
                                'text' => '🚀 Open App',
                                'url' => config('services.telegram.application'),
                            ],
                        ],
                    ],
                ],
            ]);
        }

        return response()->json(['ok' => true]);
    }
}
