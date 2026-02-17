import LoginForm from './login-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { DecorativeBackground } from '@/components/ui/DecorativeBackground';

export const metadata: Metadata = {
    title: 'Login | SnapImmi',
    description: 'Login to your dashboard',
};

export default function LoginPage() {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 relative">
            <DecorativeBackground variant="subtle" />

            {/* Left Side: Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mx-auto w-full max-w-[350px] space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <Link href="/" className="mb-8 mx-auto flex items-center justify-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-teal-500 to-primary-teal-600 flex items-center justify-center shadow-lg shadow-primary-teal-500/30">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-teal-600 to-primary-teal-500">SnapImmi</span>
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Welcome back
                        </h1>
                        <p className="text-sm text-gray-500">
                            Enter your email to sign in to your dashboard
                        </p>
                    </div>

                    <LoginForm />

                    <p className="px-8 text-center text-sm text-gray-500">
                        By clicking continue, you agree to our{" "}
                        <Link href="#" className="underline underline-offset-4 hover:text-black">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="underline underline-offset-4 hover:text-black">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>

            <div className="hidden lg:block relative overflow-hidden">
                {/* Teal Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-teal-600 via-primary-teal-500 to-primary-teal-700" />
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}
                />

                <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                    <div className="text-lg font-medium">
                        {/* Top left content if needed */}
                    </div>
                    <div className="space-y-4 max-w-lg">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;SnapImmi has completely transformed how we manage our visa applications. The automated reminders alone have saved us countless hours.&rdquo;
                            </p>
                            <footer className="text-sm opacity-80">Sofia Davis, General Manager at GlobalVisas</footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
}
