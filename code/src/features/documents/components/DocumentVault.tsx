'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Document } from '../types';
import { Search, Grid, List, File, Image as ImageIcon, FileText, MoreVertical, Download, Trash2, Eye, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { UploadDropzone } from './UploadDropzone';
import { deleteDocument } from '../server/actions';
import { toast } from 'sonner';

export function DocumentVault({ documents }: { documents: Document[] }) {
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers
    const getFileIcon = (mime: string) => {
        if (mime.includes('image')) return <ImageIcon className="h-6 w-6 text-purple-600" />;
        if (mime.includes('pdf')) return <FileText className="h-6 w-6 text-red-600" />;
        return <File className="h-6 w-6 text-blue-600" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handlePreview = (doc: Document) => {
        window.open(doc.fileUrl, '_blank');
    };

    const handleDownload = (doc: Document) => {
        // Create a temporary link to force download
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (doc: Document) => {
        if (confirm('Are you sure you want to delete this document?')) {
            startTransition(async () => {
                const result = await deleteDocument(doc.id);
                if (result.success) {
                    toast.success('Document deleted');
                } else {
                    toast.error('Failed to delete document');
                }
                setActiveMenuId(null);
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-[350px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'GRID' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Upload
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'GRID' && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => handlePreview(doc)}>
                            <div className="aspect-[4/3] bg-gray-50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-gray-100 transition-colors overflow-hidden relative">
                                {doc.mimeType.startsWith('image/') ? (
                                    <>
                                        <img
                                            src={doc.fileUrl}
                                            alt={doc.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                                if (fallback) {
                                                    fallback.classList.remove('hidden');
                                                    fallback.classList.add('flex');
                                                }
                                            }}
                                        />
                                        <div className="fallback-icon hidden absolute inset-0 items-center justify-center flex-col text-gray-400 bg-gray-50">
                                            <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                            <span className="text-[10px]">No Preview</span>
                                        </div>
                                    </>
                                ) : doc.mimeType.includes('pdf') ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full bg-red-50/50 text-red-500">
                                        <FileText className="h-10 w-10 mb-2 drop-shadow-sm" strokeWidth={1.5} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full shadow-sm">PDF</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full text-blue-500 bg-blue-50/50">
                                        <File className="h-10 w-10 mb-2 drop-shadow-sm" strokeWidth={1.5} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full shadow-sm">FILE</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-900 truncate max-w-[120px]" title={doc.name}>{doc.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{formatSize(doc.fileSize)}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === doc.id ? null : doc.id);
                                    }}
                                    className="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {activeMenuId === doc.id && (
                                    <div ref={menuRef} className="absolute right-2 top-12 z-10 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animation-in fade-in zoom-in-95 duration-100" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handlePreview(doc)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <Eye className="h-3 w-3" /> Preview
                                        </button>
                                        <button onClick={() => handleDownload(doc)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <Download className="h-3 w-3" /> Download
                                        </button>
                                        <button onClick={() => handleDelete(doc)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                                            <Trash2 className="h-3 w-3" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-xs font-medium px-2 py-1 bg-gray-50 inline-block rounded text-gray-600 border border-gray-200">
                                {doc.category}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'LIST' && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Associated With</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Size</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDocs.map((doc) => (
                                <tr key={doc.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                {getFileIcon(doc.mimeType)}
                                            </div>
                                            <span className="font-medium text-gray-900 cursor-pointer hover:underline" onClick={() => handlePreview(doc)}>{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {doc.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {doc.customerName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                        {formatSize(doc.fileSize)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handlePreview(doc)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md" title="Preview">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDownload(doc)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md" title="Download">
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(doc)} className="p-2 text-red-500 hover:bg-red-50 rounded-md" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isUploadOpen && <UploadDropzone onClose={() => setIsUploadOpen(false)} />}
        </div>
    );
}
