'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PaymentActionsMenu } from '@/features/payments/components/PaymentActionsMenu';

interface TransactionRowProps {
    transaction: {
        id: string;
        customerId: string;
        applicationId: string;
        customerName: string;
        customerAvatar: string;
        service: string;
        amount: number;
        status: string;
        date: string;
    };
    firmId: string;
}

export function TransactionRow({ transaction, firmId }: TransactionRowProps) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/dashboard/${firmId}/customers/${transaction.customerId}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 ring-2 ring-white">
                        {transaction.customerAvatar}
                    </div>
                    <div>
                        <Link
                            href={`/dashboard/${firmId}/customers/${transaction.customerId}`}
                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {transaction.customerName}
                        </Link>
                        <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-gray-600">{transaction.service}</td>
            <td className="px-6 py-4 font-medium text-gray-900">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(transaction.amount)}
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${transaction.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-100' : ''}
                    ${transaction.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' : ''}
                    ${transaction.status === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-100' : ''}
                    ${transaction.status === 'REFUNDED' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                `}>
                    {transaction.status.toLowerCase()}
                </span>
            </td>
            <td className="px-4 py-4 text-right">
                <div onClick={(e) => e.stopPropagation()}>
                    <PaymentActionsMenu
                        paymentId={transaction.id}
                        customerId={transaction.customerId}
                        applicationId={transaction.applicationId}
                        firmId={firmId}
                        status={transaction.status}
                    />
                </div>
            </td>
        </tr>
    );
}
