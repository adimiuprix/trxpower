import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function Modal({children}: Props)
{
    return(
        <div className="modal-backdrop" id="deposit-modal">
            <div className="modal-sheet">
                <div className="modal-header">
                    <h3>Deposit TRX</h3>
                    <button className="btn-close-modal">×</button>
                </div>

                {children}

            </div>
        </div>
    )
}