import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] text-white p-4">
            <h2 className="text-4xl font-bold mb-4 text-orange-600">404 - Page Not Found</h2>
            <p className="mb-8 text-gray-400">Could not find requested resource</p>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 max-w-md w-full text-center">
                <p className="text-sm text-gray-500 mb-4">Debug Info: Custom Not Found Page Active</p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors inline-block"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
