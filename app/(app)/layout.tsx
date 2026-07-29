import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#111111] text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}