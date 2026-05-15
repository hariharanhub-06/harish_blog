export default function SmileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0a0a12]">
            {children}
        </div>
    );
}
