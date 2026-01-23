import { generateCustomerReport, generateFinancialReport, generateApplicationsReport } from "@/features/reports/server/actions";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { auth } from "@/auth";

export default async function ReportsPage({ params }: { params: { firmId: string } }) {
    const { firmId } = await params; // Await params in modern Next.js 15+ convention

    // Prepare actions bound to firmId
    const customerAction = generateCustomerReport.bind(null, firmId);
    const financialAction = generateFinancialReport.bind(null, firmId);
    const appAction = generateApplicationsReport.bind(null, firmId);

    // Note: In Server Components we can pass Server Actions directly to Client Components.
    // However, binding arguments is the cleaner way if the action relies on scope.

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Reports</h1>
                    <p className="mt-2 text-base text-gray-600">Download and analyze firm performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Financials */}
                <ReportCard
                    name="Financial Report"
                    description="Complete record of all revenue, payments, and invoices for the current fiscal period."
                    type="CSV"
                    action={financialAction}
                />

                {/* Customers */}
                <ReportCard
                    name="Customer Database"
                    description="Full export of all customer profiles including contact details and status."
                    type="CSV"
                    action={customerAction}
                />

                {/* Applications */}
                <ReportCard
                    name="Application Summary"
                    description="Detailed list of all visa applications, current statuses, and priorities."
                    type="CSV"
                    action={appAction}
                />
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-500">
                <h4 className="font-semibold text-gray-700 mb-1">Note on Reporting</h4>
                <p>Reports are generated in real-time based on current database records. Large datasets may take a few seconds to process.</p>
            </div>
        </div>
    );
}
