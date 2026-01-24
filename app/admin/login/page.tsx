"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set cookie client-side (simple implementation)
    // In a real app, do this via Server Action + HttpOnly cookie
    document.cookie = `admin_session=${password}; path=/; max-age=3600`;
    router.refresh();
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-xl font-bold dark:text-white">Admin Login</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Admin Password"
          className="mb-4 w-full rounded border border-gray-300 p-2 dark:bg-zinc-800 dark:text-white"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
