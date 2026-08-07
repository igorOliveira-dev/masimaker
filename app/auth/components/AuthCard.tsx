export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg mx-4 max-w-lg w-full h-full bg-(--background-secondary)">{children}</div>
  );
}
