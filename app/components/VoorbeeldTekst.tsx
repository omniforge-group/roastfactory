import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function VoorbeeldTekst() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/40">
          Voorbeeld roasttekst
        </p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Zo klinkt een roast voor Mark
        </h2>
        <p className="mt-2 text-base text-white/40">
          Stijl: Scherp · Gelegenheid: Verjaardag
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-2xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-10 sm:p-12">
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">
                Intro
              </p>
              <p className="text-base leading-8 text-white/70">
                Mark, jij gelooft echt dat je grappig bent,<br />
                maar eerlijk gezegd — niemand lacht om jou,<br />
                ze lachen óm je, dat is toch ook wat waard.<br />
                Gelukkig heb je een moeder die van je houdt.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                De roast
              </p>
              <p className="text-base font-semibold leading-8 text-white">
                Dertig jaar, en nog steeds geen rijbewijs,<br />
                Marks koffie is altijd te laat en te lauw.<br />
                Maar ergens — diep verscholen — zit een goeie vent,<br />
                heel diep, maar toch — gefeliciteerd, man.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">
                Outro
              </p>
              <p className="text-base leading-8 text-white/70">
                Ze zeggen dat je beter wordt met de jaren,<br />
                maar dat hebben ze ook over kaas gezegd.<br />
                Wij houden van je zoals je bent, Mark —<br />
                ook al weten we niet helemaal waarom.
              </p>
            </div>
          </div>
        </div>

        {/* Fade overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 rounded-b-[2rem] bg-gradient-to-b from-transparent to-[#0d0d0d]" />

        <div className="mt-8 text-center">
          <Link
            href="/bestellen"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF6B00_0%,#7B2FBE_50%,#3B82F6_100%)] px-7 py-4 text-base font-semibold text-white shadow-xl shadow-purple-900/30"
          >
            Maak jouw persoonlijke roast
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
