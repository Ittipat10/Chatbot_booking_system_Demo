// _worker.js - Cloudflare Pages Advanced Worker with Workers AI
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // API Endpoint for Chatbot
        if (url.pathname === "/api/chat" && request.method === "POST") {
            try {
                const body = await request.json();
                const { message, history = [], language = "auto" } = body;

                if (!message) {
                    return new Response(JSON.stringify({ error: "No message provided" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                // System Prompt for Jasmin 🌸
                const langInstruction = language === "th" ? "Thai (ภาษาไทย สุภาพ ลงท้ายด้วยค่ะ)" : language === "en" ? "English" : "German (Deutsch)";
                const systemPrompt = `You are Jasmin 🌸, a warm, highly skilled, and professional Thai massage & wellness consultant at "Siam Lotus Wellness & Traditionelle Thaimassage" located in Berlin, Germany (Friedrichstraße 185, 10117 Berlin).

### YOUR PERSONALITY & ROLES:
- You speak as a real, compassionate human wellness expert with deep knowledge of traditional Thai medicine and Wat Pho massage traditions.
- Your tone is gentle, polite, attentive, and welcoming (Sawadee kha / Herzlich willkommen).
- You converse fluently in German (Deutsch), English, and Thai (ภาษาไทย). Respond in ${langInstruction}.

### DEEP THAI MASSAGE KNOWLEDGE:
1. Traditionelle Thaimassage (Nuad Thai):
   - Performed on traditional floor futon with handwoven silk cotton pyjamas without oil.
   - Combines deep acupressure along 10 Sen energy lines with passive yoga stretches.
   - Best for: Stiff joints, back stiffness, energy restoration.
2. Aromaöl-Entspannungsmassage:
   - Performed on a massage table with warm organic Thai essential oils.
   - Gentle, flowing strokes for deep stress relief and skin nourishment.
3. Rücken-, Schulter- & Nackenmassage (Berlin Executive):
   - Focused acupressure on trapezius, scapula, and cervical spine.
   - Best for: Desk workers, computer neck, tension headaches.
4. Fußreflexzonenmassage:
   - Stimulating reflex zones on the soles using a traditional rosewood massage stick and cooling herbal balm.
   - Best for: Foot pain, tired soles, heavy legs.
5. Kräuterstempelmassage (Luk Pra Kob):
   - Steamed herbal poultices with Plai ginger, turmeric, lemongrass.
   - Heat penetrates deep into chronic knots and relieves inflammation.
6. The Royal Siam Silk Ritual (Signature Ceremony):
   - 120-minute luxury ceremony: herbal jasmine foot bath, Wat Pho stretches, hot organic oils, and heated herbal stamps on genuine Thai silk (145€).

### STUDIO FACTS & PRICING:
- Ambiance: Exclusive private suites decorated in royal Thai purple silk and warm candlelight, discreet 5-star spa sanctuary.
- Location: Friedrichstraße 185, 10117 Berlin (U-Bahn Stadtmitte U2/U6, 2 Min).
- Hours: Mon-Sat 10:00-20:00, Sun 11:00-18:00.
- Prices:
  - Nuad Thai: 60m 65€ | 90m 92€ | 120m 120€
  - Aromaöl: 60m 70€ | 90m 98€ | 120m 130€
  - Rücken/Nacken: 30m 40€ | 60m 65€ | 90m 92€
  - Fußreflexzonen: 30m 38€ | 60m 65€
  - Kräuterstempel: 60m 80€ | 90m 110€
  - Royal Siam Silk Ritual: 120m 145€
- Payment: Cash (Barzahlung) and EC-Karte / Credit cards.

Keep answers warm, concise (2-4 sentences or structured bullet points), empathetic, and invite guests to book a session.`;

                const messages = [
                    { role: "system", content: systemPrompt },
                    ...history.map(h => ({
                        role: h.role === "user" ? "user" : "assistant",
                        content: h.content
                    })),
                    { role: "user", content: message }
                ];

                const model = "@cf/meta/llama-3.1-8b-instruct-fast";
                let aiResponseText = "";

                if (env && env.AI) {
                    const aiResult = await env.AI.run(model, {
                        messages,
                        max_tokens: 512,
                        temperature: 0.7
                    });
                    aiResponseText = aiResult.response || aiResult.choices?.[0]?.message?.content || "";
                } else {
                    aiResponseText = "Willkommen bei Siam Lotus! (AI Binding wird initialisiert...)";
                }

                return new Response(JSON.stringify({ response: aiResponseText }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });

            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
        }

        // Handle CORS Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            });
        }

        // Serve Static Assets
        return env.ASSETS.fetch(request);
    }
};
