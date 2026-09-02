import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-ink/40">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink/60">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
      <LinkButton href="/" className="mt-6">
        Back to home
      </LinkButton>
    </div>
  );
}
