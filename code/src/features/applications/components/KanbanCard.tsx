'use client';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application, Priority } from '../types';
import { GripVertical, Flag, Edit2, CheckSquare, FileText, IndianRupee } from 'lucide-react';
import { EditApplicationSheet } from './EditApplicationSheet';

interface KanbanCardProps {
    application: Application;
}

const PRIORITY_COLORS: Record<Priority, string> = {
    HIGH: 'bg-red-50 text-red-700 border-red-100',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    LOW: 'bg-gray-50 text-gray-700 border-gray-100',
};

export function KanbanCard({ application }: KanbanCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: application.id,
        data: {
            type: 'Application',
            application,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-4 rounded-lg shadow-xl border-2 border-black rotate-2 opacity-80 h-[140px]"
            />
        );
    }

    // Determine Status Decorator
    const isPriorityHigh = application.priority === 'HIGH';

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`group bg-white p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${isPriorityHigh ? 'border-l-4 border-l-red-500 border-y-gray-200 border-r-gray-200' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-gray-100">
                            {application.customerName.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 leading-tight">{application.customerName}</div>
                            <div className="text-xs text-gray-500">{application.country}</div>
                        </div>
                    </div>
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditOpen(true);
                        }}
                        className="text-gray-300 hover:text-black p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                            {application.visaType}
                        </div>
                        {application.priority === 'HIGH' && (
                            <div className="text-[10px] font-bold text-red-600 flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded">
                                <Flag className="h-3 w-3 fill-red-600" />
                                HIGH
                            </div>
                        )}
                    </div>

                    {/* Metrics Row */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                        {/* Tasks */}
                        <div className={`flex items-center gap-1 ${(application.tasksCount || 0) > 0 ? 'text-amber-600 font-medium' : ''}`}>
                            <CheckSquare className="h-3.5 w-3.5" />
                            {application.tasksCount || 0}
                        </div>

                        {/* Docs */}
                        <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {application.documentsCount || 0}
                        </div>

                        {/* Payments */}
                        <div className={`flex items-center gap-1 ml-auto ${(application.totalPaid || 0) > 0 ? 'text-green-600 font-medium' : ''}`}>
                            <IndianRupee className="h-3.5 w-3.5" />
                            {application.totalPaid ? (Number(application.totalPaid) / 1000).toFixed(0) + 'k' : '0'}
                        </div>
                    </div>
                </div>
            </div>

            <EditApplicationSheet
                application={application}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    );
}
