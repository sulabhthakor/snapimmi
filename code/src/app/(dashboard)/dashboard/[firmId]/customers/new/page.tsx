import { NewCustomerWizard } from '@/features/customers/components/NewCustomerWizard';

export default function NewCustomerPage() {
    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Customer</h1>
                    <p className="text-gray-600 mt-2">Follow the steps to register a new lead or client.</p>
                </div>
                <NewCustomerWizard />
            </div>
        </div>
    );
}
