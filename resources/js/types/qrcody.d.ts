declare module '@trtmn/qrcody' {
    /**
     * Error correction level for QR code
     * - L: Low (7% error correction)
     * - M: Medium (15% error correction)
     * - Q: Quartile (25% error correction)
     * - H: High (30% error correction)
     */
    export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

    /**
     * Pixel styles for QR code modules
     */
    export type PixelsStyle = 'square' | 'rounded' | 'dots' | 'blob' | 'bars-h' | 'bars-v' | 'squircle';

    /**
     * Eye (finder pattern) styles
     */
    export type EyeStyle = 'square' | 'rounded' | 'circle' | 'leaf' | 'squircle';

    /**
     * Pupil (center of finder) styles
     */
    export type PupilStyle = 'square' | 'rounded' | 'circle' | 'squircle';

    /**
     * Frame styles
     */
    export type FrameStyle = 'none' | 'perimeter' | 'scan-me' | 'scan';

    /**
     * Corner styles
     */
    export type CornersStyle = 'square' | 'rounded';

    /**
     * Gradient configuration
     */
    export interface Gradient {
        /** Gradient start color */
        from?: string;
        /** Gradient end color */
        to?: string;
        /** Gradient angle in degrees */
        angle?: number;
    }

    /**
     * Options for generating QR code
     */
    export interface QRCodeOptions {
        /** Error correction level (default: 'M') */
        correctionLevel?: ErrorCorrectionLevel;
        /** Background color (default: '#FFFFFF') */
        color?: string;
        /** Foreground color (default: '#000000') */
        fgColor?: string;
        /** Background color (alias for color) */
        bgColor?: string;
        /** Transparent background */
        transparent?: boolean;
        /** Pixel/module style */
        pixelsStyle?: PixelsStyle;
        /** Eye (finder pattern) style */
        eyesStyle?: EyeStyle;
        /** Pupil style */
        pupilsStyle?: PupilStyle;
        /** Corner style */
        cornersStyle?: CornersStyle;
        /** Quiet zone/border size (default: 40) */
        border?: number;
        /** Center logo as data URI */
        logo?: string;
        /** Logo scale (0.10-0.35) */
        logoScale?: number;
        /** Foreground gradient */
        fgGradient?: Gradient;
        /** Background gradient */
        bgGradient?: Gradient;
        /** Frame gradient */
        frameGradient?: Gradient;
        /** Frame style */
        frame?: FrameStyle;
        /** Frame color */
        frameColor?: string;
        /** Frame text */
        frameText?: string;
        /** Frame text size */
        frameTextSize?: number;
        /** Frame padding */
        framePadding?: number;
        /** Squircle radius for pixels (0-100) */
        pixelsSquircleRadius?: number;
        /** Squircle radius for eyes (0-100) */
        eyesSquircleRadius?: number;
        /** Squircle radius for pupils (0-100) */
        pupilsSquircleRadius?: number;
        /** Squircle radius for corners (0-100) */
        cornersSquircleRadius?: number;
    }

    /**
     * Result from QR code generation
     */
    export interface QRCodeResult {
        /** SVG string */
        svg: string;
        /** Width in pixels */
        w: number;
        /** Height in pixels */
        h: number;
    }

    /**
     * Generate QR code as SVG
     * @param text - Data to encode in QR code (e.g., URL, text, address)
     * @param options - QR code generation options
     * @returns Object containing SVG string and dimensions
     */
    export function generateSVG(text: string, options?: QRCodeOptions): QRCodeResult;

    /**
     * Build QR code SVG body (without frame)
     * @param settings - Complete settings object
     * @returns SVG string of QR body
     */
    export function buildSVG(settings: any): string;

    /**
     * Wrap QR SVG in a frame
     * @param qrSVG - QR body SVG string
     * @param settings - Settings for frame
     * @returns Object containing framed SVG and dimensions
     */
    export function buildFramedSVG(qrSVG: string, settings: any): QRCodeResult;

    /**
     * Default settings
     */
    export const DEFAULT: any;

    /**
     * Available pixel styles
     */
    export const PIXELS_STYLES: PixelsStyle[];

    /**
     * Available eye styles
     */
    export const EYE_STYLES: EyeStyle[];

    /**
     * Available pupil styles
     */
    export const PUPIL_STYLES: PupilStyle[];

    /**
     * Available corner styles
     */
    export const CORNERS_STYLES: CornersStyle[];

    /**
     * Available frame styles
     */
    export const FRAME_STYLES: FrameStyle[];

    /**
     * Available correction levels
     */
    export const CORRECTION_LEVELS: ErrorCorrectionLevel[];
}
