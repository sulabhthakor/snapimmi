'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Circle, Plus, Calendar, User as UserIcon } from 'lucide-react';
import { createTask, updateTaskStatus } from '../server/actions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomerSearchInput } from '@/components/ui/CustomerSearchInput';
import { CustomSelect } from '@/components/ui/CustomSelect';

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: string;
    dueDate: Date | null;
    assignee: { name: string } | null;
    customer: { fullName: string } | null;
    application: { id: string; visaType: string; targetCountry: string } | null;
};

export function TaskList({ tasks, firmId }: { tasks: Task[], firmId: string }) {
    const [isPending, startTransition] = useTransition();
    const [isAdding, setIsAdding] = useState(false);

    // New Task State
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [customerId, setCustomerId] = useState('');

    const handleToggleStatus = (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        startTransition(async () => {
            const res = await updateTaskStatus(task.id, newStatus);
            if (!res.success) toast.error("Failed to update status");
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await createTask({
                title,
                priority: priority as any,
                dueDate: dueDate || undefined,
                customerId
            });

            if (res.success) {
                toast.success("Task added");
                setIsAdding(false);
                setTitle('');
                setDueDate('');
                setCustomerId('');
            } else {
                toast.error("Failed to add task");
            }
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">My Tasks</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {isAdding && (
                    <form onSubmit={handleCreate} className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 mb-2 space-y-2">
                        <input
                            autoFocus
                            placeholder="What needs to be done?"
                            className="w-full bg-transparent text-sm font-medium focus:outline-none"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />

                        <div className="z-20 relative">
                            <CustomerSearchInput
                                onSelect={(c) => setCustomerId(c.id)}
                                placeholder="Link to customer (required)"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                            <div className="w-28">
                                <CustomSelect
                                    value={priority}
                                    onChange={(val) => setPriority(val)}
                                    options={[
                                        { value: 'HIGH', label: 'High' },
                                        { value: 'MEDIUM', label: 'Medium' },
                                        { value: 'LOW', label: 'Low' },
                                    ]}
                                />
                            </div>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1"
                            />
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setTitle('');
                                        setDueDate('');
                                        setCustomerId('');
                                        setPriority('MEDIUM');
                                    }}
                                    className="text-xs text-gray-500 hover:text-black px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!title || !customerId || isPending}
                                    className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {tasks.length === 0 && !isAdding && (
                    <EmptyState
                        icon={CheckCircle2}
                        title="All caught up!"
                        description="No pending tasks. Click + to add one."
                    />
                )}

                {tasks.map(task => (
                    <div key={task.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <button
                            disabled={isPending}
                            onClick={() => handleToggleStatus(task)}
                            className={`mt-0.5 ${task.status === 'DONE' ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            {task.status === 'DONE' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-gray-900 truncate ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                {task.dueDate && (
                                    <span className={`flex items-center gap-1 ${task.dueDate < new Date() && task.status !== 'DONE' ? 'text-red-500' : ''}`}>
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(task.dueDate), 'd MMM')}
                                    </span>
                                )}
                                {task.customer && (
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="h-3 w-3" />
                                        {task.customer.fullName}
                                    </span>
                                )}
                                {task.application && (
                                    <Link
                                        href={`/dashboard/${firmId}/applications?id=${task.application.id}`}
                                        className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        🛂 {task.application.targetCountry}
                                    </Link>
                                )}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium 
                                    ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                                        task.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
                                            'bg-green-50 text-green-600'}`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
