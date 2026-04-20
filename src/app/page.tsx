import Link from 'next/link';
import { HeroCTA } from '@/components/HeroCTA';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="dark:bg-background/80 dark:rounded-2xl dark:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            AI-Powered Email Intelligence
          </p>

          <h1 className="mt-4 font-serif text-[clamp(3rem,11vw,9rem)] leading-[0.92] tracking-tight text-foreground">
            EVERY EMAIL
            <br />
            <span className="italic text-muted-foreground">INVESTIGATED.</span>
          </h1>

          <p className="mt-10 max-w-[56ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            Scholarships, internships, fellowships, competitions - buried under
            newsletters and noise. Mail Detective uses AI to read every email,
            surface real opportunities, and rank them against{' '}
            <span className="text-foreground">
              your profile, your deadlines, your goals.
            </span>
          </p>

          <HeroCTA />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-4 font- text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>How It Works</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      {/* Three-step process */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden border border-border md:my-12 md:grid-cols-3 my-10 mx-6">
        {[
          {
            n: '01',
            title: 'Filter',
            body: 'Paste or upload your emails. Our AI separates real opportunities from spam, newsletters, and noise - instantly.',
          },
          {
            n: '02',
            title: 'Extract',
            body: 'For every opportunity, structured data is extracted - deadline, eligibility, required documents, links, and contacts.',
          },
          {
            n: '03',
            title: 'Score',
            body: 'Each opportunity is scored against your profile. Urgency, fit, and completeness - combined into a single actionable rank.',
          },
        ].map(step => (
          <article
            key={step.n}
            className="group relative bg-background p-8 transition-colors hover:bg-muted/40 md:p-10"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Step {step.n}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <h3 className="mt-6 text-4xl text-foreground">{step.title}</h3>
            <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </article>
        ))}
      </section>

      {/* Value proposition */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <div className="inline-block rounded-sm border border-foreground/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">
              Why Mail Detective
            </div>
          </div>
          <blockquote className="md:col-span-9">
            <p className="font-optimus text-3xl leading-snug text-foreground md:text-5xl">
              The professional who finds the opportunity first, wins it.{' '}
              <span className="italic text-muted-foreground">
                Most miss it because no one read the email.
              </span>
            </p>
            <footer className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              - Stop missing what matters.
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-lg border border-border bg-muted/30 p-10 text-center md:p-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Simple Pricing
          </p>
          <h2 className="mt-4 text-4xl text-foreground md:text-5xl">
            Free while in beta.
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-base leading-relaxed text-muted-foreground">
            Get full access to every feature today. When we launch paid plans,
            early users keep their benefits.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-8 text-sm font-brand font-medium text-background transition-all duration-300 hover:opacity-90"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 font-brand text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Mail Detective</span>
          <span>2026 © ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
