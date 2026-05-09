import { verifyEmail } from "@/actions/auth";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-card p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-gray-400 text-sm mb-6">
            This verification link is missing a token. Please check your email for the correct link.
          </p>
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="w-full max-w-md">
      <div className="glass-card p-8 text-center">
        {result.success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your account is now active. Welcome to Campus Echo!
            </p>
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign In to Continue
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 text-sm mb-6">{result.error}</p>
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Back to Sign In
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
