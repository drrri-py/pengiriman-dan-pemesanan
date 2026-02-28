import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { shipmentService } from '../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    shipmentId: string | null;
    onSuccess: () => void;
}

export default function ProofUploadModal({ isOpen, onClose, shipmentId, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen || !shipmentId) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                setError('Please select an image file (JPG, PNG).');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB.');
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            if (!droppedFile.type.startsWith('image/')) {
                setError('Please drop an image file (JPG, PNG).');
                return;
            }
            setFile(droppedFile);
            setPreviewUrl(URL.createObjectURL(droppedFile));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        try {
            setIsUploading(true);
            setError('');
            await shipmentService.uploadProof(shipmentId, file);
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to upload proof. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        setError('');
        setIsUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Upload Delivery Proof</h2>
                    <p className="text-slate-500 mt-1">Upload a photo of the signed delivery document.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${previewUrl
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50 cursor-pointer'
                        }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    {previewUrl ? (
                        <div className="space-y-4">
                            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                                <img
                                    src={previewUrl}
                                    alt="Proof preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="text-sm font-medium text-rose-600 hover:text-rose-700"
                            >
                                Remove image
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                <Upload size={28} />
                            </div>
                            <div>
                                <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
                                <p className="text-slate-500 text-sm mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Proof'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
