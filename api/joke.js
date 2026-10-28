const MAX_TOPIC = 100;
const OPENAI_URL = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 25000;

const INSTRUCTIONS =
  "אתה כותב בדיחות קצרות בעברית. כתוב בדיחה אחת בלבד, עד ארבעה משפטים, נקייה ומתאימה לכל גיל. בלי הקדמה, בלי הסבר ובלי אימוג׳י. רק הבדיחה.";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

// הודעה קצרה בעברית לדף, לפי הסטטוס והקוד של OpenAI
function errorMessage(status, code) {
  if (status === 401) return "המפתח של השרת לא תקין.";
  if (code === "insufficient_quota") return "נגמר הקרדיט לבדיחות. נסו מאוחר יותר.";
  if (code === "billing_hard_limit_reached") return "הגענו למגבלת ההוצאה החודשית.";
  if (status === 429) return "יותר מדי בקשות. חכו רגע ונסו שוב.";
  if (status === 404 || code === "model_not_found") return "המודל לא נמצא בשרת.";
  return "הבדיחה לא הגיעה. נסו שוב.";
}

// output_text קיים רק לפעמים. אחרת אוספים את הטקסט מפריטי message
function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = [];
  for (const item of data?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        parts.push(part.text);
      }
    }
  }
  return parts.join("").trim();
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "אפשר לשלוח רק POST" }, 405);
    }

    let topic = "";
    try {
      const body = await request.json();
      if (typeof body?.topic === "string") {
        topic = body.topic.trim().slice(0, MAX_TOPIC);
      }
    } catch {
      topic = "";
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");
      return json({ error: "השרת לא מוגדר כרגע." }, 500);
    }

    const model = process.env.OPENAI_MODEL || "gpt-5";
    const input = topic
      ? `נושא הבדיחה: ${topic}`
      : "אין נושא. ספר בדיחה כללית על החיים.";

    console.log(`joke request: topic="${topic}", model=${model}`);

    let response;
    try {
      response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          instructions: INSTRUCTIONS,
          input,
          reasoning: { effort: "low" },
          max_output_tokens: 2000,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      console.error("OpenAI request failed:", err?.name, err?.message);
      return json({ error: "אין חיבור לשירות הבדיחות. נסו שוב." }, 502);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const code = data?.error?.code ?? data?.error?.type ?? "unknown";
      console.error(`OpenAI error: status=${response.status}, code=${code}, message=${data?.error?.message}`);
      return json({ error: errorMessage(response.status, code) }, 502);
    }

    const joke = extractText(data);
    if (!joke) {
      console.error(`OpenAI empty answer: status=${data?.status}, incomplete=${JSON.stringify(data?.incomplete_details)}`);
      return json({ error: "הבדיחה לא הגיעה. נסו שוב." }, 502);
    }

    return json({ joke });
  },
};
