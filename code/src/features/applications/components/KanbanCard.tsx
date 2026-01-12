'use client';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application, Priority } from '../types';
import { GripVertical, Flag, Edit2 } from 'lucide-react';
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

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                            {application.customerName.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{application.customerName}</div>
                            <div className="text-xs text-gray-500">{application.country}</div>
                        </div>
                    </div>
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            // e.preventDefault(); // Might interfere with click? dnd-kit uses pointer down
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditOpen(true);
                        }}
                        className="text-gray-400 hover:text-black hover:bg-gray-100 p-1 rounded transition-colors"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                        {application.visaType}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[application.priority]}`}>
                            {application.priority}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {new Date(application.lastUpdated).toLocaleDateString()}
                        </span>
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
