const reviews = [
  {
    name: 'Sanne V.',
    location: 'Amsterdam',
    occasion: 'Verjaardag',
    quote: 'Mijn broer lag dubbel. En schaamde zich dood. Perfecte combinatie.',
  },
  {
    name: 'Thomas H.',
    location: 'Rotterdam',
    occasion: 'Afscheid collega',
    quote: 'Binnen 24 uur een roast die precies raak was. Iedereen wist dat het klopte.',
  },
  {
    name: 'Linda B.',
    location: 'Utrecht',
    occasion: 'Vrijgezellenfeest',
    quote: 'De bruidegom wilde dat we hem nooit meer afspelen. Wij wel.',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className="h-5 w-5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.956c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.285-3.956a1 1 0 00-.364-1.118L2.063 9.383c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/40">
          Wat klanten zeggen
        </p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Zo voelt het als je het hoort.
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-8"
          >
            <Stars />
            <p className="mt-5 text-lg font-semibold leading-7 text-white">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(255,107,0,0.2),rgba(123,47,190,0.2))] text-base font-bold text-white">
                {r.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{r.name}</p>
                <p className="text-xs text-white/40">
                  {r.location} &middot; {r.occasion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
