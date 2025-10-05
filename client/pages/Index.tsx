import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="relative">
      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Smart attendance for teachers and students
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create a class session, share a secure link, and confirm student presence using face match and distance to the teacher’s phone. Instant daily and monthly reports.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/teacher">
              <Button className="bg-brand-600 hover:bg-brand-700">Start as Teacher</Button>
            </Link>
            <Link to="/student">
              <Button variant="outline">I’m a Student</Button>
            </Link>
          </div>
          <ul className="mt-10 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-brand-600"/> Two distinct logins</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-brand-600"/> Session link & copy button</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-brand-600"/> Face match + radius check</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-brand-600"/> Daily & monthly Excel/CSV</li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 blur-2xl"/>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
            <div className="border-b bg-muted/40 px-6 py-3 text-sm font-medium">Live demo</div>
            <div className="p-6">
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-2">
                <li>Create a session on the Teacher page</li>
                <li>Copy and open the student link (/s/:token)</li>
                <li>Save your face once in Student page, then allow camera + location</li>
                <li>Get instant attendance and reports</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-semibold text-muted-foreground">Teachers</div>
            <p className="mt-2 text-sm">Enter classroom, duration, batch and radius. We capture your phone location and generate a student link with one click.</p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-semibold text-muted-foreground">Students</div>
            <p className="mt-2 text-sm">Open the link, verify your saved face, and ensure you’re within the specified radius to get marked present automatically.</p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-semibold text-muted-foreground">Reports</div>
            <p className="mt-2 text-sm">Instant daily and monthly summaries. Export per-month CSV compatible with Excel.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
