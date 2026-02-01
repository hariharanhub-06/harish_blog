import SessionTimeout from "@/components/admin/SessionTimeout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SessionTimeout />
            {children}
        </>
    );
}
