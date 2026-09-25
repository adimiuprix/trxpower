import { createPortal } from 'react-dom';
import { useEffect, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export default function Modal({ children, isOpen, onClose, title = 'Modal' }: Props) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
        <div 
            className={`modal-backdrop ${isOpen ? 'active' : ''}`} 
            onClick={onClose}
            style={{ zIndex: 9999 }}
        >
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn-close-modal" onClick={onClose}>×</button>
                </div>

                {children}

            </div>
        </div>
    );

    // Render modal di body root menggunakan Portal untuk z-index tertinggi
    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
}