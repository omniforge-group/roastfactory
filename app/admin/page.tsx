import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Order = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  recipient_name: string | null;
  occasion: string | null;
  style: string | null;
  language: string | null;
  mood: string | null;
  voice_preference: string | null;
  tempo: string | null;
  payment_status: string | null;
  generation_status: string | null;
  generated_audio_url: string | null;
  generated_lyrics: string | null;
  delivered_at: string | null;
  provider: string | null;
  song_request: string | null;
  lyrics_prompt: string | null;
  style_prompt: string | null;
  generated_prompt: string | null;
  extra_notes: string | null;
  story: string | null;
};

async function updateOrder(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const generationStatus = String(formData.get("generation_status") || "ready");
  const generatedAudioUrl = String(formData.get("generated_audio_url") || "").trim();
  const generatedLyrics = String(formData.get("generated_lyrics") || "").trim();
  const provider = String(formData.get("provider") || "").trim();
  const delivered = formData.get("mark_delivered") === "on";

  if (!id) {
    return;
  }

  const updatePayload = {
    generation_status: generationStatus,
    generated_audio_url: generatedAudioUrl || null,
    generated_lyrics: generatedLyrics || null,
    provider: provider || null,
    delivered_at: delivered ? new Date().toISOString() : null,
  };

  const { error } = await supabaseAdmin
    .from("orders")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("Admin update failed:", error);
  }

  revalidatePath("/admin");
}

async function AdminPage() {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
        id,
        created_at,
        customer_name,
        customer_email,
        recipient_name,
        occasion,
        style,
        language,
        mood,
        voice_preference,
        tempo,
        payment_status,
        generation_status,
        generated_audio_url,
        generated_lyrics,
        delivered_at,
        provider,
        song_request,
        lyrics_prompt,
        style_prompt,
        generated_prompt,
        extra_notes,
        story
      `
    )
    .order("created_at", { ascending: false });

  const safeOrders: Order[] = orders ?? [];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">RoastFactory</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Admin dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Hier beheer je betaalde orders, prompts, lyrics en audiolinks. Gebruik dit als
              jouw snelle MVP-backoffice.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
            <div>Totaal orders: <span className="font-semibold text-white">{safeOrders.length}</span></div>
            <div>Betaald: <span className="font-semibold text-white">{safeOrders.filter((o) => o.payment_status === "paid").length}</span></div>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            Fout bij ophalen van orders.
          </div>
        ) : null}

        <div className="space-y-6">
          {safeOrders.map((order) => (
            <section
              key={order.id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20"
            >
              <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {order.recipient_name || "Onbekende ontvanger"}
                  </h2>
                  <p className="mt-2 text-sm text-white/65">
                    Order ID: <span className="font-mono text-white/90">{order.id}</span>
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    Aangemaakt: {new Date(order.created_at).toLocaleString("nl-NL")}
                  </p>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[320px]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white/45">Betaling</div>
                    <div className="mt-1 font-semibold text-white">{order.payment_status || "-"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white/45">Generatie</div>
                    <div className="mt-1 font-semibold text-white">{order.generation_status || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoCard label="Klant" value={order.customer_name} />
                    <InfoCard label="E-mail" value={order.customer_email} />
                    <InfoCard label="Ontvanger" value={order.recipient_name} />
                    <InfoCard label="Gelegenheid" value={order.occasion} />
                    <InfoCard label="Stijl" value={order.style} />
                    <InfoCard label="Taal" value={order.language} />
                    <InfoCard label="Mood" value={order.mood} />
                    <InfoCard label="Stem" value={order.voice_preference} />
                    <InfoCard label="Tempo" value={order.tempo} />
                    <InfoCard label="Provider" value={order.provider} />
                  </div>

                  <TextBlock title="Verhaal / input" content={order.story} />
                  <TextBlock title="Extra opmerkingen" content={order.extra_notes} />
                  <TextBlock title="Song request" content={order.song_request} />
                  <TextBlock title="Lyrics prompt" content={order.lyrics_prompt} />
                  <TextBlock title="Style prompt" content={order.style_prompt} />
                  <TextBlock title="Master prompt" content={order.generated_prompt} />
                </div>

                <div>
                  <form action={updateOrder} className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <input type="hidden" name="id" value={order.id} />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Generatie status
                      </label>
                      <select
                        name="generation_status"
                        defaultValue={order.generation_status || "ready"}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
                      >
                        <option value="ready">ready</option>
                        <option value="processing">processing</option>
                        <option value="completed">completed</option>
                        <option value="failed">failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Audio URL
                      </label>
                      <textarea
                        name="generated_audio_url"
                        defaultValue={order.generated_audio_url || ""}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
                        placeholder="Plak hier de link naar song 1 of een pagina met beide songs"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Lyrics
                      </label>
                      <textarea
                        name="generated_lyrics"
                        defaultValue={order.generated_lyrics || ""}
                        rows={8}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
                        placeholder="Plak hier de definitieve lyrics"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Provider
                      </label>
                      <input
                        name="provider"
                        defaultValue={order.provider || ""}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
                        placeholder="Bijv. Suno"
                      />
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                      <input
                        type="checkbox"
                        name="mark_delivered"
                        defaultChecked={Boolean(order.delivered_at)}
                        className="h-4 w-4"
                      />
                      Markeer als geleverd
                    </label>

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-neutral-950 transition hover:opacity-90"
                    >
                      Order opslaan
                    </button>

                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                      <div>Geleverd op: {order.delivered_at ? new Date(order.delivered_at).toLocaleString("nl-NL") : "Nog niet"}</div>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          ))}

          {!safeOrders.length && !error ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/65">
              Er zijn nog geen orders.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value || "-"}</div>
    </div>
  );
}

function TextBlock({ title, content }: { title: string; content: string | null }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">{title}</h3>
      <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white/85 font-sans">
        {content || "-"}
      </pre>
    </div>
  );
}

export default AdminPage;
