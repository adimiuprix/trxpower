<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TestController extends Controller
{
    public function index()
    {
        // get block number
        // $response = Http::post(
        //     'https://api-bsc-mainnet-full.n.dwellir.com/a825c7bf-4074-4ec1-af64-4eebad3d6d25',
        //     [
        //         'jsonrpc' => '2.0',
        //         'method' => 'eth_blockNumber',
        //         'params' => [],
        //         'id' => 1,
        //     ]
        // );
        // $blockNumber = $response->json('result'); // 0x771f3fe
        // $blockInteger = hexdec($blockNumber);
        // $intToHex = '0x' . dechex(124911090);

        // $response = Http::post(
        //     'https://api-bsc-mainnet-full.n.dwellir.com/a825c7bf-4074-4ec1-af64-4eebad3d6d25',
        //     [
        //         'jsonrpc' => '2.0',
        //         'method' => 'eth_getBlockByNumber',
        //         'params' => ["0x771fdf2", true],
        //         'id' => 1,
        //     ]
        // );
        // $getBlockNumber = $response->json('result')['transactions'];

        // $response = Http::post(
        //     'https://api-bsc-mainnet-full.n.dwellir.com/a825c7bf-4074-4ec1-af64-4eebad3d6d25',
        //     [
        //         'jsonrpc' => '2.0',
        //         'method' => 'eth_getBlockByHash',
        //         'params' => ["0x7dcecaf1a8bcac783d98840c743f28a2958351055bb691e6724f9847451099ef", true],
        //         'id' => 1,
        //     ]
        // );
        // $blockHash = $response->json('result');

        $response = Http::post(
            'https://api-bsc-mainnet-full.n.dwellir.com/a825c7bf-4074-4ec1-af64-4eebad3d6d25',
            [
                'jsonrpc' => '2.0',
                'method' => 'eth_getBlockReceipts',
                'params' => ["0x7dcecaf1a8bcac783d98840c743f28a2958351055bb691e6724f9847451099ef"],
                'id' => 1,
            ]
        );
        $blockReceipts = $response->json('result');

        dd($blockReceipts);
    }
}
