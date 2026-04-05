import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";
import { signOut } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { TopHeader } from "@/components/dashboard/TopHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { planId: true, name: true, email: true },
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar planId={user?.planId || "free"} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader userName={user?.name || user?.email || ""} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
