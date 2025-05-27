export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in. Please try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <a
            href="/login"
            className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
          >
            Back to Login
          </a>
          
          <p className="text-xs text-gray-500">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}