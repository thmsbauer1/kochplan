/* rezept-foto – liest Fotos von Rezepten (Kochbuchseite, Zettel, Bildschirmfoto) oder von Zutaten
   und liefert ein Rezept für den Kochplan (3 Portionen, Zutaten mit Abteilung und ungefähren kcal).
   Aufruf nur für angemeldete Familienmitglieder (eigene Prüfung unten, deshalb verify_jwt = false).
   Der Anthropic-Schlüssel liegt als Secret ANTHROPIC_API_KEY in Supabase, nie im Code. */

const MODEL = "claude-sonnet-5-5";
const MAX_PER_DAY = 20;
const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 2_800_000; /* base64, etwa 2 MB je Bild */
const PORTIONEN = 3;

const UNITS = ["g", "ml", "Stk", "EL", "TL", "Bund", "Dose", "Pck", "Zehe", "Prise", "Becher", "Glas", "Scheiben", "Handvoll", ""];
const DEPTS = ["obst", "brot", "kuehl", "fleisch", "trocken", "gewuerz", "tk", "vorrat"];
const MEDIA = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM = `Du hilfst einer Familie (zwei Erwachsene, ein zehnjähriges Kind) in Deutschland, Rezepte in ihre Kochplan-App zu übernehmen.
Du bekommst ein oder mehrere Fotos. Sie zeigen entweder
(a) ein Rezept: Kochbuchseite, Zeitschrift, handgeschriebener Zettel, Bildschirmfoto, Verpackung – auch über mehrere Fotos verteilt (z. B. Zutaten auf einem Foto, Zubereitung auf dem nächsten), oder
(b) Lebensmittel bzw. Zutaten (Kühlschrank, Einkauf auf dem Tisch).
Antworte ausschließlich im vorgegebenen JSON-Format.

Bei (a) – art "abgeschrieben":
- Übernimm das Rezept getreu: Name, Zutaten mit Mengen, Schritte. Nichts erfinden, nichts weglassen.
- "portionen" ist die Portionenzahl, für die die Mengen im Rezept gelten (steht meist dabei; wenn nicht, schätze sie aus den Mengen). Rechne die Mengen NICHT um, das macht die App.
- Was unlesbar oder abgeschnitten ist, ergänzt du sinnvoll und nennst es im "hinweis".
- Ist das Gericht für ein leichtes Abendessen eher schwer, darf der "hinweis" EINEN kurzen Tipp zum leichter Machen enthalten. Das Rezept selbst bleibt unverändert.

Bei (b) – art "vorgeschlagen":
- Schlage EIN leichtes, gesundes Abendessen vor, das vor allem die sichtbaren Zutaten nutzt (Zubereitung unter der Woche höchstens 40 Minuten). Übliche Vorräte (Öl, Salz, Gewürze, Zwiebeln, Knoblauch) darfst du ergänzen.
- "portionen" ist dann ${PORTIONEN}.
- Nenne im "hinweis", welche Zutaten du auf den Fotos erkannt hast.

Wenn auf den Fotos weder ein Rezept noch Lebensmittel zu sehen sind: art "unklar", leere Listen, Erklärung im "hinweis".

Zutaten:
- Deutsche Namen, so wie man sie auf einen Einkaufszettel schreibt. Wenn eine Zutat einem Namen aus der Liste "bekannte Zutaten" entspricht, verwende genau diesen Namen.
- "menge" als Zahl (Brüche umrechnen: ½ → 0.5). Ohne Mengenangabe ("Salz, Pfeffer", "etwas Öl") → menge 0 und einheit "".
- "einheit" nur aus der vorgegebenen Liste; kg → g, l → ml, Knoblauchzehe → Zehe, Stück → Stk, Esslöffel → EL, Teelöffel → TL. Tassen/Cups in g oder ml umrechnen.
- "abteilung" im Supermarkt: obst (Obst, Gemüse, frische Kräuter, Kartoffeln, Zwiebeln, Knoblauch), brot (Brot, Brötchen, Tortillas), kuehl (Milchprodukte, Käse, Eier, Tofu, frische Pasta/Gnocchi), fleisch (Fleisch, Fisch, Garnelen frisch), trocken (Nudeln, Reis, Hülsenfrüchte, Konserven, Nüsse, Kokosmilch), gewuerz (Gewürze, Currypaste, Soßen außer Sojasauce), tk (Tiefkühlware), vorrat (Salz, Pfeffer, Öl, Essig, Mehl, Zucker, Honig, Senf, Brühe, Sojasauce, Paprikapulver, Currypulver).
- "kcal100": ungefähre kcal je 100 g der Zutat (roh bzw. wie gekauft, Dosenware abgetropft).
- "g_einheit": ungefähres Gewicht in Gramm für eine Einheit, wenn die Einheit nicht g oder ml ist (1 Stk Zucchini ≈ 250, 1 Dose Kichererbsen ≈ 240 abgetropft, 1 EL Öl ≈ 10, 1 Bund Petersilie ≈ 30), sonst 0.

Weitere Felder:
- "c": veg (ohne Fleisch und Fisch), fisch (Fisch und Meeresfrüchte), gefluegel (Geflügel). Bei Rind, Schwein oder Lamm nimm gefluegel und schreibe in den "hinweis", dass die Kategorie geprüft werden sollte.
- "e": ein passendes Essens-Emoji.
- "min": Zeit am Kochabend in Minuten (ohne das, was am Sonntag vorbereitet werden kann).
- "box": true, wenn es sich am nächsten Tag kalt oder aufgewärmt gut als Mittagsbox eignet.
- "k": true, wenn Kinder es erfahrungsgemäß gern essen.
- "s": Zubereitungsschritte, kurz und klar, höchstens 8.
- "p": was sich am Sonntag vorbereiten lässt (z. B. Reis vorkochen, Gemüse schneiden, Soße ansetzen), mit Minuten und wie viele Tage es im Kühlschrank hält. Leer, wenn nichts sinnvoll ist.
- "ph": eine kleine, sichere Aufgabe für das zehnjährige Kind beim Kochen (kein scharfes Messer am Herd, kein heißes Fett).`;

