<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Token
    |--------------------------------------------------------------------------
    |
    | Your Telegram Bot Token from @BotFather
    | Used for validating initData from Telegram Mini Apps
    |
    */
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Init Data Max Age
    |--------------------------------------------------------------------------
    |
    | Maximum age (in seconds) for initData to be considered valid
    | Prevents replay attacks. Default: 86400 (24 hours)
    |
    */
    'init_data_max_age' => env('TELEGRAM_INIT_DATA_MAX_AGE', 86400),
];
