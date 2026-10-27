declare const Supabase: any;

const TAGS = [
    "music",
    "art",
    "travel",
    "food",
    "sports",
    "tech",
    "fashion",
    "nature",
    "gaming",
    "fitness",
    "memes",
    "education",
];
const GROQ_MODEL = "qwen/qwen3.8-27b";
const GEMINI_MODEL = "gemini-3.8-flash";

const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
        status: s,
        headers: { "Content-Type": "application/json" },
    });

const buildPrompt = (text: string) =>
    `Write a short, engaging social media caption (max 20 words) for this post and pick 1-3 tags from: ${TAGS.join(", ")}. Existing text: "${text}". Reply only with JSON: {"caption": string, "tags": string[]}`;

const parseJson = (raw: string) =>
    JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());

const captionWithGroq = async (
    text: string,
    imageBase64: string | undefined,
    mimeType: string,
) => {
    const content: any[] = [{ type: "text", text: buildPrompt(text) }];
    if (imageBase64)
        content.push({
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
        });
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content }],
            response_format: { type: "json_object" },
            reasoning_effort: "none",
        }),
    });
    const d = await r.json();
    const raw = d.choices?.[0]?.message?.content;
    if (!r.ok || !raw)
        throw new Error(
            `Groq ${r.status}: ${d.error?.message ?? "no content"}`,
        );
    return parseJson(raw);
};

const captionWithGemini = async (
    text: string,
    imageBase64: string | undefined,
    mimeType: string,
) => {
    const parts: any[] = [{ text: buildPrompt(text) }];
    if (imageBase64)
        parts.push({ inline_data: { mime_type: mimeType, data: imageBase64 } });
    const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": Deno.env.get("GEMINI_API_KEY")!,
            },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { responseMimeType: "application/json" },
            }),
        },
    );
    const d = await r.json();
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!r.ok || !raw)
        throw new Error(
            `Gemini ${r.status}: ${d.error?.message ?? "no content"}`,
        );
    return parseJson(raw);
};

const isSignedIn = async (req: Request) => {
    const auth = req.headers.get("Authorization");
    if (!auth) return false;
    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
        headers: {
            Authorization: auth,
            apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        },
    });
    return r.ok;
};

Deno.serve(async (req) => {
    if (!(await isSignedIn(req))) return json({ error: "unauthorized" }, 401);

    const {
        action,
        text = "",
        imageBase64,
        mimeType = "image/jpeg",
    } = await req.json();

    if (action === "moderate") {
        const input: any[] = [];
        if (text) input.push({ type: "text", text });
        if (imageBase64)
            input.push({
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            });
        if (!input.length) return json({ allowed: true });
        const r = await fetch("https://api.openai.com/v1/moderations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
            },
            body: JSON.stringify({ model: "omni-moderation-latest", input }),
        });
        const d = await r.json();
        const flagged = (d.results ?? []).some((x: any) => x.flagged);
        return json({ allowed: !flagged });
    }

    if (action === "analyze") {
        let out: any;
        let provider = "groq";
        try {
            out = await captionWithGroq(text, imageBase64, mimeType);
        } catch (groqError) {
            console.error(
                "Groq failed, falling back to Gemini:",
                String(groqError),
            );
            provider = "gemini";
            try {
                out = await captionWithGemini(text, imageBase64, mimeType);
            } catch (geminiError) {
                console.error("Gemini failed:", String(geminiError));
                return json({ error: `${groqError}; ${geminiError}` }, 502);
            }
        }
        return json({
            caption: out.caption ?? "",
            tags: (out.tags ?? []).filter((t: string) => TAGS.includes(t)),
            provider,
        });
    }

    if (action === "embed") {
        const session = new Supabase.ai.Session("gte-small");
        const embedding = await session.run(text, {
            mean_pool: true,
            normalize: true,
        });
        return json({ embedding });
    }

    return json({ error: "unknown action" }, 400);
});
