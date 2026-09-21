import { useTelegram } from '@/hooks/useTelegram';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Code2,
    Copy,
    Crown,
    ExternalLink,
    MessageSquare,
    Palette,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Vibrate,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Halaman Demonstrasi & Data Telegram Mini App
 * Didesain khusus menggunakan CSS Inline Styles untuk fleksibilitas dan tampilan premium
 */
export default function TelegramExample() {
    const telegram = useTelegram();
    const [isReady, setIsReady] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showRawData, setShowRawData] = useState(false);
    const [mainButtonText, setMainButtonText] = useState('Deposit TRX via MiniApp');

    // Salin teks ke clipboard dengan visual feedback
    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        telegram.haptic.notification('success');
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Inisialisasi tombol bawaan Telegram
    useEffect(() => {
        telegram.ready();
        telegram.expand();

        // Konfigurasi Main Button native
        telegram.mainButton.setText(mainButtonText);
        telegram.mainButton.show();

        const offMain = telegram.mainButton.onClick(() => {
            telegram.haptic.notification('success');
            telegram.showAlert(`🚀 Main Button Telegram diklik!\nAksi: ${mainButtonText}`);
        });

        // Konfigurasi Back Button native
        telegram.backButton.show();
        const offBack = telegram.backButton.onClick(() => {
            telegram.haptic.impact('light');
            router.visit('/');
        });

        setIsReady(true);

        return () => {
            offMain();
            offBack();
            telegram.mainButton.hide();
            telegram.backButton.hide();
        };
    }, [telegram, mainButtonText]);

    const user = telegram.user;

    // Palette tema
    const themeBg = telegram.themeParams.bg_color || '#07090e';
    const themeButton = telegram.themeParams.button_color || '#ff1e40';
    const themeText = telegram.themeParams.text_color || '#f8fafc';

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#07090e',
                color: '#f8fafc',
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                padding: '24px 16px 80px 16px',
                position: 'relative',
                overflowX: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            {/* Ambient Background Glow Effect */}
            <div
                style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '500px',
                    height: '280px',
                    background: 'radial-gradient(ellipse at center, rgba(255, 30, 64, 0.22) 0%, rgba(255, 30, 64, 0) 70%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '-100px',
                    width: '320px',
                    height: '320px',
                    background: 'radial-gradient(circle, rgba(0, 210, 255, 0.12) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* Content Container */}
            <div
                style={{
                    maxWidth: '680px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                {/* 1. TOP HEADER BAR */}
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <button
                        onClick={() => {
                            telegram.haptic.impact('light');
                            router.visit('/');
                        }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 14px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f8fafc',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                    >
                        <ArrowLeft size={16} color="#ff3355" />
                        <span>Kembali</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {telegram.isTMA ? (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    backgroundColor: 'rgba(0, 229, 153, 0.15)',
                                    color: '#00e599',
                                    border: '1px solid rgba(0, 229, 153, 0.35)',
                                    boxShadow: '0 0 12px rgba(0, 229, 153, 0.25)',
                                }}
                            >
                                <span
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: '#00e599',
                                    }}
                                />
                                Live Telegram
                            </span>
                        ) : (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    backgroundColor: 'rgba(0, 210, 255, 0.12)',
                                    color: '#00d2ff',
                                    border: '1px solid rgba(0, 210, 255, 0.3)',
                                }}
                            >
                                <span
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: '#00d2ff',
                                    }}
                                />
                                Dev Simulation
                            </span>
                        )}

                        <span
                            style={{
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontFamily: "'JetBrains Mono', monospace",
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: '#94a3b8',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                        >
                            v{telegram.version}
                        </span>
                    </div>
                </header>

                {/* 2. HERO VIP USER PROFILE CARD */}
                <div
                    style={{
                        position: 'relative',
                        borderRadius: '24px',
                        background: 'linear-gradient(145deg, #101624 0%, #0c101a 55%, #080b12 100%)',
                        border: '1px solid rgba(255, 30, 64, 0.35)',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 28px rgba(255, 30, 64, 0.18)',
                        padding: '24px',
                        overflow: 'hidden',
                    }}
                >
                    {/* Top Row: Avatar & Profile Info */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '16px',
                            marginBottom: '20px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Avatar Monogram / Picture */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '18px',
                                        background: 'linear-gradient(135deg, #ff1e40 0%, #b8001f 100%)',
                                        padding: '2px',
                                        boxShadow: '0 0 20px rgba(255, 30, 64, 0.4)',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {user?.photoUrl ? (
                                        <img
                                            src={user.photoUrl}
                                            alt="Telegram Avatar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '16px',
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: '#101624',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                fontSize: '22px',
                                                color: '#ff3355',
                                            }}
                                        >
                                            {user?.firstName?.[0] || 'T'}
                                        </div>
                                    )}
                                </div>

                                {user?.isPremium && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '-4px',
                                            right: '-4px',
                                            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                            color: '#000',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                        }}
                                        title="Telegram Premium"
                                    >
                                        <Crown size={12} fill="#000" />
                                    </div>
                                )}
                            </div>

                            {/* User Name & Details */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '20px',
                                            fontWeight: 800,
                                            color: '#ffffff',
                                            fontFamily: "'Outfit', sans-serif",
                                            letterSpacing: '-0.3px',
                                        }}
                                    >
                                        {user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest Telegram'}
                                    </h2>
                                    {user && <CheckCircle2 size={18} color="#00e599" />}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginTop: '6px',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {user?.username ? (
                                        <button
                                            onClick={() => handleCopy(`@${user.username}`, 'username')}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                fontSize: '13px',
                                                fontFamily: "'JetBrains Mono', monospace",
                                                color: '#00d2ff',
                                                cursor: 'pointer',
                                            }}
                                            title="Salin Username"
                                        >
                                            @{user.username}
                                            {copiedField === 'username' ? (
                                                <Check size={13} color="#00e599" />
                                            ) : (
                                                <Copy size={13} style={{ opacity: 0.6 }} />
                                            )}
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>No username</span>
                                    )}

                                    <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>

                                    {user?.id && (
                                        <button
                                            onClick={() => handleCopy(String(user.id), 'id')}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                fontSize: '12px',
                                                fontFamily: "'JetBrains Mono', monospace",
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                            }}
                                            title="Salin User ID"
                                        >
                                            ID: {user.id}
                                            {copiedField === 'id' ? (
                                                <Check size={13} color="#00e599" />
                                            ) : (
                                                <Copy size={13} style={{ opacity: 0.6 }} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* VIP Tier Badge */}
                        <div style={{ textAlign: 'right' }}>
                            <span
                                style={{
                                    display: 'inline-block',
                                    padding: '5px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.8px',
                                    background: 'linear-gradient(135deg, rgba(255, 30, 64, 0.25), rgba(255, 51, 85, 0.35))',
                                    color: '#ff3355',
                                    border: '1px solid rgba(255, 30, 64, 0.45)',
                                    boxShadow: '0 0 12px rgba(255, 30, 64, 0.2)',
                                }}
                            >
                                TRX PLATINUM
                            </span>
                            <span
                                style={{
                                    display: 'block',
                                    fontSize: '10px',
                                    color: '#64748b',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    marginTop: '4px',
                                }}
                            >
                                AUTH VERIFIED
                            </span>
                        </div>
                    </div>

                    {/* Stats Pill Strip */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            padding: '12px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Status Sesi
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#00e599', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                                <ShieldCheck size={14} /> Terhubung
                            </span>
                        </div>

                        <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Bahasa
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px', display: 'block' }}>
                                {user?.languageCode || 'EN'}
                            </span>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Level Akun
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: user?.isPremium ? '#fbbf24' : '#00d2ff', marginTop: '2px', display: 'block' }}>
                                {user?.isPremium ? 'Premium ⭐' : 'Regular User'}
                            </span>
                        </div>
                    </div>

                    {/* Start Param Alert (jika ada) */}
                    {telegram.startParam && (
                        <div
                            style={{
                                marginTop: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.12), rgba(0, 210, 255, 0.02))',
                                border: '1px solid rgba(0, 210, 255, 0.25)',
                                fontSize: '12px',
                                color: '#00d2ff',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={15} color="#00d2ff" />
                                <span>Ref Parameter: <strong>{telegram.startParam}</strong></span>
                            </div>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(0, 210, 255, 0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                                Referral Link
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. DEVICE & ENVIRONMENT TELEMETRY GRID */}
                <div>
                    <h3
                        style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '10px',
                        }}
                    >
                        <Smartphone size={14} color="#00d2ff" />
                        Parameter Lingkungan & Device
                    </h3>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '10px',
                        }}
                    >
                        {/* Card 1: Platform */}
                        <div
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                backgroundColor: '#0f1422',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Platform</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textTransform: 'capitalize', marginTop: '4px', display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>
                                {telegram.platform}
                            </span>
                        </div>

                        {/* Card 2: SDK Version */}
                        <div
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                backgroundColor: '#0f1422',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>SDK Version</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '4px', display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>
                                {telegram.version}
                            </span>
                        </div>

                        {/* Card 3: Theme */}
                        <div
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                backgroundColor: '#0f1422',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Tema Klien</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '4px', display: 'block' }}>
                                {telegram.isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                            </span>
                        </div>

                        {/* Card 4: Viewport */}
                        <div
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                backgroundColor: '#0f1422',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Tinggi Viewport</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '4px', display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>
                                {telegram.viewportHeight}px
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. THEME PALETTE COLOR SWATCHES */}
                <div>
                    <h3
                        style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '10px',
                        }}
                    >
                        <Palette size={14} color="#a855f7" />
                        Palet Warna Telegram Client
                    </h3>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                            gap: '10px',
                            padding: '14px',
                            borderRadius: '18px',
                            backgroundColor: '#0f1422',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: themeBg, border: '1px solid rgba(255, 255, 255, 0.2)', flexShrink: 0 }} />
                            <div>
                                <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>Background</span>
                                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{themeBg}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: themeButton, border: '1px solid rgba(255, 255, 255, 0.2)', flexShrink: 0 }} />
                            <div>
                                <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>Button Color</span>
                                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{themeButton}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: themeText, border: '1px solid rgba(255, 255, 255, 0.2)', flexShrink: 0 }} />
                            <div>
                                <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>Text Color</span>
                                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{themeText}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. INTERACTIVE NATIVE CONTROLS TEST CENTER */}
                <div>
                    <h3
                        style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '10px',
                        }}
                    >
                        <Sparkles size={14} color="#ff3355" />
                        Uji Fitur & Aksi Asli Telegram
                    </h3>

                    <div
                        style={{
                            padding: '18px',
                            borderRadius: '20px',
                            backgroundColor: '#0f1422',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                        }}
                    >
                        {/* Action Buttons Row */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '10px',
                            }}
                        >
                            <button
                                onClick={() => {
                                    telegram.haptic.impact('medium');
                                    telegram.showAlert('✅ Dialog Popup Asli Telegram berhasil dipanggil!');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <MessageSquare size={16} color="#00d2ff" />
                                <span>Native Alert</span>
                            </button>

                            <button
                                onClick={() => {
                                    telegram.haptic.impact('medium');
                                    telegram.showConfirm('Apakah Anda mengonfirmasi penarikan atau aksi ini?', (confirmed) => {
                                        if (confirmed) {
                                            telegram.haptic.notification('success');
                                            telegram.showAlert('Aksi Terkonfirmasi! 🎉');
                                        } else {
                                            telegram.haptic.notification('warning');
                                        }
                                    });
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <CheckCircle2 size={16} color="#00e599" />
                                <span>Native Confirm</span>
                            </button>

                            <button
                                onClick={() => {
                                    telegram.haptic.impact('heavy');
                                    telegram.openTelegramLink('https://t.me/telegram');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #ff1e40 0%, #b8001f 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 15px rgba(255, 30, 64, 0.3)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <ExternalLink size={16} />
                                <span>Buka Channel</span>
                            </button>
                        </div>

                        {/* Haptic Vibrations Row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                padding: '12px 16px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                flexWrap: 'wrap',
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Vibrate size={15} color="#fbbf24" />
                                Test Haptic Vibrations:
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                    onClick={() => telegram.haptic.impact('light')}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontSize: '11px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => telegram.haptic.impact('medium')}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontSize: '11px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Medium
                                </button>
                                <button
                                    onClick={() => telegram.haptic.impact('heavy')}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontSize: '11px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Heavy
                                </button>
                                <button
                                    onClick={() => telegram.haptic.notification('success')}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(0, 229, 153, 0.18)',
                                        border: '1px solid rgba(0, 229, 153, 0.35)',
                                        color: '#00e599',
                                        fontSize: '11px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Success
                                </button>
                            </div>
                        </div>

                        {/* Main Button Controller Bar */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                        >
                            <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                                    Bottom Native Main Button
                                </span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                                    Tombol sticky besar di bagian terbawah Telegram
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    const nextText =
                                        mainButtonText === 'Deposit TRX via MiniApp'
                                            ? 'Konfirmasi Mining TRX (50 TRX)'
                                            : 'Deposit TRX via MiniApp';
                                    setMainButtonText(nextText);
                                    telegram.mainButton.setText(nextText);
                                    telegram.haptic.impact('light');
                                }}
                                style={{
                                    padding: '7px 14px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(0, 210, 255, 0.15)',
                                    color: '#00d2ff',
                                    border: '1px solid rgba(0, 210, 255, 0.35)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Ganti Teks
                            </button>
                        </div>
                    </div>
                </div>

                {/* 6. RAW CRYPTO AUTH & INITDATA VIEWER */}
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <Code2 size={14} color="#00e599" />
                            Data Kriptografis Telegram (initData)
                        </h3>

                        <button
                            onClick={() => setShowRawData(!showRawData)}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                textDecoration: 'underline',
                                fontSize: '12px',
                                fontFamily: "'JetBrains Mono', monospace",
                                cursor: 'pointer',
                            }}
                        >
                            {showRawData ? 'Sembunyikan' : 'Lihat Raw String'}
                        </button>
                    </div>

                    {showRawData && (
                        <div
                            style={{
                                padding: '16px',
                                borderRadius: '18px',
                                backgroundColor: '#0c101a',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>
                                    Raw Query Payload:
                                </span>
                                {telegram.initData && (
                                    <button
                                        onClick={() => handleCopy(telegram.initData, 'initData')}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: 'none',
                                            color: '#ffffff',
                                            fontSize: '11px',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {copiedField === 'initData' ? (
                                            <>
                                                <Check size={12} color="#00e599" />
                                                <span style={{ color: '#00e599' }}>Tersalin!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={12} color="#94a3b8" />
                                                <span>Salin Hash</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <pre
                                style={{
                                    margin: 0,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    fontSize: '11px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    color: '#cbd5e1',
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: '140px',
                                    overflowY: 'auto',
                                }}
                            >
                                {telegram.initData || '(Kosong)'}
                            </pre>

                            <div
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(0, 229, 153, 0.08)',
                                    border: '1px solid rgba(0, 229, 153, 0.2)',
                                    fontSize: '12px',
                                    color: '#00e599',
                                    lineHeight: 1.5,
                                }}
                            >
                                🛡️ <strong>Keamanan Backend:</strong> Data ini dikirim ke backend Laravel dan divalidasi dengan signature <code>HMAC-SHA256</code> menggunakan Telegram Bot Token untuk mencegah pemalsuan user ID atau saldo.
                            </div>
                        </div>
                    )}
                </div>

                {/* 7. BOTTOM ACTION CTA */}
                <div style={{ paddingTop: '8px' }}>
                    <button
                        onClick={() => {
                            telegram.haptic.impact('light');
                            router.visit('/');
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #ff1e40 0%, #ff3355 50%, #b8001f 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '14px',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 24px rgba(255, 30, 64, 0.4)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Zap size={18} fill="#ffffff" />
                        <span>Lanjutkan ke Dashboard TRX Mining</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
