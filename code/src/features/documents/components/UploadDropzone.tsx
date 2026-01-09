'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { uploadDocument } from '../server/actions';

export function UploadDropzone({ onClose }: { onClose: () => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        setIsUploading(true);
        // Simulate upload for each file
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        await uploadDocument(formData);

        setIsUploading(false);
        onClose();
        // Ideally trigger a refresh of the document list here
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Upload Documents</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                                ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                                : 'border-gray-200 hover:border-black hover:bg-gray-50'
                            }`}
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                            <label className="text-blue-600 hover:underline cursor-pointer">
                                Click to upload
                                <input type="file" className="hidden" multiple onChange={handleFileSelect} />
                            </label>
                            {' '}or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-6 space-y-3 max-h-48 overflow-y-auto pr-1">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-white rounded border border-gray-200 text-gray-500">
                                            <File className="h-4 w-4" />
                                        </div>
                                        <div className="truncate text-sm font-medium text-gray-700 max-w-[200px]">{file.name}</div>
                                    </div>
                                    <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0 || isUploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : 'Upload Files'}
                    </button>
                </div>
            </div>
        </div>
    );
}
