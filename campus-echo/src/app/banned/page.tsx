import Link from "next/link";
import { Ban } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BannedPage() {
  const session = await auth();
  let banReason = "Violation of community guidelines";

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { banReason: true },
    });
    if (user?.banReason) banReason = user.banReason;
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <Ban className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-3">Account Suspended</h1>
        <p className="text-gray-400 mb-4 leading-relaxed">
          Your account has been suspended and you can no longer post or comment on Campus Echo.
        </p>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <p className="text-sm text-red-300">
            <span className="font-semibold">Reason:</span> {banReason}
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          If you believe this is an error, please contact the campus administration directly.
        </p>
        <Link
          href="/"
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
