<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class VerifyDepositRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Auth handled by Sanctum middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $minAmount = config('services.polygonscan.min_amount', 1.00);
        
        return [
            'tx_hash' => ['required', 'string', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            'expected_amount' => ['required', 'numeric', 'min:' . $minAmount],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $minAmount = config('services.polygonscan.min_amount', 1.00);
        
        return [
            'tx_hash.required' => 'Transaction hash is required.',
            'tx_hash.regex' => 'Invalid transaction hash format. Must be a valid Polygon transaction hash.',
            'expected_amount.required' => 'Expected amount is required.',
            'expected_amount.min' => "Minimum deposit amount is {$minAmount} USDT.",
        ];
    }
}
