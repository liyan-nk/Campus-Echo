import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#080810] flex">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-64">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto custom-scroll page-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
