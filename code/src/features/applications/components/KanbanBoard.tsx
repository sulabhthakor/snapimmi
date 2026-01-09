'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { Application, ApplicationStatus, STATUS_LABELS } from '../types';
import { KanbanCard } from './KanbanCard';
import { updateApplicationStatus } from '../server/actions';
import { createPortal } from 'react-dom';

interface KanbanBoardProps {
    initialData: Application[];
}

const COLUMNS: ApplicationStatus[] = ['INQUIRY', 'DOC_COLLECTION', 'APPLIED', 'DECISION'];

export function KanbanBoard({ initialData }: KanbanBoardProps) {
    const [applications, setApplications] = useState<Application[]>(initialData);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveApp = active.data.current?.type === 'Application';
        const isOverApp = over.data.current?.type === 'Application';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveApp) return;

        // Dragging an Item over another Item
        if (isActiveApp && isOverApp) {
            setApplications((apps) => {
                const activeIndex = apps.findIndex((t) => t.id === activeId);
                const overIndex = apps.findIndex((t) => t.id === overId);

                if (apps[activeIndex].status !== apps[overIndex].status) {
                    const newApps = [...apps];
                    newApps[activeIndex].status = apps[overIndex].status;
                    return arrayMove(newApps, activeIndex, overIndex - 1); // Insert before
                }

                return arrayMove(apps, activeIndex, overIndex);
            });
        }

        // Dragging an Item over a Column
        if (isActiveApp && isOverColumn) {
            setApplications((apps) => {
                const activeIndex = apps.findIndex((t) => t.id === activeId);
                const newStatus = over.id as ApplicationStatus;

                if (apps[activeIndex].status !== newStatus) {
                    const newApps = [...apps];
                    newApps[activeIndex].status = newStatus;
                    return arrayMove(newApps, activeIndex, activeIndex);
                }
                return apps;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeApp = applications.find(x => x.id === active.id);
        if (activeApp) {
            // In real world, we would persist the order here too
            updateApplicationStatus(activeApp.id, activeApp.status);
        }
    };

    const activeApplication = activeId ? applications.find(x => x.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {COLUMNS.map((columnId) => (
                    <Column
                        key={columnId}
                        id={columnId}
                        title={STATUS_LABELS[columnId]}
                        applications={applications.filter(app => app.status === columnId)}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeApplication && <KanbanCard application={activeApplication} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}

function Column({ id, title, applications }: { id: string, title: string, applications: Application[] }) {
    const { setNodeRef } = useSortable({
        id: id,
        data: { type: 'Column' }
    });

    return (
        <div ref={setNodeRef} className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-gray-50/50 border border-gray-100">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {applications.length}
                    </span>
                </div>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
                <SortableContext items={applications.map(app => app.id)} strategy={verticalListSortingStrategy}>
                    {applications.map((app) => (
                        <KanbanCard key={app.id} application={app} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
