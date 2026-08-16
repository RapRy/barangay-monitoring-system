export default function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Supabase Configuration
      </h1>

      <p className="mt-4">
        URL configured: {supabaseUrl ? "Yes" : "No"}
      </p>
    </main>
  );
}