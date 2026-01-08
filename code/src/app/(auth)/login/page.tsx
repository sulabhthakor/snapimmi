import LoginForm from './login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | SnapImmi',
    description: 'Login to your dashboard',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    {/* Logo placeholder */}
                    <div className="mx-auto h-12 w-12 rounded-full bg-black/10 flex items-center justify-center mb-4">
                        <span className="text-xl">🔒</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <a href="#" className="font-medium text-black hover:underline hidden">
                            start your 14-day free trial
                        </a>
                        contact your administrator if you don't have an account.
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
