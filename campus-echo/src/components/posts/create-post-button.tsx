"use client";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreatePostButton() {
  return (
    <Link href="/dashboard/create">
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9 text-sm">
        <PlusCircle className="w-4 h-4" /> New Post
      </Button>
    </Link>
  );
}
