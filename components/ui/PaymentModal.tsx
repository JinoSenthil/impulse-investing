'use client';


import { Check, X, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    type: 'loading' | 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
    onConfirm?: () => void;
    showConfirmButton?: boolean;
    confirmText?: string;
}

export default function PaymentModal({
    isOpen,
    type,
    title,
    message,
    onClose,
    onConfirm,
    showConfirmButton = false,
    confirmText = 'OK'
}: PaymentModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check className="w-16 h-16 text-green-500" />;
            case 'error':
                return <X className="w-16 h-16 text-red-500" />;
            case 'loading':
                return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
            default:
                return null;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-900/20 border-green-700/30';
            case 'error':
                return 'bg-red-900/20 border-red-700/30';
            case 'loading':
                return 'bg-blue-900/20 border-blue-700/30';
            default:
                return 'bg-gray-900/20 border-gray-700/30';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-md rounded-2xl border ${getBgColor()} p-8 shadow-2xl`}>
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        {getIcon()}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-300 mb-8">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-4 w-full">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all"
                            >
                                Close
                            </button>
                        )}

                        {showConfirmButton && onConfirm && (
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all"
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}