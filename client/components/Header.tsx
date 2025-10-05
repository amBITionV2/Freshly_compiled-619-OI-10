import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <header className={cn("sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>      
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400" />
          <span className="font-extrabold tracking-tight">Attendify</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/teacher" className={({isActive})=>cn("px-3 py-2 rounded-md text-sm font-medium hover:text-primary", isActive && "text-primary")}>Teacher</NavLink>
          <NavLink to="/student" className={({isActive})=>cn("px-3 py-2 rounded-md text-sm font-medium hover:text-primary", isActive && "text-primary")}>Student</NavLink>
          <a href="#how-it-works" className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          {!isHome && (
            <Link to="/" className="hidden md:block">
              <Button variant="ghost">Home</Button>
            </Link>
          )}
          <Link to="/teacher">
            <Button className="bg-brand-600 hover:bg-brand-700">Start a session</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
