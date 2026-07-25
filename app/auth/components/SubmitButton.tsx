"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 text-white p-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Loading..." : children}
    </button>
  );
}
