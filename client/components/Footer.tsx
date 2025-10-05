export function Footer() {
  return (
    <footer className="border-t bg-background/60">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Attendify. All rights reserved.</p>
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <a href="#privacy" className="hover:text-foreground">Privacy</a>
          <a href="#terms" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
