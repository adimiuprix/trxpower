import AppLayout from '@/layouts/AppLayout';
import { router } from '@inertiajs/react';
import { generateSVG } from '@trtmn/qrcody';
import { useEffect, useState } from 'react';
import { createToaster } from "@codenhub/toaster";
import VerifyDepositModal from '@/components/VerifyDepositModal';

const toaster = createToaster({
    position: "top-center",
    duration: 3000,
});

interface DepositPreset {
    value: number;
    label: string;
    subLabel: string;
}

interface DepositPageProps {
    exchangeRate: number;
    depositAddress: string;
    depositPreset: DepositPreset[];
}

export default function DepositPage({ depositAddress, depositPreset, exchangeRate }: DepositPageProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [qrCodeSVG, setQrCodeSVG] = useState<string>('');
    const [copyExactSuccess, setCopyExactSuccess] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Amount presets data from backend
    const amountPresets = depositPreset;

    // Set default to first preset
    const [selectedAmount, setSelectedAmount] = useState(amountPresets[0].value);
    const [customAmount, setCustomAmount] = useState(String(amountPresets[0].value));
    
    // Determine active amount (custom or preset)
    const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
    
    // Calculate exact amount (add 0.5% for transaction identification)
    const exactAmount = (activeAmount * 1.005).toFixed(3);
    
    // Calculate TRX to receive (based on selected amount, not exact amount)
    const trxToReceive = (activeAmount * exchangeRate).toFixed(2);

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomAmount(value);
        
        // Check if custom amount matches any preset
        const numericValue = parseFloat(value);
        const matchingPreset = depositPreset.find(preset => preset.value === numericValue);
        
        if (matchingPreset) {
            // If matches a preset, set it as selected
            setSelectedAmount(matchingPreset.value);
        } else {
            // If custom value, deselect all presets
            setSelectedAmount(0);
        }
    };

    const handlePresetClick = (value: number) => {
        setSelectedAmount(value);
        setCustomAmount(String(value)); // Update custom input to match preset
    };

    // Generate QR Code
    useEffect(() => {
        if (depositAddress) {
            try {
                const result = generateSVG(depositAddress, {
                    frame: 'none',
                    pupilsStyle: 'square',
                    correctionLevel: 'M',
                    fgColor: '#000000',
                    bgColor: '#FFFFFF',
                    pixelsStyle: 'square',
                });
                
                setQrCodeSVG(result.svg);
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        }
    }, [depositAddress]);

    const handleBackToHome = () => {
        router.visit('/');
    };

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(depositAddress);
            setCopySuccess(true);
            toaster.semantic.success('Address copied to clipboard!');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            toaster.semantic.error('Failed to copy address. Please try again.');
        }
    };

    const handleCopyExactAmount = async () => {
        try {
            await navigator.clipboard.writeText(exactAmount);
            setCopyExactSuccess(true);
            toaster.semantic.success('Exact amount copied to clipboard!');
            setTimeout(() => setCopyExactSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            toaster.semantic.error('Failed to copy amount. Please try again.');
        }
    };

    const handleOpenVerifyModal = () => {
        setIsVerifyModalOpen(true);
    };

    const handleCloseVerifyModal = () => {
        setIsVerifyModalOpen(false);
    };

    const handleVerificationSuccess = (data: any) => {
        // Show success message with details
        toaster.semantic.success(
            `Successfully verified! ${data.amount_trx} TRX credited to your account.`
        );
        
        // Optional: Reload page or update user balance
        // You can use Inertia to refresh the page data
        setTimeout(() => {
            router.reload({ only: ['user'] }); // Reload user data if needed
        }, 1500);
    };

    const handleVerificationStart = () => {
        setIsVerifying(true);
    };

    const handleVerificationEnd = () => {
        setIsVerifying(false);
    };

    return (
        <AppLayout>
            <section
                className="view-container"
                style={{ display: 'flex' }}
            >
                {/* 1. Top Header with Back to Home */}
                <div className="deposit-view-header">
                    <button 
                        type="button" 
                        className="btn-deposit-back"
                        onClick={handleBackToHome}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span>Back</span>
                    </button>
                    <div className="deposit-header-title-box">
                        <h3 className="deposit-header-title">Deposit USDT</h3>
                        <span className="deposit-network-tag">
                            Polygon (MATIC)
                        </span>
                    </div>
                    <div className="deposit-rate-pill">
                        <span>1 USDT = 3 TRX</span>
                    </div>
                </div>

                {/* Top Cute Mini Loading Banner (5 Seconds Countdown) */}
                <div
                    className="deposit-top-loading-bar"
                    style={{ display: isVerifying ? 'flex' : 'none' }}
                >
                    <div className="top-loading-inner">
                        <div className="top-loading-spinner-ring"></div>
                        <div className="top-loading-text-stack">
                            <span className="top-loading-headline">
                                Verifying Blockchain Network...
                            </span>
                            <span
                                className="top-loading-subtext"
                            >
                                Scanning Polygon network...
                            </span>
                        </div>
                    </div>
                    <div className="top-loading-track">
                        <div
                            className="top-loading-progress"
                        ></div>
                    </div>
                </div>

                {/* 2. QR Code Card */}
                <div className="deposit-qr-card">
                    <div 
                        className="deposit-qr-inner"
                        dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
                    />
                    <div className="deposit-qr-caption">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2.5"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>
                            Scan QR with MetaMask, Trust Wallet, or Polygon Wallet
                        </span>
                    </div>
                </div>

                {/* 3. Deposit Address Card */}
                <div className="deposit-address-card">
                    <div className="deposit-addr-header">
                        <span className="deposit-field-label">
                            Official Deposit Address
                        </span>
                        <span className="deposit-net-badge">Polygon</span>
                    </div>
                    <div className="deposit-addr-row">
                        <span className="deposit-addr-text">
                            {depositAddress}
                        </span>
                        <button 
                            type="button" 
                            className="btn-copy-addr"
                            onClick={handleCopyAddress}
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                            >
                                {copySuccess ? (
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                ) : (
                                    <>
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </>
                                )}
                            </svg>
                            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                {/* 4. Amount Selection Presets */}
                <div className="deposit-amount-section">
                    <div className="deposit-section-label-row">
                        <span className="deposit-field-label">
                            Select Deposit Amount (USDT)
                        </span>
                        <span className="deposit-min-tag">Min. $1</span>
                    </div>
                    <div className="amount-presets-grid">
                        {depositPreset.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                className={`amount-preset-chip ${selectedAmount === preset.value ? 'active' : ''}`}
                                data-amount={preset.value}
                                onClick={() => handlePresetClick(preset.value)}
                            >
                                <span className="chip-val">{preset.label}</span>
                                <span className="chip-sub">{preset.subLabel}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Amount Input */}
                    <div className="custom-amount-row">
                        <span className="custom-amount-label">Custom:</span>
                        <input
                            type="number"
                            step="1"
                            min={depositPreset[0].value}
                            className="custom-amount-input"
                            placeholder="Amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                        />
                        <span className="custom-amount-suffix">USDT</span>
                    </div>
                </div>

                {/* 5. Exact Amount to Send Box */}
                <div className="exact-amount-card">
                    <div className="exact-amount-badge-row">
                        <span className="exact-badge">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: '4px',
                                }}
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Send Exact Amount
                        </span>
                        <span className="exact-receive-badge">
                            You Get:{' '}
                            <strong>
                                +{trxToReceive} TRX
                            </strong>
                        </span>
                    </div>
                    <div className="exact-amount-main-row">
                        <div className="exact-num-col">
                            <span
                                className="exact-amount-val"
                            >
                                {exactAmount} USDT
                            </span>
                            <span className="exact-amount-sub">
                                Send this exact amount to identify your
                                transaction
                            </span>
                        </div>
                        <button 
                            type="button" 
                            className="btn-copy-exact"
                            onClick={handleCopyExactAmount}
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                            >
                                {copyExactSuccess ? (
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                ) : (
                                    <>
                                        <rect
                                            x="9"
                                            y="9"
                                            width="13"
                                            height="13"
                                            rx="2"
                                            ry="2"
                                        ></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </>
                                )}
                            </svg>
                            <span>{copyExactSuccess ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                {/* 6. Must-Be Notice */}
                <div className="deposit-notice-card">
                    <div className="notice-icon">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div className="notice-content">
                        <strong>
                            Important Notice: Minimum Deposit 1 USDT
                        </strong>
                        <p>
                            Send only official <strong>USDT on Polygon</strong>{' '}
                            (Tether USD). Verified automatically on
                            <strong> PolygonScan &amp; Polygon RPC</strong>. Fake or
                            unverified tokens will be automatically rejected.
                        </p>
                    </div>
                </div>

                {/* 7. Verify Payment Action Button */}
                <div className="deposit-action-section">
                    <button
                        type="button"
                        className="btn-verify-payment-main"
                        onClick={handleOpenVerifyModal}
                        disabled={isVerifying}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{ marginRight: '6px' }}
                        >
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>{isVerifying ? 'Verifying...' : 'Verify Payment'}</span>
                    </button>
                    <span className="deposit-action-tip">
                        Balance is credited to your account immediately upon
                        entering TXID
                    </span>
                </div>

                {/* Verify Deposit Modal */}
                <VerifyDepositModal
                    isOpen={isVerifyModalOpen}
                    onClose={handleCloseVerifyModal}
                    expectedAmount={parseFloat(exactAmount)}
                    onVerificationSuccess={handleVerificationSuccess}
                    onVerificationStart={handleVerificationStart}
                    onVerificationEnd={handleVerificationEnd}
                />

            </section>
        </AppLayout>
    );
}
