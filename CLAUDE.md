@AGENTS.md

# SongFactory.eu — Project Instructies

## Wat is dit project?
SongFactory.eu is een Next.js webapplicatie waarmee klanten een gepersonaliseerd lied kunnen bestellen. De klant vult een bestelformulier in, betaalt via Stripe, en ontvangt automatisch een AI-gegenereerd lied (lyrics + audio) per e-mail.

## Tech stack
- Next.js (App Router) met TypeScript
- Tailwind CSS voor styling
- Stripe voor betalingen (webhooks)
- Supabase voor database (orders tabel)
- OpenAI voor lyrics generatie
- Suno of vergelijkbare API voor audio generatie
- Resend voor e-mails

## Mappenstructuur
- app/bestellen/ → bestelformulier (5 stappen)
- app/api/create-checkout-session/ → maakt Stripe sessie + lyrics prompt aan
- app/api/stripe/webhook/ → verwerkt betaling, genereert song, verstuurt mails
- app/api/generate-song/ → genereert lyrics via OpenAI
- app/api/generate-audio/ → genereert audio
- app/api/deliver-song/ → verstuurt leveringsmail met audio
- app/admin/ → admin overzicht van orders
- lib/ → hulpbestanden: audio.ts, lyrics.ts, openai.ts, stripe.ts, supabase.ts, resend.ts

## Bestelformulier opties
- Gelegenheden: Verjaardag, Liefde, Jubileum, Bedankje, Vriendschap, Anders
- Stijlen: Pop, Ballad, Rap, Akoestisch, EDM, Rock, Punk, Indie Pop
- Sferen: Romantisch, Vrolijk/Feestelijk, Emotioneel/Verdrietig, Nostalgisch, Motiverend/Inspirerend, Humoristisch/Grappig, Intiem/Rustig, Krachtig/Stoer, Dromerig/Magisch, Zomers/Chill
- Stemmen: Mannelijk (Male), Vrouwelijk (Female), Duet (man & vrouw)
- Tempo: Langzaam, Gemiddeld, Snel
- Talen: Nederlands, Frans, Engels, Duits

## Stijl & Design
- Gradient: oranje → roze → paars (135deg, #f59e0b → #ec4899 → #3b82f6)
- Afgeronde hoeken: rounded-2xl of rounded-[2rem]
- Witte kaartjes met subtiele border en shadow
- Achtergrond: licht roze/paars verloop
- Geen harde kleuren, altijd subtiel en modern

## Belangrijke regels
- Alle teksten op de website zijn in het Nederlands
- Lyrics prompts zijn in het Engels (instructies aan AI)
- Prijzen: €14,95 eenmalig
- Altijd pushen naar GitHub na een wijziging (Commit → Push origin)
- Vercel deploy gebeurt automatisch na elke push

## Veelgebruikte aanpassingen
- Bestelformulier aanpassen → app/bestellen/page.tsx
- Lyrics prompt aanpassen → app/api/create-checkout-session/route.ts (regels 66-109)
- E-mails aanpassen → app/api/stripe/webhook/route.ts
- Nieuwe muziekstijl of sfeer toevoegen → app/bestellen/page.tsx (STYLES of MOODS array)
- Nieuwe stemoptie toevoegen → app/bestellen/page.tsx (VOICES array)
