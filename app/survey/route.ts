export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SongFactory Survey</title>
<link rel="icon" href="/favicon.ico" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #0f0f0f;
    --white: #ffffff;
    --grad-start: #f97316;
    --grad-end: #a855f7;
    --grad: linear-gradient(135deg, #f97316, #ec4899, #a855f7);
    --green-badge-bg: #dcfce7;
    --green-badge-text: #15803d;
    --gray-soft: #f8f8f8;
    --gray-mid: #e5e7eb;
    --gray-text: #6b7280;
    --gray-card: #f9fafb;
    --danger: #ef4444;
    --success: #22c55e;
    --radius: 16px;
    --shadow: 0 2px 16px rgba(0,0,0,0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--gray-soft);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .survey-wrap {
    width: 100%;
    max-width: 560px;
  }

  .logo {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .logo img {
    height: 36px;
  }

  .logo-text {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--black);
    letter-spacing: -0.5px;
  }

  .logo-text span {
    background: var(--grad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 2rem 2rem 1.75rem;
    box-shadow: var(--shadow);
    border: 1px solid var(--gray-mid);
  }

  .progress-bar {
    height: 3px;
    background: var(--gray-mid);
    border-radius: 99px;
    margin-bottom: 1.75rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--grad);
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  .screen { display: none; }
  .screen.active { display: block; }

  .screen-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--gray-text);
    margin-bottom: 0.5rem;
  }

  h2 {
    font-family: 'Inter', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--black);
    line-height: 1.3;
    margin-bottom: 0.5rem;
  }

  .sub {
    font-size: 14px;
    color: var(--gray-text);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 1.5rem;
  }

  .choice {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border: 1.5px solid var(--gray-mid);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 15px;
    color: var(--black);
    background: var(--white);
    user-select: none;
  }

  .choice:hover { border-color: #f97316; background: #fff7ed; }
  .choice.selected { border-color: #f97316; background: #fff7ed; font-weight: 600; }

  .choice-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--gray-mid);
    flex-shrink: 0;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .choice.selected .choice-dot {
    border-color: #f97316;
    background: #f97316;
  }

  .choice.selected .choice-dot::after {
    content: '';
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    display: block;
  }

  .stars {
    display: flex;
    gap: 8px;
    margin-bottom: 1.5rem;
  }

  .star {
    font-size: 32px;
    cursor: pointer;
    color: var(--gray-mid);
    transition: color 0.1s, transform 0.1s;
    line-height: 1;
  }

  .star.lit { color: #f97316; }
  .star:hover { transform: scale(1.15); }

  .matrix {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 1.5rem;
  }

  .matrix-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .matrix-label {
    font-size: 14px;
    color: var(--black);
    min-width: 90px;
  }

  .matrix-stars {
    display: flex;
    gap: 4px;
  }

  .matrix-star {
    font-size: 22px;
    cursor: pointer;
    color: var(--gray-mid);
    transition: color 0.1s;
    line-height: 1;
  }

  .matrix-star.lit { color: #f97316; }

  .slider-wrap {
    margin-bottom: 1.5rem;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--gray-text);
    margin-bottom: 6px;
  }

  .slider-val {
    text-align: center;
    font-size: 48px;
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    color: var(--black);
    margin-bottom: 10px;
  }

  input[type=range] {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    background: var(--gray-mid);
    border-radius: 99px;
    outline: none;
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #f97316;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 0 0 1px var(--gold-dark);
  }

  textarea {
    width: 100%;
    border: 1.5px solid var(--gray-mid);
    border-radius: 12px;
    padding: 12px 14px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    color: var(--black);
    resize: vertical;
    min-height: 90px;
    margin-bottom: 1.5rem;
    outline: none;
    transition: border-color 0.15s;
    background: var(--white);
  }

  textarea:focus { border-color: #f97316; }

  input[type=text], input[type=email] {
    width: 100%;
    border: 1.5px solid var(--gray-mid);
    border-radius: 12px;
    padding: 12px 14px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    color: var(--black);
    margin-bottom: 1rem;
    outline: none;
    transition: border-color 0.15s;
    background: var(--white);
  }

  input[type=text]:focus, input[type=email]:focus { border-color: #f97316; }

  .btn {
    width: 100%;
    padding: 14px 20px;
    background: var(--black);
    color: var(--white);
    border: none;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: -0.2px;
  }

  .btn:hover { opacity: 0.85; }
  .btn:active { transform: scale(0.98); }

  .btn-gold {
    background: var(--grad);
    color: white;
    border: none;
  }

  .btn-gold:hover { opacity: 0.9; }

  .btn-ghost {
    background: transparent;
    color: var(--gray-text);
    border: 1.5px solid var(--gray-mid);
    margin-top: 8px;
  }

  .btn-ghost:hover { background: var(--gray-soft); color: var(--black); }

  .nav {
    display: flex;
    gap: 8px;
    margin-top: 0.5rem;
  }

  .nav .btn { margin-top: 0; }

  .boost-banner {
    background: var(--green-badge-bg);
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--green-badge-text);
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 600;
  }

  .thank-you {
    text-align: center;
    padding: 1rem 0;
  }

  .thank-you .emoji-big {
    font-size: 52px;
    margin-bottom: 1rem;
    display: block;
  }

  .thank-you h2 {
    margin-bottom: 0.5rem;
  }

  .thank-you p {
    font-size: 15px;
    color: var(--gray-text);
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .lang-toggle {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 1rem;
  }

  .lang-btn {
    font-size: 13px;
    font-weight: 500;
    color: var(--gray-text);
    background: none;
    border: 1px solid var(--gray-mid);
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .lang-btn.active {
    background: var(--black);
    color: white;
    border-color: var(--black);
  }

  .hidden { display: none !important; }

  .share-extra { margin-top: 12px; }

  .error-msg {
    font-size: 13px;
    color: var(--danger);
    margin-top: -1rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    .card { padding: 1.5rem 1.25rem; }
    h2 { font-size: 19px; }
    .star { font-size: 28px; }
  }
</style>
</head>
<body>

<div class="survey-wrap">

  <div class="lang-toggle">
    <button class="lang-btn active" onclick="setLang('nl')">🇳🇱 NL</button>
    <button class="lang-btn" onclick="setLang('en')">🇬🇧 EN</button>
  </div>

  <div class="logo">
    <div class="logo-text">Song<span>Factory</span></div>
    <div style="font-size:12px;color:#6b7280;margin-top:3px;font-weight:500;">Persoonlijke songs op maat</div>
  </div>

  <div class="card">
    <div class="progress-bar"><div class="progress-fill" id="progress" style="width:0%"></div></div>

    <!-- SCREEN 0: OPENING -->
    <div class="screen active" id="s0">
      <div style="display:inline-flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;font-size:12px;font-weight:600;padding:6px 12px;border-radius:99px;margin-bottom:1rem;">
        <span>✓</span> <span data-nl="Slechts 2 minuten · Jouw mening telt" data-en="Only 2 minutes · Your opinion matters">Slechts 2 minuten · Jouw mening telt</span>
      </div>
      <h2 data-nl="We zijn net live met SongFactory 🎉" data-en="SongFactory just went live 🎉">We zijn net live met SongFactory 🎉</h2>
      <p class="sub" data-nl="Jij bent één van de eersten die het heeft getest — en dat maakt jouw mening extra waardevol 🙏 Eerlijk antwoord = beste hulp voor ons." data-en="You're one of the first to test it — which makes your opinion extra valuable 🙏 An honest answer = the best help for us.">
        Jij bent één van de eersten die het heeft getest — en dat maakt jouw mening extra waardevol 🙏 Eerlijk antwoord = beste hulp voor ons.
      </p>
      <button class="btn btn-gold" onclick="goTo(1)" data-nl="Start de survey →" data-en="Start survey →">Start de survey →</button>
    </div>

    <!-- SCREEN 1: VOOR WIE -->
    <div class="screen" id="s1">
      <div class="screen-label" data-nl="Vraag 1 van 15" data-en="Question 1 of 15">Vraag 1 van 15</div>
      <h2 data-nl="Voor wie heb je het liedje laten maken?" data-en="Who did you have the song made for?">Voor wie heb je het liedje laten maken?</h2>
      <div class="choices" id="choices-1">
        <div class="choice" onclick="selectChoice('q1', this, 'Partner')"><div class="choice-dot"></div><span data-nl="Partner" data-en="Partner">Partner</span></div>
        <div class="choice" onclick="selectChoice('q1', this, 'Vriend / vriendin')"><div class="choice-dot"></div><span data-nl="Vriend / vriendin" data-en="Friend">Vriend / vriendin</span></div>
        <div class="choice" onclick="selectChoice('q1', this, 'Familie')"><div class="choice-dot"></div><span data-nl="Familie" data-en="Family">Familie</span></div>
        <div class="choice" onclick="selectChoice('q1', this, 'Collega')"><div class="choice-dot"></div><span data-nl="Collega" data-en="Colleague">Collega</span></div>
        <div class="choice" onclick="selectChoice('q1', this, 'Mezelf')"><div class="choice-dot"></div><span data-nl="Mezelf" data-en="Myself">Mezelf</span></div>
        <div class="choice" onclick="selectChoice('q1', this, 'Anders')"><div class="choice-dot"></div><span data-nl="Anders" data-en="Other">Anders</span></div>
      </div>
      <div class="nav">
        <button class="btn" onclick="nextRequired('q1', 2)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 2: HOE ONTDEKT -->
    <div class="screen" id="s2">
      <div class="screen-label" data-nl="Vraag 2 van 15" data-en="Question 2 of 15">Vraag 2 van 15</div>
      <h2 data-nl="Hoe heb je SongFactory ontdekt?" data-en="How did you discover SongFactory?">Hoe heb je SongFactory ontdekt?</h2>
      <div class="choices" id="choices-2">
        <div class="choice" onclick="selectChoice('q2', this, 'Instagram')"><div class="choice-dot"></div><span>Instagram</span></div>
        <div class="choice" onclick="selectChoice('q2', this, 'TikTok')"><div class="choice-dot"></div><span>TikTok</span></div>
        <div class="choice" onclick="selectChoice('q2', this, 'Admin')"><div class="choice-dot"></div><span>Admin</span></div>
        <div class="choice" onclick="selectChoice('q2', this, 'Via vrienden of familie')"><div class="choice-dot"></div><span data-nl="Via vrienden of familie" data-en="Via friends or family">Via vrienden of familie</span></div>
        <div class="choice" onclick="selectChoice('q2', this, 'Google')"><div class="choice-dot"></div><span>Google</span></div>
        <div class="choice" onclick="selectChoice('q2', this, 'Anders')"><div class="choice-dot"></div><span data-nl="Anders" data-en="Other">Anders</span></div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(1)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="nextRequired('q2', 3)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 3: TAAL LIEDJE -->
    <div class="screen" id="s3">
      <div class="screen-label" data-nl="Vraag 3 van 15" data-en="Question 3 of 15">Vraag 3 van 15</div>
      <h2 data-nl="In welke taal was het liedje?" data-en="In what language was the song?">In welke taal was het liedje?</h2>
      <div class="choices" id="choices-3">
        <div class="choice" onclick="selectChoice('q3', this, 'Nederlands')"><div class="choice-dot"></div><span data-nl="Nederlands" data-en="Dutch">Nederlands</span></div>
        <div class="choice" onclick="selectChoice('q3', this, 'Engels')"><div class="choice-dot"></div><span data-nl="Engels" data-en="English">Engels</span></div>
        <div class="choice" onclick="selectChoice('q3', this, 'Frans')"><div class="choice-dot"></div><span data-nl="Frans" data-en="French">Frans</span></div>
        <div class="choice" onclick="selectChoice('q3', this, 'Duits')"><div class="choice-dot"></div><span data-nl="Duits" data-en="German">Duits</span></div>
        <div class="choice" onclick="selectChoice('q3', this, 'Anders')"><div class="choice-dot"></div><span data-nl="Anders" data-en="Other">Anders</span></div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(2)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="nextRequired('q3', 4)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 4: GEMAK BESTELLEN -->
    <div class="screen" id="s4">
      <div class="screen-label" data-nl="Vraag 4 van 15" data-en="Question 4 of 15">Vraag 4 van 15</div>
      <h2 data-nl="Hoe makkelijk was het om een liedje te bestellen?" data-en="How easy was it to order a song?">Hoe makkelijk was het om een liedje te bestellen?</h2>
      <p class="sub" data-nl="1 = heel moeilijk · 5 = super makkelijk" data-en="1 = very difficult · 5 = super easy">1 = heel moeilijk · 5 = super makkelijk</p>
      <div class="stars" id="stars-q4">
        <span class="star" onclick="rateStar('q4', 1)">★</span>
        <span class="star" onclick="rateStar('q4', 2)">★</span>
        <span class="star" onclick="rateStar('q4', 3)">★</span>
        <span class="star" onclick="rateStar('q4', 4)">★</span>
        <span class="star" onclick="rateStar('q4', 5)">★</span>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(3)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="nextRequired('q4', 5)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 5: HOE SNEL -->
    <div class="screen" id="s5">
      <div class="screen-label" data-nl="Vraag 5 van 15" data-en="Question 5 of 15">Vraag 5 van 15</div>
      <h2 data-nl="Hoe snel kreeg je je liedje(s)?" data-en="How quickly did you receive your song(s)?">Hoe snel kreeg je je liedje(s)?</h2>
      <div class="choices" id="choices-5">
        <div class="choice" onclick="selectChoice('q5', this, 'Binnen 10 min')"><div class="choice-dot"></div><span data-nl="Binnen 10 minuten" data-en="Within 10 minutes">Binnen 10 minuten</span></div>
        <div class="choice" onclick="selectChoice('q5', this, '10-30 min')"><div class="choice-dot"></div><span data-nl="10 – 30 minuten" data-en="10 – 30 minutes">10 – 30 minuten</span></div>
        <div class="choice" onclick="selectChoice('q5', this, '30-60 min')"><div class="choice-dot"></div><span data-nl="30 – 60 minuten" data-en="30 – 60 minutes">30 – 60 minuten</span></div>
        <div class="choice" onclick="selectChoice('q5', this, 'Meer dan 1 uur')"><div class="choice-dot"></div><span data-nl="Meer dan 1 uur" data-en="More than 1 hour">Meer dan 1 uur</span></div>
        <div class="choice" onclick="selectChoice('q5', this, 'Nog niet ontvangen')"><div class="choice-dot"></div><span data-nl="Nog niet ontvangen" data-en="Not received yet">Nog niet ontvangen</span></div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(4)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="nextRequired('q5', 6)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 6: AANSLUITING AANVRAAG -->
    <div class="screen" id="s6">
      <div class="screen-label" data-nl="Vraag 6 van 15" data-en="Question 6 of 15">Vraag 6 van 15</div>
      <h2 data-nl="Hoe goed sloot het liedje aan op jouw aanvraag?" data-en="How well did the song match your request?">Hoe goed sloot het liedje aan op jouw aanvraag?</h2>
      <p class="sub" data-nl="1 = helemaal niet · 5 = perfect" data-en="1 = not at all · 5 = perfect">1 = helemaal niet · 5 = perfect</p>
      <div class="stars" id="stars-q6">
        <span class="star" onclick="rateStar('q6', 1)">★</span>
        <span class="star" onclick="rateStar('q6', 2)">★</span>
        <span class="star" onclick="rateStar('q6', 3)">★</span>
        <span class="star" onclick="rateStar('q6', 4)">★</span>
        <span class="star" onclick="rateStar('q6', 5)">★</span>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(5)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="nextRequired('q6', 7)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 7: KWALITEITSMATRIX -->
    <div class="screen" id="s7">
      <div class="screen-label" data-nl="Vraag 7 van 15" data-en="Question 7 of 15">Vraag 7 van 15</div>
      <h2 data-nl="Wat vond je van de kwaliteit?" data-en="What did you think of the quality?">Wat vond je van de kwaliteit?</h2>
      <p class="sub" data-nl="Geef elk onderdeel een score van 1 tot 5" data-en="Rate each element from 1 to 5">Geef elk onderdeel een score van 1 tot 5</p>
      <div class="matrix">
        <div class="matrix-row">
          <span class="matrix-label" data-nl="Stem" data-en="Voice">Stem</span>
          <div class="matrix-stars" id="matrix-stem">
            <span class="matrix-star" onclick="rateMatrix('stem', 1)">★</span>
            <span class="matrix-star" onclick="rateMatrix('stem', 2)">★</span>
            <span class="matrix-star" onclick="rateMatrix('stem', 3)">★</span>
            <span class="matrix-star" onclick="rateMatrix('stem', 4)">★</span>
            <span class="matrix-star" onclick="rateMatrix('stem', 5)">★</span>
          </div>
        </div>
        <div class="matrix-row">
          <span class="matrix-label" data-nl="Uitspraak" data-en="Pronunciation">Uitspraak</span>
          <div class="matrix-stars" id="matrix-uitspraak">
            <span class="matrix-star" onclick="rateMatrix('uitspraak', 1)">★</span>
            <span class="matrix-star" onclick="rateMatrix('uitspraak', 2)">★</span>
            <span class="matrix-star" onclick="rateMatrix('uitspraak', 3)">★</span>
            <span class="matrix-star" onclick="rateMatrix('uitspraak', 4)">★</span>
            <span class="matrix-star" onclick="rateMatrix('uitspraak', 5)">★</span>
          </div>
        </div>
        <div class="matrix-row">
          <span class="matrix-label" data-nl="Lyrics" data-en="Lyrics">Lyrics</span>
          <div class="matrix-stars" id="matrix-lyrics">
            <span class="matrix-star" onclick="rateMatrix('lyrics', 1)">★</span>
            <span class="matrix-star" onclick="rateMatrix('lyrics', 2)">★</span>
            <span class="matrix-star" onclick="rateMatrix('lyrics', 3)">★</span>
            <span class="matrix-star" onclick="rateMatrix('lyrics', 4)">★</span>
            <span class="matrix-star" onclick="rateMatrix('lyrics', 5)">★</span>
          </div>
        </div>
        <div class="matrix-row">
          <span class="matrix-label" data-nl="Muziek" data-en="Music">Muziek</span>
          <div class="matrix-stars" id="matrix-muziek">
            <span class="matrix-star" onclick="rateMatrix('muziek', 1)">★</span>
            <span class="matrix-star" onclick="rateMatrix('muziek', 2)">★</span>
            <span class="matrix-star" onclick="rateMatrix('muziek', 3)">★</span>
            <span class="matrix-star" onclick="rateMatrix('muziek', 4)">★</span>
            <span class="matrix-star" onclick="rateMatrix('muziek', 5)">★</span>
          </div>
        </div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(6)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(8)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 8: ALGEMEEN CIJFER -->
    <div class="screen" id="s8">
      <div class="screen-label" data-nl="Vraag 8 van 15" data-en="Question 8 of 15">Vraag 8 van 15</div>
      <div class="boost-banner" data-nl="Je bent er bijna! 💪 Nog een paar korte vragen" data-en="Almost there! 💪 Just a few more short questions">Je bent er bijna! 💪 Nog een paar korte vragen</div>
      <h2 data-nl="Geef SongFactory een algemeen cijfer" data-en="Give SongFactory an overall score">Geef SongFactory een algemeen cijfer</h2>
      <div class="slider-wrap">
        <div class="slider-val" id="slider-val-8">7</div>
        <div class="slider-labels"><span>1</span><span>10</span></div>
        <input type="range" min="1" max="10" value="7" step="1" id="slider-8" oninput="updateSlider('8')" onchange="answers.q8_cijfer = parseInt(this.value)">
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(7)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="splitFlow()" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 9: NPS -->
    <div class="screen" id="s9">
      <div class="screen-label" data-nl="Vraag 9 van 15" data-en="Question 9 of 15">Vraag 9 van 15</div>
      <h2 data-nl="Hoe waarschijnlijk is het dat je SongFactory aanbeveelt?" data-en="How likely are you to recommend SongFactory?">Hoe waarschijnlijk is het dat je SongFactory aanbeveelt?</h2>
      <p class="sub" data-nl="0 = absoluut niet · 10 = zeker weten" data-en="0 = absolutely not · 10 = definitely">0 = absoluut niet · 10 = zeker weten</p>
      <div class="slider-wrap">
        <div class="slider-val" id="slider-val-9">7</div>
        <div class="slider-labels"><span>0</span><span>10</span></div>
        <input type="range" min="0" max="10" value="7" step="1" id="slider-9" oninput="updateSlider('9')" onchange="answers.q9_nps = parseInt(this.value)">
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(8)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="npsFlow()" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 10A: FAN -->
    <div class="screen" id="s10a">
      <div class="screen-label">🟢 Fan Flow</div>
      <h2 data-nl="Wat vond je het allerbeste aan je liedje?" data-en="What did you like most about your song?">Wat vond je het allerbeste aan je liedje?</h2>
      <textarea id="q10a" placeholder="" oninput="answers.q10a_best = this.value"></textarea>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(9)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(11)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 10B: IMPROVEMENT -->
    <div class="screen" id="s10b">
      <div class="screen-label">🔴 Feedback Flow</div>
      <h2 data-nl="Wat kunnen we verbeteren?" data-en="What can we improve?">Wat kunnen we verbeteren?</h2>
      <textarea id="q10b" placeholder="" oninput="answers.q10b_improve = this.value"></textarea>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(9)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo('10b2')" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 10B2: WAT MISTE? -->
    <div class="screen" id="s10b2">
      <div class="screen-label">🔴 Feedback Flow</div>
      <h2 data-nl="Wat miste er voor jou?" data-en="What was missing for you?">Wat miste er voor jou?</h2>
      <textarea id="q10b2" placeholder="" oninput="answers.q10b_missing = this.value"></textarea>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo('10b')" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(13)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 11: CADEAU KOPEN? -->
    <div class="screen" id="s11">
      <div class="screen-label" data-nl="Vraag 11 van 15" data-en="Question 11 of 15">Vraag 11 van 15</div>
      <h2 data-nl="Zou je dit als cadeau kopen?" data-en="Would you buy this as a gift?">Zou je dit als cadeau kopen?</h2>
      <div class="choices" id="choices-11">
        <div class="choice" onclick="selectChoice('q11', this, 'Ja zeker')"><div class="choice-dot"></div><span data-nl="Ja zeker" data-en="Yes definitely">Ja zeker</span></div>
        <div class="choice" onclick="selectChoice('q11', this, 'Misschien')"><div class="choice-dot"></div><span data-nl="Misschien" data-en="Maybe">Misschien</span></div>
        <div class="choice" onclick="selectChoice('q11', this, 'Nee')"><div class="choice-dot"></div><span data-nl="Nee" data-en="No">Nee</span></div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo('10a')" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(12)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 12: PRIJS BEREID -->
    <div class="screen" id="s12">
      <div class="screen-label" data-nl="Vraag 12 van 15" data-en="Question 12 of 15">Vraag 12 van 15</div>
      <h2 data-nl="Wat zou je hiervoor betalen?" data-en="What would you pay for this?">Wat zou je hiervoor betalen?</h2>
      <div class="choices" id="choices-12">
        <div class="choice" onclick="selectChoice('q12', this, '€5–€10')"><div class="choice-dot"></div><span>€5 – €10</span></div>
        <div class="choice" onclick="selectChoice('q12', this, '€10–€20')"><div class="choice-dot"></div><span>€10 – €20</span></div>
        <div class="choice" onclick="selectChoice('q12', this, '€20–€40')"><div class="choice-dot"></div><span>€20 – €40</span></div>
        <div class="choice" onclick="selectChoice('q12', this, '€40+')"><div class="choice-dot"></div><span>€40+</span></div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(11)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(13)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 13: GEDEELD? -->
    <div class="screen" id="s13">
      <div class="screen-label" data-nl="Vraag 13 van 15" data-en="Question 13 of 15">Vraag 13 van 15</div>
      <h2 data-nl="Heb je het liedje gedeeld met anderen?" data-en="Did you share the song with others?">Heb je het liedje gedeeld met anderen?</h2>
      <div class="choices" id="choices-13">
        <div class="choice" onclick="selectChoice('q13', this, 'Ja'); document.getElementById('share-extra').classList.remove('hidden')"><div class="choice-dot"></div><span data-nl="Ja" data-en="Yes">Ja</span></div>
        <div class="choice" onclick="selectChoice('q13', this, 'Nee'); document.getElementById('share-extra').classList.add('hidden')"><div class="choice-dot"></div><span data-nl="Nee" data-en="No">Nee</span></div>
      </div>
      <div class="share-extra hidden" id="share-extra">
        <p class="sub" style="margin-bottom:10px" data-nl="Met wie?" data-en="With whom?">Met wie?</p>
        <div class="choices" id="choices-share">
          <div class="choice" onclick="selectChoice('q13_who', this, 'Partner')"><div class="choice-dot"></div><span data-nl="Partner" data-en="Partner">Partner</span></div>
          <div class="choice" onclick="selectChoice('q13_who', this, 'Familie')"><div class="choice-dot"></div><span data-nl="Familie" data-en="Family">Familie</span></div>
          <div class="choice" onclick="selectChoice('q13_who', this, 'Vrienden')"><div class="choice-dot"></div><span data-nl="Vrienden" data-en="Friends">Vrienden</span></div>
          <div class="choice" onclick="selectChoice('q13_who', this, 'Social media')"><div class="choice-dot"></div><span>Social media</span></div>
        </div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goBackFrom13()" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(14)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 14: PRIJS MENING -->
    <div class="screen" id="s14">
      <div class="screen-label" data-nl="Vraag 14 van 15" data-en="Question 14 of 15">Vraag 14 van 15</div>
      <h2 data-nl="Wat vind je van de prijs?" data-en="What do you think of the price?">Wat vind je van de prijs?</h2>
      <div class="choices" id="choices-14">
        <div class="choice" onclick="selectChoice('q14', this, 'Te duur')"><div class="choice-dot"></div><span data-nl="Te duur" data-en="Too expensive">Te duur</span></div>
        <div class="choice" onclick="selectChoice('q14', this, 'Aan de hoge kant')"><div class="choice-dot"></div><span data-nl="Aan de hoge kant" data-en="A bit high">Aan de hoge kant</span></div>
        <div class="choice" onclick="selectChoice('q14', this, 'Prima')"><div class="choice-dot"></div><span data-nl="Prima" data-en="Fine">Prima</span></div>
        <div class="choice" onclick="selectChoice('q14', this, 'Goedkoop')"><div class="choice-dot"></div><span data-nl="Goedkoop" data-en="Cheap">Goedkoop</span></div>
        <div class="choice" onclick="selectChoice('q14', this, 'Veel te goedkoop')"><div class="choice-dot"></div><span data-nl="Veel te goedkoop" data-en="Way too cheap">Veel te goedkoop</span></div>
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(13)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(15)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 15: TIPS -->
    <div class="screen" id="s15">
      <div class="screen-label" data-nl="Vraag 15 van 15" data-en="Question 15 of 15">Vraag 15 van 15</div>
      <h2 data-nl="Heb je nog tips of opmerkingen?" data-en="Any tips or comments?">Heb je nog tips of opmerkingen?</h2>
      <textarea id="q15" placeholder="" oninput="answers.q15_tips = this.value"></textarea>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(14)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn" onclick="goTo(16)" data-nl="Volgende →" data-en="Next →">Volgende →</button>
      </div>
    </div>

    <!-- SCREEN 16: CONTACT? -->
    <div class="screen" id="s16">
      <div class="screen-label" data-nl="Laatste stap" data-en="Last step">Laatste stap</div>
      <h2 data-nl="Mogen we contact opnemen?" data-en="Can we contact you?">Mogen we contact opnemen?</h2>
      <div class="choices" id="choices-16">
        <div class="choice" onclick="selectChoice('q16', this, 'Ja'); document.getElementById('email-field').classList.remove('hidden')"><div class="choice-dot"></div><span data-nl="Ja" data-en="Yes">Ja</span></div>
        <div class="choice" onclick="selectChoice('q16', this, 'Nee'); document.getElementById('email-field').classList.add('hidden')"><div class="choice-dot"></div><span data-nl="Nee" data-en="No">Nee</span></div>
      </div>
      <div class="hidden" id="email-field">
        <input type="email" id="contact-email" placeholder="jouw@email.com" oninput="answers.contact_email = this.value">
      </div>
      <div class="nav">
        <button class="btn btn-ghost" onclick="goTo(15)" data-nl="← Terug" data-en="← Back">← Terug</button>
        <button class="btn btn-gold" onclick="submitSurvey()" data-nl="Verstuur →" data-en="Submit →">Verstuur →</button>
      </div>
    </div>

    <!-- SCREEN BEDANKT -->
    <div class="screen" id="s-done">
      <div class="thank-you">
        <span class="emoji-big">🙏</span>
        <h2 data-nl="Thanks, écht!" data-en="Thanks, truly!">Thanks, écht!</h2>
        <p data-nl="Met jouw feedback maken we SongFactory beter voor iedereen. 💡 En grote kans dat je binnenkort nog iets vets van ons gaat zien 😉" data-en="Your feedback helps us make SongFactory better for everyone. 💡 Chances are you'll be seeing something cool from us soon 😉">
          Met jouw feedback maken we SongFactory beter voor iedereen. 💡 En grote kans dat je binnenkort nog iets vets van ons gaat zien 😉
        </p>
      </div>
    </div>

  </div>
</div>

<script>
const TOTAL_SCREENS = 15;
let currentScreen = 0;
let lang = 'nl';
let fanFlow = false;

const params = new URLSearchParams(window.location.search);
const orderId = params.get('order_id') || '';

const answers = {
  lang: 'nl',
  order_id: orderId,
  q1_voor_wie: '',
  q2_ontdekt: '',
  q3_taal: '',
  q4_gemak: 0,
  q5_snelheid: '',
  q6_aansluiting: 0,
  q7_stem: 0,
  q7_uitspraak: 0,
  q7_lyrics: 0,
  q7_muziek: 0,
  q8_cijfer: 7,
  q9_nps: 7,
  q10a_best: '',
  q10b_improve: '',
  q10b_missing: '',
  q11_cadeau: '',
  q12_prijs_bereid: '',
  q13_gedeeld: '',
  q13_who: '',
  q14_prijs_mening: '',
  q15_tips: '',
  q16_contact: '',
  contact_email: ''
};

function setLang(l) {
  lang = l;
  answers.lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.lang-btn[onclick="setLang(\\'' + l + '\\')"]').classList.add('active');
  document.querySelectorAll('[data-' + l + ']').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
    el.textContent = el.getAttribute('data-' + l);
  });
  const phMap = {
    nl: { q10a: 'Vertel het ons...', q10b: 'Vertel het ons...', q10b2: 'Wat gemist...', q15: 'Optioneel...' },
    en: { q10a: 'Tell us...', q10b: 'Tell us...', q10b2: 'What was missing...', q15: 'Optional...' }
  };
  Object.entries(phMap[l]).forEach(([id, ph]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = ph;
  });
  const emailEl = document.getElementById('contact-email');
  if (emailEl) emailEl.placeholder = l === 'nl' ? 'jouw@email.com' : 'your@email.com';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('s' + id);
  if (el) el.classList.add('active');
  currentScreen = id;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goTo(id) { showScreen(id); }

function updateProgress() {
  const steps = [0,1,2,3,4,5,6,7,8,9,'10a','10b','10b2',11,12,13,14,15,16,'done'];
  const idx = steps.indexOf(currentScreen);
  const pct = idx <= 0 ? 0 : Math.min(100, Math.round((idx / (steps.length - 1)) * 100));
  document.getElementById('progress').style.width = pct + '%';
}

function selectChoice(key, el, val) {
  const parent = el.closest('.choices');
  if (parent) parent.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  answers[key] = val;
}

function nextRequired(key, next) {
  if (!answers[key]) return;
  goTo(next);
}

function rateStar(key, val) {
  answers[key] = val;
  const stars = document.querySelectorAll('#stars-' + key + ' .star');
  stars.forEach((s, i) => s.classList.toggle('lit', i < val));
}

function rateMatrix(key, val) {
  answers['q7_' + key] = val;
  const stars = document.querySelectorAll('#matrix-' + key + ' .matrix-star');
  stars.forEach((s, i) => s.classList.toggle('lit', i < val));
}

function updateSlider(id) {
  const slider = document.getElementById('slider-' + id);
  document.getElementById('slider-val-' + id).textContent = slider.value;
  if (id === '8') answers.q8_cijfer = parseInt(slider.value);
  if (id === '9') answers.q9_nps = parseInt(slider.value);
}

function splitFlow() {
  answers.q8_cijfer = parseInt(document.getElementById('slider-8').value);
  goTo(9);
}

function npsFlow() {
  answers.q9_nps = parseInt(document.getElementById('slider-9').value);
  fanFlow = answers.q9_nps >= 8;
  goTo(fanFlow ? '10a' : '10b');
}

function goBackFrom13() {
  goTo(fanFlow ? 12 : '10b2');
}

async function submitSurvey() {
  answers.q8_cijfer = parseInt(document.getElementById('slider-8').value);
  answers.q9_nps = parseInt(document.getElementById('slider-9').value);
  goTo('done');
  sendEmail();
}

async function sendEmail() {
  try {
    await fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
  } catch(e) {
    console.error('Survey submit error', e);
  }
}

setLang('nl');
updateSlider('8');
updateSlider('9');
updateProgress();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