const SCHEMA = {
  type: "object",
  properties: {
    art: { type: "string", enum: ["abgeschrieben", "vorgeschlagen", "unklar"] },
    n: { type: "string" },
    e: { type: "string" },
    c: { type: "string", enum: ["veg", "fisch", "gefluegel"] },
    portionen: { type: "integer" },
    min: { type: "integer" },
    box: { type: "boolean" },
    k: { type: "boolean" },
    z: {
      type: "array",
      items: {
        type: "object",
        properties: {
          menge: { type: "number" },
          einheit: { type: "string", enum: UNITS },
          name: { type: "string" },
          abteilung: { type: "string", enum: DEPTS },
          kcal100: { type: "number" },
          g_einheit: { type: "number" },
        },
        required: ["menge", "einheit", "name", "abteilung", "kcal100", "g_einheit"],
        additionalProperties: false,
      },
    },
    s: { type: "array", items: { type: "string" } },
    p: {
      type: "array",
      items: {
        type: "object",
        properties: { text: { type: "string" }, minuten: { type: "integer" }, haelt_tage: { type: "integer" } },
        required: ["text", "minuten", "haelt_tage"],
        additionalProperties: false,
      },
    },
    ph: { type: "string" },
    hinweis: { type: "string" },
  },
  required: ["art", "n", "e", "c", "portionen", "min", "box", "k", "z", "s", "p", "ph", "hinweis"],
  additionalProperties: false,
};

type Z = { menge: number; einheit: string; name: string; abteilung: string; kcal100: number; g_einheit: number };

