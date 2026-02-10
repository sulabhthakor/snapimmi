
import { ReportsView } from "@/features/reports/components/ReportsView";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports | SnapImmi",
};

export default async function ReportsPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports Center</h1>
                <p className="text-gray-500 mt-1">Generate and download data exports for your firm.</p>
            </div>

            <ReportsView firmId={firmId} />
        </div>
    );
}

