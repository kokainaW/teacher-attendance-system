export default function MissingEnvVars() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h1>
        <p className="mb-4">
          Supabase environment variables are missing. Please set the following in your .env.local file:
        </p>
        <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-x-auto">
          NEXT_PUBLIC_SUPABASE_URL=your-supabase-url NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        </pre>
        <p className="text-sm text-gray-600">After adding these variables, restart your development server.</p>
      </div>
    </div>
  )
}