/* Mengen auf 3 Portionen umrechnen und einkaufstauglich runden */
function scale(q: number, unit: string, f: number): number {
  const v = q * f;
  if (unit === "g" || unit === "ml") return v >= 20 ? Math.round(v / 5) * 5 : Math.max(1, Math.round(v));
  if (["Zehe", "Dose", "Pck", "Becher", "Glas", "Scheiben"].includes(unit)) return Math.max(1, Math.ceil(v - 0.2));
  return Math.max(0.5, Math.round(v * 2) / 2);
}
const fmt = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");
const keyOf = (n: string) => n.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Nur POST" }, 405);

  const SB = Deno.env.get("SUPABASE_URL")!;
  const auth = req.headers.get("authorization") || "";
  const apikey = req.headers.get("apikey") || "";
  if (!auth.startsWith("Bearer ") || !apikey) return json({ error: "Bitte zuerst anmelden." }, 401);
  const H = { apikey, Authorization: auth, "Content-Type": "application/json" };

  /* 1. Nur angemeldete Familienmitglieder */
  const u = await fetch(`${SB}/auth/v1/user`, { headers: H });
  if (!u.ok) return json({ error: "Anmeldung abgelaufen. Bitte neu anmelden." }, 401);
  const user = await u.json();
  const mr = await fetch(`${SB}/rest/v1/members?select=id&user_id=eq.${user.id}`, { headers: H });
  const members = mr.ok ? await mr.json() : [];
  if (!members.length) return json({ error: "Dieses Konto gehört zu keiner Familie." }, 403);
  const memberId = members[0].id;

  /* 2. Eingabe prüfen */
  let body: { bilder?: unknown; bekannt?: unknown; notiz?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Ungültige Anfrage" }, 400); }
  const bilder = (Array.isArray(body.bilder) ? body.bilder : [])
    .map((b: { typ?: unknown; daten?: unknown }) => ({ typ: String(b?.typ || ""), daten: String(b?.daten || "") }))
    .filter((b) => MEDIA.includes(b.typ) && b.daten.length > 100 && b.daten.length <= MAX_IMAGE_CHARS && /^[A-Za-z0-9+/=]+$/.test(b.daten.slice(0, 200)));
  if (!bilder.length) return json({ error: "Kein lesbares Foto dabei." }, 400);
  if (bilder.length > MAX_IMAGES) return json({ error: `Höchstens ${MAX_IMAGES} Fotos auf einmal.` }, 400);
  const bekannt = (Array.isArray(body.bekannt) ? body.bekannt : []).map(String).filter((s) => s.length < 60).slice(0, 400);
  const notiz = String(body.notiz || "").slice(0, 300);

  /* 3. Tageslimit (schützt das Guthaben) */
  const start = new Date(); start.setUTCHours(0, 0, 0, 0);
  const lr = await fetch(`${SB}/rest/v1/activity_log?select=id&member_id=eq.${memberId}&kind=eq.rezept-foto&occurred_at=gte.${start.toISOString()}`, { headers: H });
  const used = lr.ok ? (await lr.json()).length : 0;
  if (used >= MAX_PER_DAY) return json({ error: "Für heute sind genug Fotos gelesen. Morgen geht's weiter!" }, 429);
  await fetch(`${SB}/rest/v1/activity_log`, {
    method: "POST", headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({ member_id: memberId, app: "kochplan", kind: "rezept-foto", value: { fotos: bilder.length } }),
  });

  /* 4. KI fragen */
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "Das Foto-Lesen ist noch nicht eingerichtet." }, 500);
  const content = [
    ...bilder.map((b) => ({ type: "image", source: { type: "base64", media_type: b.typ, data: b.daten } })),
    { type: "text", text: `${notiz ? `Notiz der Familie: ${notiz}\n\n` : ""}Bekannte Zutaten (diese Namen bevorzugen): ${bekannt.join(", ")}` },
  ];
  const ar = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 4000, system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content }],
    }),
  });
  if (!ar.ok) {
    console.error("anthropic", ar.status, await ar.text());
    return json({ error: ar.status === 401 ? "Der KI-Schlüssel ist abgelaufen oder ungültig." : ar.status === 400 ? "Das Foto-Lesen geht gerade nicht (Guthaben oder Foto zu groß?)." : "Das Foto-Lesen geht gerade nicht." }, 502);
  }
  const data = await ar.json();
  let out: Record<string, unknown>;
  try {
    out = JSON.parse((data.content || []).find((c: { type: string }) => c.type === "text")?.text || "{}");
  } catch (e) {
    console.error("parse", data.stop_reason, String(e));
    return json({ error: "Das Foto-Lesen geht gerade nicht." }, 502);
  }
  if (out.art === "unklar") return json({ art: "unklar", hinweis: String(out.hinweis || "Auf den Fotos war kein Rezept zu erkennen.") });

  /* 5. Auf 3 Portionen umrechnen, Zeilen fürs Formular bauen */
  const orig = Math.max(1, Math.min(20, Number(out.portionen) || PORTIONEN));
  const f = PORTIONEN / orig;
  const zl: string[] = [], abt: Record<string, string> = {}, nw: Record<string, { k: number; st?: number; el?: number }> = {};
  for (const z of (Array.isArray(out.z) ? out.z : []) as Z[]) {
    const name = String(z?.name || "").trim().slice(0, 60);
    if (!name) continue;
    const unit = UNITS.includes(z.einheit) ? z.einheit : "";
    const q = Number(z.menge) > 0 ? scale(Number(z.menge), unit || "Stk", f) : 0;
    zl.push(q ? `${fmt(q)} ${unit || "Stk"} ${name}` : name);
    const k = keyOf(name);
    if (DEPTS.includes(z.abteilung)) abt[k] = z.abteilung;
    const kc = Number(z.kcal100);
    if (kc >= 0 && kc <= 900) {
      const g = Number(z.g_einheit) > 0 && Number(z.g_einheit) < 3000 ? Math.round(Number(z.g_einheit)) : 0;
      nw[k] = { k: Math.round(kc), ...(g ? (unit === "EL" || unit === "TL" ? { el: unit === "TL" ? g * 3 : g } : { st: g }) : {}) };
    }
  }
  const p = (Array.isArray(out.p) ? out.p : []).slice(0, 6).map((x: { text?: string; minuten?: number; haelt_tage?: number }) => [
    null, String(x?.text || "").slice(0, 140), Math.max(1, Math.min(120, Number(x?.minuten) || 10)), Math.max(1, Math.min(7, Number(x?.haelt_tage) || 3)),
  ]).filter((x) => x[1]);

  return json({
    art: out.art,
    rezept: {
      n: String(out.n || "").slice(0, 80), e: String(out.e || "🍲").slice(0, 8),
      c: ["veg", "fisch", "gefluegel"].includes(String(out.c)) ? out.c : "veg",
      min: Math.max(5, Math.min(240, Number(out.min) || 30)), box: !!out.box, k: !!out.k,
      z: zl, s: (Array.isArray(out.s) ? out.s : []).map(String).slice(0, 10), p, ph: String(out.ph || "").slice(0, 140),
    },
    abt, nw, portionen_original: orig,
    hinweis: String(out.hinweis || "").slice(0, 500),
    left: MAX_PER_DAY - used - 1,
  });
});
