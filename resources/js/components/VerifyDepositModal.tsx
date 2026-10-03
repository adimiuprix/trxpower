import { useState } from 'react';
import Modal from './Modal';
import { createToaster } from "@codenhub/toaster";

const toaster = createToaster({
    position: "top-center",
    duration: 4000,
});

interface VerifyDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    expectedAmount: number;
    onVerificationSuccess?: (data: any) => void;
    onVerificationStart?: () => void;
    onVerificationEnd?: () => void;
}

export default function VerifyDepositModal({
    isOpen,
    onClose,
    expectedAmount,
    onVerificationSuccess,
    onVerificationStart,
    onVerificationEnd,
}: VerifyDepositModalProps) {
    const [txHash, setTxHash] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const validateTxHash = (hash: string): boolean => {
        // BSC transaction hash format: 0x followed by 64 hexadecimal characters
        const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
        return txHashRegex.test(hash);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate transaction hash format
        if (!txHash.trim()) {
            setError('Please enter a transaction hash');
            return;
        }

        if (!validateTxHash(txHash.trim())) {
            setError('Invalid transaction hash format. Must be 0x followed by 64 characters.');
            return;
        }

        setIsVerifying(true);

        // Notify parent component that verification started
        if (onVerificationStart) {
            onVerificationStart();
        }

        try {
            // Get auth token from localStorage (Sanctum)
            const token = localStorage.getItem('telegram_auth_token');
            
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            const response = await fetch('/api/telegram/verify-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tx_hash: txHash.trim(),
                    expected_amount: expectedAmount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Verification failed');
            }

            if (data.success) {
                toaster.semantic.success(data.message || 'Deposit verified successfully!');
                
                // Call success callback if provided
                if (onVerificationSuccess) {
                    onVerificationSuccess(data.data);
                }

                // Reset form and close modal
                setTxHash('');
                setError('');
                onClose();
            } else {
                throw new Error(data.error || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            const errorMessage = err.message || 'Failed to verify transaction. Please try again.';
            setError(errorMessage);
            toaster.semantic.error(errorMessage);
        } finally {
            setIsVerifying(false);
            
            // Notify parent component that verification ended
            if (onVerificationEnd) {
                onVerificationEnd();
            }
        }
    };

    const handleClose = () => {
        if (!isVerifying) {
            setTxHash('');
            setError('');
            onClose();
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setTxHash(text.trim());
            setError('');
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            toaster.semantic.error('Failed to read from clipboard');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Verify Payment">
            <div className="modal-body">
                <form onSubmit={handleSubmit} className="verify-deposit-form">
                    {/* Info Section */}
                    <div className="verify-info-box">
                        <div className="verify-info-row">
                            <span className="verify-info-label">Expected Amount:</span>
                            <span className="verify-info-value">{expectedAmount.toFixed(3)} USDT</span>
                        </div>
                        <p className="verify-info-note">
                            After sending the exact amount to the deposit address, paste your transaction hash below to verify.
                        </p>
                    </div>

                    {/* Transaction Hash Input */}
                    <div className="form-group">
                        <label htmlFor="txHash" className="form-label">
                            Transaction Hash (TXID)
                        </label>
                        <div className="input-with-button">
                            <input
                                id="txHash"
                                type="text"
                                className={`form-input ${error ? 'error' : ''}`}
                                placeholder="0x..."
                                value={txHash}
                                onChange={(e) => {
                                    setTxHash(e.target.value);
                                    setError('');
                                }}
                                disabled={isVerifying}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <button
                                type="button"
                                className="btn-paste-input"
                                onClick={handlePaste}
                                disabled={isVerifying}
                                title="Paste from clipboard"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                </svg>
                            </button>
                        </div>
                        {error && <span className="form-error">{error}</span>}
                        <span className="form-hint">
                            Find your transaction hash in your wallet after sending USDT
                        </span>
                    </div>

                    {/* How to find TXID */}
                    <div className="verify-help-box">
                        <div className="verify-help-title">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>How to find your Transaction Hash?</span>
                        </div>
                        <ul className="verify-help-list">
                            <li>Open your wallet (TrustWallet, Binance, MetaMask)</li>
                            <li>Go to transaction history</li>
                            <li>Find your USDT transfer</li>
                            <li>Copy the transaction hash (starts with 0x)</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={handleClose}
                            disabled={isVerifying}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-modal-submit"
                            disabled={isVerifying || !txHash.trim()}
                        >
                            {isVerifying ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        <path d="M9 12l2 2 4-4"></path>
                                    </svg>
                                    <span>Verify Payment</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
