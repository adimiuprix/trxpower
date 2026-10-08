<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'polygonscan' => [
        'api_key' => env('POLYGONSCAN_API_KEY'),
        'api_url' => env('POLYGONSCAN_API_URL', 'https://api.etherscan.io/v2/api'), // Unified v2 endpoint
        'chain_id' => env('POLYGON_CHAIN_ID', 137), // 137 = mainnet, 80002 = amoy testnet
        'rpc_url' => env('POLYGON_RPC_URL', 'https://polygon-rpc.com/'),
        'usdt_contract' => env('USDT_CONTRACT_ADDRESS', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'),
        'deposit_wallet' => env('DEPOSIT_WALLET_ADDRESS'),
        'min_amount' => env('DEPOSIT_MIN_AMOUNT', 1.00),
        'exchange_rate' => env('EXCHANGE_RATE_USDT_TO_TRX', 3),
    ],

    'tron' => [
        'api_key' => env('TRON_API_KEY'),
        'private_key' => env('TRON_PRIVATE_KEY'),
    ],

];
