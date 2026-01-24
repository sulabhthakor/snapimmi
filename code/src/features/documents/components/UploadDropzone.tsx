import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, File, X, Loader2, Search, User, Check } from 'lucide-react';
import { uploadFile, createDocument } from '../server/actions';
import { getCustomers } from '../../customers/server/actions';
import { toast } from 'sonner';

export function UploadDropzone({ onClose, customerId, applicationId, defaultCategory }: {
    onClose: () => void;
    customerId?: string;
    applicationId?: string;
    defaultCategory?: string;
}) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Metadata State
    const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
    const [category, setCategory] = useState(defaultCategory || 'General');

    // Customer Search State (Only needed if no customerId provided)
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState<{ id: string; fullName: string; email: string | null }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // Initial load & Search
    useEffect(() => {
        if (customerId) return; // Skip search if customer pre-selected

        const fetchCustomers = async () => {
            setIsSearching(true);
            try {
                const result = await getCustomers({
                    search: customerSearch,
                    page: 1,
                    limit: 10,
                    status: 'ALL'
                });
                setCustomers(result.data);
            } catch (error) {
                console.error("Failed to fetch customers", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(timer);
    }, [customerSearch, customerId]);

    // ... drag handlers ... (omitted for brevity in prompt, but assuming tool keeps them if outside range)
    // Actually tool keeps outside range.
    // I need to be careful about range.
    // Lines 45-72 are handlers. I'll include them to be safe or just target specific blocks?
    // The previous view_file showed lines 1-277.
    // I will use multiple replace chunks if needed, or arguably replacing lines 7-43 is safety for state init.
    // I also need to update handleUpload to use props and optional logic.

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
        if (e.dataTransfer.files?.length) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    }, []);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = async () => {
        const targetCustomerId = customerId || selectedCustomerId;
        if (!targetCustomerId) {
            toast.error("Please select a customer");
            return;
        }
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadedDocs: { name: string; fileUrl: string; fileSize: number; mimeType: string }[] = [];
        let hasError = false;

        try {
            // 1. Upload all files
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const result = await uploadFile(formData);
                if (result.success && result.url) {
                    uploadedDocs.push({
                        name: file.name,
                        fileUrl: result.url,
                        fileSize: file.size,
                        mimeType: file.type || 'application/octet-stream'
                    });
                } else {
                    hasError = true;
                    console.error("Values failed for", file.name);
                }
            }

            // 2. Create DB records
            if (uploadedDocs.length > 0) {
                const createResult = await createDocument(targetCustomerId, category, uploadedDocs, applicationId);
                if (createResult.success) {
                    toast.success(`Successfully uploaded ${uploadedDocs.length} document(s)`);
                    onClose();
                } else {
                    toast.error("Failed to save document records");
                }
            } else if (hasError) {
                toast.error("Failed to upload files");
            }

        } catch (error) {
            console.error("Upload process error", error);
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Upload Documents</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Selection - Hide if customerId provided */}
                    {!customerId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Link to Customer</label>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-within:border-black focus-within:ring-1 focus-within:ring-black cursor-text"
                                    onClick={() => setShowCustomerDropdown(true)}
                                >
                                    <Search className="h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search customer..."
                                        className="flex-1 outline-none min-w-0"
                                        value={showCustomerDropdown ? customerSearch : (selectedCustomer?.fullName || customerSearch)}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerDropdown(true);
                                            if (selectedCustomerId) setSelectedCustomerId(''); // Reset selection on edit
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                    />
                                    {selectedCustomerId && (
                                        <Check className="h-4 w-4 text-green-500" />
                                    )}
                                </div>

                                {showCustomerDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowCustomerDropdown(false)}
                                        />
                                        <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-lg">
                                            {isSearching ? (
                                                <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                                            ) : customers.length > 0 ? (
                                                customers.map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                                                        onClick={() => {
                                                            setSelectedCustomerId(customer.id);
                                                            setCustomerSearch(customer.fullName);
                                                            setShowCustomerDropdown(false);
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-900">{customer.fullName}</div>
                                                            <div className="text-xs text-gray-500">{customer.email}</div>
                                                        </div>
                                                        {selectedCustomerId === customer.id && (
                                                            <Check className="h-4 w-4 text-black" />
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-3 text-center text-xs text-gray-500">No customers found</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        >
                            <option value="General">General</option>
                            <option value="ID Proof">ID Proof</option>
                            <option value="Financial">Financial</option>
                            <option value="Legal">Legal</option>
                            <option value="Application">Application</option>
                        </select>
                    </div>

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
                        disabled={files.length === 0 || isUploading || !(customerId || selectedCustomerId)}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : 'Upload Files'}
                    </button>
                </div>
            </div>
        </div>
    );
}
