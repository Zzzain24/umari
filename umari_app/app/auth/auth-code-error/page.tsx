import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Authentication Error
          </h1>
          <p className="text-muted-foreground mb-6">
            There was an error during authentication. Please try again.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

