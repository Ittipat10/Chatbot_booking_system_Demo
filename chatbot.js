// chatbot.js - Interactive Wellness & Booking Assistant "Jasmin 🌸"
// Trilingual: German (DE), English (EN), Thai (TH)
// Robust client-side engine with Cloudflare Workers AI integration

(function () {
    "use strict";

    // Safe LocalStorage
    function getSafeStorage(key, fallback) {
        try {
            return localStorage.getItem(key) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    function setSafeStorage(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) {}
    }

    // App State
    const state = {
        lang: "de", // "de", "en", "th"
        chatHistory: [],
        cfConfig: {
            accountId: getSafeStorage("cf_account_id", ""),
            apiToken: getSafeStorage("cf_api_token", ""),
            model: getSafeStorage("cf_model", "@cf/qwen/qwen2.5-7b-instruct"),
            geminiKey: getSafeStorage("gemini_api_key", "")
        }
    };

    // Booking Session Data
    const bookingSession = {
        step: "welcome",
        service: null,
        duration: null,
        price: null,
        date: null,
        time: null,
        pressure: "Normal / Ausgewogen",
        customerName: "",
        customerPhone: "",
        customerEmail: ""
    };

    // UI Texts & Translations
    const I18N = {
        de: {
            botName: "Jasmin 🌸",
            botRole: "Wellness- & Terminberaterin",
            statusOnline: "Online • Antwortet sofort",
            inputPlaceholder: "Frage zur Massage stellen oder Termin anfragen...",
            typing: "Jasmin tippt...",
            welcomeTitle: "Sawadee kha! 🙏 Willkommen bei <strong>Siam Lotus</strong> Berlin.",
            welcomeDesc: "Ich bin <strong>Jasmin</strong> 🌸, Ihre persönliche Wellness- und Massageberaterin. Ich berate Sie gerne zu unseren traditionellen Heilbehandlungen oder helfe Ihnen bei der Online-Terminbuchung.",
            quickBooking: "📅 Termin buchen",
            quickServices: "✨ Massagen & Preise",
            quickOfficePain: "💆‍♂️ Büro- & Nackenschmerzen",
            quickDiff: "❓ Unterschied Nuad Thai & Öl",
            btnBookService: "Wählen",
            durationTip: "Tipp: 90 Minuten ermöglichen eine tiefgehende Ganzkörperentspannung.",
            dateQuestion: "An welchem Tag möchten Sie uns besuchen?",
            timeQuestion: "Wählen Sie Ihre bevorzugte Uhrzeit:",
            pressureQuestion: "Bevorzugte Massageintensität:",
            pressureSoft: "🌿 Sanft & Entspannend",
            pressureMedium: "⚖️ Normal / Ausgewogen",
            pressureStrong: "💪 Intensiv & Kräftig (Traditionell)",
            bookingConfirmed: "✓ Reservierung bestätigt",
            printBtn: "🖨️ Drucken / PDF",
            anotherBooking: "🔄 Weiteren Termin buchen"
        },
        en: {
            botName: "Jasmin 🌸",
            botRole: "Wellness & Booking Consultant",
            statusOnline: "Online • Replies instantly",
            inputPlaceholder: "Ask about Thai massage or book an appointment...",
            typing: "Jasmin is typing...",
            welcomeTitle: "Sawadee kha! 🙏 Welcome to <strong>Siam Lotus</strong> Berlin.",
            welcomeDesc: "I am <strong>Jasmin</strong> 🌸, your wellness advisor. I'm here to recommend the best traditional treatments for your body, answer questions, or book an appointment.",
            quickBooking: "📅 Book Appointment",
            quickServices: "✨ Treatments & Prices",
            quickOfficePain: "💆‍♂️ Office Neck & Back Relief",
            quickDiff: "❓ Nuad Thai vs Oil Massage",
            btnBookService: "Select",
            durationTip: "Recommendation: 90 minutes provides complete full-body restoration.",
            dateQuestion: "Which day would you prefer for your visit?",
            timeQuestion: "Please choose your preferred time slot:",
            pressureQuestion: "Preferred massage intensity:",
            pressureSoft: "🌿 Gentle & Relaxing",
            pressureMedium: "⚖️ Balanced / Medium",
            pressureStrong: "💪 Deep & Firm (Traditional)",
            bookingConfirmed: "✓ Booking Confirmed",
            printBtn: "🖨️ Print / Save PDF",
            anotherBooking: "🔄 Book another treatment"
        },
        th: {
            botName: "Jasmin (จัสมิน) 🌸",
            botRole: "ที่ปรึกษาการนวดและจองคิวออนไลน์",
            statusOnline: "ออนไลน์ • ตอบกลับทันที",
            inputPlaceholder: "พิมพ์สอบถามเรื่องนวดไทย หรือจองคิวได้เลยค่ะ...",
            typing: "จัสมินกำลังพิมพ์...",
            welcomeTitle: "สวัสดีค่ะ! 🙏 ยินดีต้อนรับสู่ <strong>สยาม โลตัส เบอร์ลิน</strong> ค่ะ",
            welcomeDesc: "ดิฉันชื่อ <strong>จัสมิน (Jasmin)</strong> 🌸 ยินดีให้คำแนะนำเกี่ยวกับศาสตร์การนวดแผนไทยโบราณ แนะนำคอร์สแก้อาการเมื่อยล้า และช่วยจองคิวนัดหมายออนไลน์ได้ตลอด 24 ชม. ค่ะ",
            quickBooking: "📅 จองคิวนัดหมาย",
            quickServices: "✨ ดูเมนูบริการ & ราคา",
            quickOfficePain: "💆‍♂️ ปวดคอบ่าไหล่ ออฟฟิศซินโดรม",
            quickDiff: "❓ นวดไทย vs นวดน้ำมัน ต่างกันอย่างไร",
            btnBookService: "เลือกบริการนี้",
            durationTip: "แนะนำ: 90 นาทีเพื่อการคลายกล้ามเนื้อทั่วทั้งตัวอย่างมีประสิทธิภาพสูงสุดค่ะ",
            dateQuestion: "สะดวกเข้ามารับบริการวันไหนดีคะ?",
            timeQuestion: "เลือกรอบเวลาที่สะดวกได้เลยค่ะ:",
            pressureQuestion: "ระดับน้ำหนักการนวดที่ชอบ:",
            pressureSoft: "🌿 นุ่มนวล เบาสบาย ผ่อนคลาย",
            pressureMedium: "⚖️ ปานกลาง พอดีๆ กำลังสบาย",
            pressureStrong: "💪 หนักแน่น เน้นรีดเส้น (สไตล์ดั้งเดิม)",
            bookingConfirmed: "✓ ยืนยันการจองคิวเรียบร้อย",
            printBtn: "🖨️ พิมพ์ / บันทึก PDF",
            anotherBooking: "🔄 จองคิวเพิ่มอีกรายการ"
        }
    };

    // DOM Elements cache
    let chatWidget, chatToggleBtn, chatCloseBtn, chatResetBtn, chatSettingsBtn;
    let chatMessages, chatInput, chatSendBtn, chatBadge, settingsModal;

    // Guaranteed Init
    function init() {
        cacheDOMElements();
        setupEventListeners();
        renderInitialGreeting();

        // Automatically open the chat window on start so it's ready immediately
        setTimeout(() => {
            if (chatWidget) {
                openChat();
            }
        }, 400);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function cacheDOMElements() {
        chatWidget = document.getElementById("chat-widget");
        chatToggleBtn = document.getElementById("chat-toggle-btn");
        chatCloseBtn = document.getElementById("chat-close-btn");
        chatResetBtn = document.getElementById("chat-reset-btn");
        chatSettingsBtn = document.getElementById("chat-settings-btn");
        chatMessages = document.getElementById("chat-messages");
        chatInput = document.getElementById("chat-input");
        chatSendBtn = document.getElementById("chat-send-btn");
        chatBadge = document.getElementById("chat-notification-badge");
        settingsModal = document.getElementById("cf-settings-modal");
    }

    function setupEventListeners() {
        if (chatToggleBtn) {
            chatToggleBtn.onclick = toggleChat;
        }
        if (chatCloseBtn) {
            chatCloseBtn.onclick = closeChat;
        }
        if (chatResetBtn) {
            chatResetBtn.onclick = resetChat;
        }
        if (chatSettingsBtn) {
            chatSettingsBtn.onclick = openSettingsModal;
        }

        if (chatSendBtn) {
            chatSendBtn.onclick = handleUserMessageSubmit;
        }
        if (chatInput) {
            chatInput.onkeydown = function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUserMessageSubmit();
                }
            };
        }

        // Connect all page booking buttons
        document.querySelectorAll("[data-book-service]").forEach(btn => {
            btn.onclick = function (e) {
                const sId = e.currentTarget.getAttribute("data-book-service");
                window.openBookingForService(sId);
            };
        });
    }

    function toggleChat() {
        if (!chatWidget) return;
        if (chatWidget.classList.contains("hidden")) {
            openChat();
        } else {
            closeChat();
        }
    }

    function openChat() {
        if (!chatWidget) return;
        chatWidget.classList.remove("hidden");
        chatWidget.classList.add("flex");
        if (chatBadge) chatBadge.classList.add("hidden");
        if (chatInput) chatInput.focus();
        scrollToBottom();
    }

    function closeChat() {
        if (!chatWidget) return;
        chatWidget.classList.add("hidden");
        chatWidget.classList.remove("flex");
    }

    function resetChat() {
        bookingSession.step = "welcome";
        bookingSession.service = null;
        bookingSession.duration = null;
        bookingSession.price = null;
        bookingSession.date = null;
        bookingSession.time = null;
        bookingSession.customerName = "";
        bookingSession.customerPhone = "";
        bookingSession.customerEmail = "";
        state.chatHistory = [];
        if (chatMessages) chatMessages.innerHTML = "";
        renderInitialGreeting();
    }

    // Language switcher
    window.setChatLanguage = function (lang) {
        if (["de", "en", "th"].includes(lang)) {
            state.lang = lang;
            appendUserMessage(lang === "th" ? "เปลี่ยนเป็นภาษาไทย 🇹🇭" : lang === "en" ? "Switched to English 🇬🇧" : "Sprache auf Deutsch 🇩🇪");
            showTyping(() => {
                const t = I18N[state.lang];
                appendBotMessage(
                    `<strong>${t.welcomeTitle}</strong><br><br>${t.welcomeDesc}`,
                    getWelcomeQuickReplies()
                );
            }, 300);
        }
    };

    function getWelcomeQuickReplies() {
        const t = I18N[state.lang];
        return [
            { label: t.quickBooking, payload: "START_BOOKING" },
            { label: t.quickServices, payload: "VIEW_SERVICES" },
            { label: t.quickOfficePain, payload: "FAQ_OFFICE_PAIN" },
            { label: t.quickDiff, payload: "FAQ_DIFF" },
            { label: "🇩🇪 DE", action: () => window.setChatLanguage("de") },
            { label: "🇬🇧 EN", action: () => window.setChatLanguage("en") },
            { label: "🇹🇭 TH", action: () => window.setChatLanguage("th") }
        ];
    }

    // Expose for external calls
    window.openBookingForService = function (serviceId) {
        openChat();
        const found = (typeof SERVICES !== "undefined") ? SERVICES.find(s => s.id === serviceId) : null;
        if (found) {
            bookingSession.service = found;
            bookingSession.step = "select_duration";
            const serviceName = found.name[state.lang] || found.name.de;
            appendUserMessage(`${serviceName}`);
            showTyping(() => {
                appendBotMessage(`Sehr gerne! Die <strong>${serviceName}</strong> ist eine wunderbare Wahl. 🌸`);
                askForDuration(found);
            }, 300);
        }
    };

    window.openChatWithQuestion = function (query) {
        openChat();
        appendUserMessage(`${query}`);
        showTypingIndicator();
        dispatchAITreatmentQuery(query);
    };

    // Render Helpers
    function appendBotMessage(htmlContent, quickReplies) {
        if (!chatMessages) return;
        const t = I18N[state.lang];
        const msgDiv = document.createElement("div");
        msgDiv.className = "flex items-start gap-2.5 my-2 animate-fadeIn";

        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2d083e] via-[#440e5b] to-[#7a1f8d] text-[#f5d77f] flex items-center justify-center text-xs font-semibold shrink-0 shadow-md border border-[#d4af37]/60">
                🌸
            </div>
            <div class="flex flex-col gap-1 max-w-[85%]">
                <div class="flex items-center gap-1.5 ml-1">
                    <span class="text-[11px] font-bold text-[#1a0326]">${t.botName}</span>
                    <span class="text-[9px] bg-[#440e5b]/10 text-[#440e5b] border border-[#d4af37]/40 px-2 py-0.5 rounded-full font-medium">
                        Spa Concierge ✦
                    </span>
                </div>
                <div class="bg-white text-[#281a2e] p-3.5 rounded-2xl rounded-tl-xs shadow-sm border border-[#d4af37]/30 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    ${htmlContent}
                </div>
            </div>
        `;
        chatMessages.appendChild(msgDiv);

        if (quickReplies && quickReplies.length > 0) {
            renderQuickReplies(quickReplies);
        }

        scrollToBottom();
    }

    function appendUserMessage(text) {
        if (!chatMessages) return;
        const msgDiv = document.createElement("div");
        msgDiv.className = "flex items-end justify-end gap-2 my-2 animate-fadeIn";
        msgDiv.innerHTML = `
            <div class="bg-gradient-to-r from-[#2d083e] to-[#440e5b] text-[#f5d77f] p-3 rounded-2xl rounded-br-xs shadow-md text-xs sm:text-sm max-w-[80%] leading-relaxed border border-[#d4af37]/40">
                ${escapeHTML(text)}
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function renderQuickReplies(replies) {
        if (!chatMessages) return;
        const container = document.createElement("div");
        container.className = "flex flex-wrap gap-1.5 my-2 pl-9 animate-fadeIn";
        replies.forEach(rep => {
            const btn = document.createElement("button");
            btn.className = "px-3.5 py-1.5 bg-[#f3ece4] hover:bg-[#2d083e] hover:text-[#f5d77f] text-[#281a2e] border border-[#d4af37]/50 rounded-full text-xs font-medium transition shadow-xs flex items-center gap-1.5 active:scale-95";
            btn.innerHTML = rep.label;
            btn.onclick = () => {
                container.remove();
                if (rep.action) {
                    rep.action();
                } else {
                    handleQuickReplyClick(rep.payload, rep.displayText || rep.label);
                }
            };
            container.appendChild(btn);
        });
        chatMessages.appendChild(container);
        scrollToBottom();
    }

    function showTypingIndicator() {
        if (!chatMessages) return;
        removeTypingIndicator();
        const t = I18N[state.lang];
        const typingDiv = document.createElement("div");
        typingDiv.id = "bot-typing-indicator";
        typingDiv.className = "flex items-center gap-2 my-2 pl-1 animate-pulse";
        typingDiv.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-[#2d083e] text-[#f5d77f] flex items-center justify-center text-[10px] shrink-0 font-bold border border-[#d4af37]/50">🌸</div>
            <div class="bg-[#f3ece4] text-[#440e5b] text-xs px-3 py-1.5 rounded-full border border-[#d4af37]/30 flex items-center gap-1.5">
                <span>${t.typing}</span>
                <span class="inline-flex gap-1">
                    <span class="w-1.5 h-1.5 bg-[#8324a8] rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-1.5 bg-[#8324a8] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span class="w-1.5 h-1.5 bg-[#8324a8] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const ind = document.getElementById("bot-typing-indicator");
        if (ind) ind.remove();
    }

    function showTyping(callback, delay = 400) {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            if (callback) callback();
        }, delay);
    }

    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function escapeHTML(str) {
        const div = document.createElement("div");
        div.innerText = str || "";
        return div.innerHTML;
    }

    // Initial greeting
    function renderInitialGreeting() {
        const t = I18N[state.lang];
        appendBotMessage(
            `<strong>${t.welcomeTitle}</strong><br><br>${t.welcomeDesc}`,
            getWelcomeQuickReplies()
        );
    }

    function handleQuickReplyClick(payload, displayText) {
        appendUserMessage(displayText.replace(/<[^>]*>/g, ""));
        showTyping(() => {
            processAction(payload);
        }, 300);
    }

    function processAction(payload) {
        switch (payload) {
            case "START_BOOKING":
            case "VIEW_SERVICES":
                askForService();
                break;
            case "FAQ_OFFICE_PAIN":
                showTypingIndicator();
                dispatchAITreatmentQuery("Ich habe Nacken- und Rückenschmerzen durch Büroarbeit. Was empfehlen Sie?");
                break;
            case "FAQ_DIFF":
                showTypingIndicator();
                dispatchAITreatmentQuery("Was ist der Unterschied zwischen Traditioneller Thaimassage und Aromaölmassage?");
                break;
            default:
                if (payload.startsWith("SELECT_SERVICE_")) {
                    const id = payload.replace("SELECT_SERVICE_", "");
                    const found = (typeof SERVICES !== "undefined") ? SERVICES.find(s => s.id === id) : null;
                    if (found) {
                        bookingSession.service = found;
                        bookingSession.step = "select_duration";
                        askForDuration(found);
                    }
                } else if (payload.startsWith("SELECT_DURATION_")) {
                    const dur = parseInt(payload.replace("SELECT_DURATION_", ""));
                    const option = bookingSession.service.durations.find(d => d.duration === dur);
                    if (option) {
                        bookingSession.duration = option.duration;
                        bookingSession.price = option.price;
                        bookingSession.step = "select_date";
                        askForDate();
                    }
                } else if (payload.startsWith("SELECT_DATE_")) {
                    const dateStr = payload.replace("SELECT_DATE_", "");
                    bookingSession.date = dateStr;
                    bookingSession.step = "select_time";
                    askForTime();
                } else if (payload.startsWith("SELECT_TIME_")) {
                    const timeStr = payload.replace("SELECT_TIME_", "");
                    bookingSession.time = timeStr;
                    bookingSession.step = "select_pressure";
                    askForPressure();
                } else if (payload.startsWith("SELECT_PRESSURE_")) {
                    const pressure = payload.replace("SELECT_PRESSURE_", "");
                    bookingSession.pressure = pressure;
                    bookingSession.step = "input_contact";
                    askForContactDetails();
                }
                break;
        }
    }

    // Step 1: Select Service
    function askForService() {
        bookingSession.step = "select_service";
        const t = I18N[state.lang];
        let servicesHtml = `<p class="mb-2"><strong>${state.lang === "th" ? "เลือกเมนูการนวดที่ต้องการได้เลยค่ะ:" : state.lang === "en" ? "Please choose your preferred treatment:" : "Welche Behandlung darf es für Sie sein?"}</strong></p>`;
        servicesHtml += `<div class="space-y-2 mt-2">`;

        const list = (typeof SERVICES !== "undefined") ? SERVICES : [];
        list.forEach(s => {
            const minPrice = s.durations[0].price;
            const name = s.name[state.lang] || s.name.de;
            const desc = s.shortDesc[state.lang] || s.shortDesc.de;
            servicesHtml += `
                <div class="p-3 rounded-xl border border-[#d4af37]/40 hover:border-[#d4af37] bg-white hover:bg-[#fbf8f5] cursor-pointer transition shadow-xs flex items-center justify-between group" onclick="window.selectServiceFromCard('${s.id}')">
                    <div class="pr-2">
                        <div class="font-semibold text-[#1a0326] text-xs group-hover:text-[#631484] transition-colors">${name}</div>
                        <div class="text-[11px] text-stone-500 leading-snug line-clamp-1">${desc}</div>
                    </div>
                    <div class="text-right shrink-0">
                        <span class="text-xs font-bold text-[#631484]">ab ${minPrice} €</span>
                        <div class="text-[10px] text-gold-600 font-semibold underline">${t.btnBookService}</div>
                    </div>
                </div>
            `;
        });
        servicesHtml += `</div>`;

        appendBotMessage(servicesHtml);
    }

    window.selectServiceFromCard = function (serviceId) {
        const found = (typeof SERVICES !== "undefined") ? SERVICES.find(s => s.id === serviceId) : null;
        if (found) {
            const name = found.name[state.lang] || found.name.de;
            appendUserMessage(name);
            showTyping(() => {
                bookingSession.service = found;
                bookingSession.step = "select_duration";
                askForDuration(found);
            }, 300);
        }
    };

    // Step 2: Duration
    function askForDuration(service) {
        bookingSession.step = "select_duration";
        const t = I18N[state.lang];
        const replies = service.durations.map(d => ({
            label: `⏱️ ${d.duration} Min • <strong>${d.price} €</strong>`,
            payload: `SELECT_DURATION_${d.duration}`,
            displayText: `${d.duration} Minuten (${d.price} €)`
        }));

        const sName = service.name[state.lang] || service.name.de;
        appendBotMessage(
            `<strong>${sName}</strong>:<br><span class="text-xs text-stone-500">${t.durationTip}</span>`,
            replies
        );
    }

    // Step 3: Date
    function askForDate() {
        bookingSession.step = "select_date";
        const t = I18N[state.lang];
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        const weekend = new Date(today);
        weekend.setDate(weekend.getDate() + 3);

        const formatDate = (d) => {
            const days = state.lang === "th" ? ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."] : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
            return `${days[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.`;
        };

        const replies = [
            { label: `${state.lang === "th" ? "วันนี้" : "Heute"} (${formatDate(today)})`, payload: `SELECT_DATE_${formatDate(today)}`, displayText: formatDate(today) },
            { label: `${state.lang === "th" ? "พรุ่งนี้" : "Morgen"} (${formatDate(tomorrow)})`, payload: `SELECT_DATE_${formatDate(tomorrow)}`, displayText: formatDate(tomorrow) },
            { label: `${formatDate(dayAfter)}`, payload: `SELECT_DATE_${formatDate(dayAfter)}`, displayText: formatDate(dayAfter) },
            { label: `${formatDate(weekend)}`, payload: `SELECT_DATE_${formatDate(weekend)}`, displayText: formatDate(weekend) }
        ];

        appendBotMessage(
            `<strong>${bookingSession.duration} Min • ${bookingSession.price} €</strong><br>${t.dateQuestion}`,
            replies
        );
    }

    // Step 4: Time
    function askForTime() {
        bookingSession.step = "select_time";
        const t = I18N[state.lang];
        const slots = (typeof TIME_SLOTS !== "undefined") ? TIME_SLOTS : ["10:00", "11:30", "14:00", "16:00", "18:00"];
        const replies = slots.map(slot => ({
            label: `🕒 ${slot} Uhr`,
            payload: `SELECT_TIME_${slot}`,
            displayText: `${slot} Uhr`
        }));

        appendBotMessage(
            `<strong>${bookingSession.date}</strong><br>${t.timeQuestion}`,
            replies
        );
    }

    // Step 5: Pressure
    function askForPressure() {
        bookingSession.step = "select_pressure";
        const t = I18N[state.lang];
        const replies = [
            { label: t.pressureSoft, payload: "SELECT_PRESSURE_Sanft & Entspannend", displayText: t.pressureSoft },
            { label: t.pressureMedium, payload: "SELECT_PRESSURE_Normal / Ausgewogen", displayText: t.pressureMedium },
            { label: t.pressureStrong, payload: "SELECT_PRESSURE_Intensiv & Kräftig", displayText: t.pressureStrong }
        ];

        appendBotMessage(
            `${t.pressureQuestion}`,
            replies
        );
    }

    // Step 6: Contact Info
    function askForContactDetails() {
        bookingSession.step = "input_contact";
        const formId = "booking-form-" + Date.now();
        const html = `
            <div class="space-y-3">
                <p><strong>${state.lang === "th" ? "กรอกข้อมูลติดต่อเพื่อยืนยันการจองค่ะ:" : state.lang === "en" ? "Please enter your contact details:" : "Fast geschafft! Bitte geben Sie Ihre Kontaktdaten ein:"}</strong></p>
                <form id="${formId}" class="space-y-2.5 text-xs">
                    <div>
                        <label class="block text-[#1a0326] font-semibold mb-1">${state.lang === "th" ? "ชื่อ-นามสกุล *" : "Ihr Vor- & Nachname *"}</label>
                        <input type="text" id="cust-name" required placeholder="z.B. Anna Schmidt" class="w-full px-3 py-2 rounded-lg border border-[#d4af37]/40 focus:outline-none focus:border-[#440e5b] bg-[#faf7f2]">
                    </div>
                    <div>
                        <label class="block text-[#1a0326] font-semibold mb-1">${state.lang === "th" ? "เบอร์โทรศัพท์ (สำหรับแจ้งเตือน SMS) *" : "Telefonnummer (für Bestätigung/SMS) *"}</label>
                        <input type="tel" id="cust-phone" required placeholder="z.B. +49 170 1234567" class="w-full px-3 py-2 rounded-lg border border-[#d4af37]/40 focus:outline-none focus:border-[#440e5b] bg-[#faf7f2]">
                    </div>
                    <button type="submit" class="w-full mt-2 py-3 bg-gradient-to-r from-[#2d083e] via-[#440e5b] to-[#2d083e] hover:from-[#440e5b] hover:to-[#631484] text-[#f5d77f] rounded-xl font-bold shadow-md transition active:scale-98 border border-[#d4af37]/60">
                        ${state.lang === "th" ? "ยืนยันการจองคิวทันที ✨" : state.lang === "en" ? "Confirm Booking Now ✨" : "Termin jetzt verbindlich reservieren ✨"}
                    </button>
                </form>
            </div>
        `;

        appendBotMessage(html);

        setTimeout(() => {
            const form = document.getElementById(formId);
            if (form) {
                form.onsubmit = function (e) {
                    e.preventDefault();
                    const nameInput = document.getElementById("cust-name");
                    const phoneInput = document.getElementById("cust-phone");
                    const name = nameInput ? nameInput.value.trim() : "";
                    const phone = phoneInput ? phoneInput.value.trim() : "";
                    if (!name || !phone) return;

                    bookingSession.customerName = name;
                    bookingSession.customerPhone = phone;

                    appendUserMessage(`${name}, ${phone}`);
                    showTyping(() => {
                        finalizeBooking();
                    }, 500);
                };
            }
        }, 100);
    }

    // Step 7: Finalize & Confirmation Card
    function finalizeBooking() {
        bookingSession.step = "confirmed";
        const t = I18N[state.lang];
        const bookingId = "SL-" + Math.floor(100000 + Math.random() * 900000);
        const sName = bookingSession.service ? (bookingSession.service.name[state.lang] || bookingSession.service.name.de) : "Traditionelle Thaimassage";
        const address = (typeof SHOP_INFO !== "undefined") ? SHOP_INFO.address : "Friedrichstraße 185, 10117 Berlin";

        // Record booking in backend database
        fetch("/api/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serviceId: bookingSession.service ? bookingSession.service.id : "",
                serviceName: sName,
                duration: bookingSession.duration,
                price: bookingSession.price,
                date: bookingSession.date,
                time: bookingSession.time,
                customerName: bookingSession.customerName,
                customerPhone: bookingSession.customerPhone,
                notes: `[Druck: ${bookingSession.pressure}]`,
                source: "Chatbot (Jasmin 🌸)"
            })
        }).catch(e => console.warn("Chat booking sync warning:", e));

        const confirmationCard = `
            <div class="bg-[#faf7f2] border-2 border-[#d4af37]/70 rounded-2xl p-4 text-[#1a0326] space-y-3 shadow-md">
                <div class="flex items-center justify-between border-b border-[#d4af37]/30 pb-2.5">
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-[#1a0326] bg-[#d4af37]/20 border border-[#d4af37] px-3 py-0.5 rounded-full">
                        ${t.bookingConfirmed}
                    </span>
                    <span class="text-[11px] font-mono text-purple-900/60">ID: ${bookingId}</span>
                </div>
                
                <div class="space-y-1.5 text-xs">
                    <div class="flex justify-between">
                        <span class="text-stone-500">${state.lang === "th" ? "บริการ:" : "Behandlung:"}</span>
                        <span class="font-bold text-[#1a0326] text-right">${sName}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-stone-500">${state.lang === "th" ? "ระยะเวลาและราคา:" : "Dauer & Preis:"}</span>
                        <span class="font-semibold text-[#440e5b]">${bookingSession.duration} Min • ${bookingSession.price} €</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-stone-500">${state.lang === "th" ? "วันและเวลา:" : "Datum & Zeit:"}</span>
                        <span class="font-bold text-[#631484]">${bookingSession.date} um ${bookingSession.time} Uhr</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-stone-500">${state.lang === "th" ? "ผู้รับบริการ:" : "Gast:"}</span>
                        <span class="font-medium text-stone-800">${escapeHTML(bookingSession.customerName)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-stone-500">${state.lang === "th" ? "สถานที่:" : "Ort:"}</span>
                        <span class="font-medium text-stone-800">${address}</span>
                    </div>
                </div>

                <div class="pt-2 border-t border-[#d4af37]/30 text-[11px] text-[#440e5b] bg-[#f3ece4] p-2.5 rounded-xl border border-[#d4af37]/20">
                    ✨ <em>${state.lang === "th" ? "ชำระเงินที่ร้านเมื่อรับบริการ (เงินสด / บัตร) ค่ะ" : "Zahlung erfolgt entspannt vor Ort (Bar / EC-Karte / Kreditkarte)."}</em>
                </div>

                <div class="flex gap-2 pt-1">
                    <button onclick="window.print()" class="flex-1 py-2 bg-[#2d083e] hover:bg-[#440e5b] text-[#f5d77f] rounded-xl text-xs font-medium transition text-center border border-[#d4af37]/40 shadow-xs">
                        ${t.printBtn}
                    </button>
                </div>
            </div>
        `;

        appendBotMessage(
            `Kop khun kha! 🙏 Herzlichen Dank, <strong>${escapeHTML(bookingSession.customerName)}</strong>!<br><br>${confirmationCard}`,
            [
                { label: t.anotherBooking, payload: "START_BOOKING" }
            ]
        );
    }

    // Submit handler
    function handleUserMessageSubmit() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = "";
        appendUserMessage(text);

        detectLanguageFromInput(text);

        showTypingIndicator();
        dispatchAITreatmentQuery(text);
    }

    function detectLanguageFromInput(text) {
        const lower = text.toLowerCase();
        // 1. Thai characters
        if (/[\u0E00-\u0E7F]/.test(text)) {
            state.lang = "th";
            return "th";
        }
        // 2. English detection (check substrings and flexible words)
        if (
            lower.includes("feet") || lower.includes("foot") || lower.includes("pain") || 
            lower.includes("massage") || lower.includes("thai") || lower.includes("oil") ||
            lower.includes("price") || lower.includes("cost") || lower.includes("book") ||
            /\b(the|is|are|i|you|he|she|it|we|they|my|your|what|how|why|when|where|who|which|much|appointment|back|neck|shoulder|ache|headache|tension|office|today|tomorrow|pregnant|pregnancy|baby|hello|hi|thanks|thank|parking|pay|cash|card)\b/i.test(lower)
        ) {
            state.lang = "en";
            return "en";
        }
        // 3. German detection
        if (
            /[äöüß]/.test(lower) ||
            lower.includes("schmerz") || lower.includes("rücken") || lower.includes("nacken") || lower.includes("fuß") || lower.includes("fuss") ||
            /\b(schultern|schulter|kopfschmerz|verspannung|verspannungen|büro|arbeit|hexenschuss|bandscheibe|thaimassage|aroma|öl|wie|was|wo|wann|wer|warum|welche|welcher|und|oder|der|die|das|dem|den|des|ich|du|er|sie|wir|ihr|ist|sind|nicht|mit|für|von|ein|eine|einen|eines|einer|haben|habe|hat|bitte|danke|hallo|guten|tag|morgen|abend|termin|buchen|reservieren|zeit|uhr|preise|kosten|teuer|gutschein|schwanger|schwangerschaft|baby|parken|parkplatz|zahlung|bezahlen|karte|bar)\b/i.test(lower)
        ) {
            state.lang = "de";
            return "de";
        }
        return state.lang;
    }

    // AI Query Dispatcher (Gemini, Cloudflare, or Built-in Knowledge Base)
    async function dispatchAITreatmentQuery(userQuery) {
        // Detect language immediately
        const currentLang = detectLanguageFromInput(userQuery);
        state.chatHistory.push({ role: "user", content: userQuery });

        // 1. Check if Google Gemini API Key is configured
        if (state.cfConfig.geminiKey) {
            try {
                const geminiAnswer = await callGoogleGeminiAPI(userQuery, currentLang);
                if (geminiAnswer) {
                    removeTypingIndicator();
                    state.chatHistory.push({ role: "assistant", content: geminiAnswer });
                    appendBotMessage(geminiAnswer, [
                        { label: I18N[state.lang].quickBooking, payload: "START_BOOKING" },
                        { label: I18N[state.lang].quickServices, payload: "VIEW_SERVICES" }
                    ]);
                    return;
                }
            } catch (err) {
                console.warn("Gemini API call failed, falling back:", err);
            }
        }

        // 2. Check if direct Cloudflare Workers AI credentials are configured
        if (state.cfConfig.apiToken && state.cfConfig.accountId) {
            try {
                const cfResult = await callDirectCloudflareWorkersAI(userQuery, currentLang);
                if (cfResult) {
                    removeTypingIndicator();
                    state.chatHistory.push({ role: "assistant", content: cfResult });
                    appendBotMessage(cfResult, [
                        { label: I18N[state.lang].quickBooking, payload: "START_BOOKING" },
                        { label: I18N[state.lang].quickServices, payload: "VIEW_SERVICES" }
                    ]);
                    return;
                }
            } catch (err) {
                console.warn("Direct Cloudflare API error:", err);
            }
        }

        // 3. Try /api/chat only if not running on file:// protocol
        if (window.location.protocol !== "file:") {
            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: userQuery,
                        history: state.chatHistory.slice(-6),
                        language: state.lang,
                        cf_account_id: state.cfConfig.accountId,
                        cf_api_token: state.cfConfig.apiToken,
                        cf_model: state.cfConfig.model
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.response && !data.response.includes("[Demo Modus / Offline]")) {
                        removeTypingIndicator();
                        state.chatHistory.push({ role: "assistant", content: data.response });
                        appendBotMessage(data.response, [
                            { label: I18N[state.lang].quickBooking, payload: "START_BOOKING" },
                            { label: I18N[state.lang].quickServices, payload: "VIEW_SERVICES" }
                        ]);
                        return;
                    }
                }
            } catch (e) {}
        }

        // 4. Built-in Thai Massage Specialist Knowledge Engine (Instant & Human-like)
        setTimeout(() => {
            removeTypingIndicator();
            const smartAnswer = generateSmartSimulationAnswer(userQuery, currentLang);
            state.chatHistory.push({ role: "assistant", content: smartAnswer });
            appendBotMessage(smartAnswer, [
                { label: I18N[state.lang].quickBooking, payload: "START_BOOKING" },
                { label: I18N[state.lang].quickServices, payload: "VIEW_SERVICES" }
            ]);
        }, 400);
    }

    // Google Gemini API Direct Call
    async function callGoogleGeminiAPI(prompt, lang) {
        const langInstruction = lang === "th" ? "Antworte auf Thailändisch (ภาษาไทย สุภาพ ลงท้ายด้วยค่ะ)" : lang === "en" ? "Answer in warm, polite English." : "Antworte auf Deutsch (höflich, warmherzig).";
        const systemPrompt = `Du bist Jasmin 🌸, eine hochqualifizierte Thai-Massage-Expertin und Beraterin im Studio "Siam Lotus Berlin" (Friedrichstraße 185, 10117 Berlin). 
Du berätst empathisch und kompetent über traditionelle Nuad Thai Massage (Wat Pho), Schmerzlinderung (Rücken, Nacken, Office Syndrome), Kräuterstempel und Wellness.
Preise: Thaimassage 60m 65€, 90m 92€ | Aromaöl 60m 70€, 90m 98€ | Rücken/Nacken 30m 40€, 60m 65€.
${langInstruction} Halte deine Antworten prägnant, herzlich und lade am Ende gerne zum Buchen ein.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.cfConfig.geminiKey}`;

        const contents = [
            ...state.chatHistory.slice(-5).map(h => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.content }]
            })),
            { role: "user", parts: [{ text: prompt }] }
        ];

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }

    // Direct Cloudflare Workers AI API Call
    async function callDirectCloudflareWorkersAI(prompt, lang) {
        const url = `https://api.cloudflare.com/client/v4/accounts/${state.cfConfig.accountId}/ai/run/${state.cfConfig.model}`;
        const langInstruction = lang === "th" ? "Thai (ภาษาไทย สุภาพ ลงท้ายด้วยค่ะ)" : lang === "en" ? "English" : "German (Deutsch)";
        const systemPrompt = `You are Jasmin 🌸, a polite, experienced Thai wellness and massage consultant at Siam Lotus Berlin. Respond warmly in ${langInstruction}. Give expert advice about Thai massage, office syndrome, herbal compresses, and studio bookings.`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...state.chatHistory.slice(-5)
        ];

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${state.cfConfig.apiToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages,
                max_tokens: 512,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.result && data.result.response) {
            return data.result.response;
        } else if (data.result && data.result.choices && data.result.choices[0]) {
            return data.result.choices[0].message.content;
        }
        return null;
    }

    // Deep Thai Massage Specialist Knowledge Engine
    function generateSmartSimulationAnswer(rawQuery, explicitLang) {
        const q = rawQuery.toLowerCase();
        const lang = explicitLang || state.lang;

        // ==========================================
        // 1. GERMAN INQUIRIES (Deutsch)
        // ==========================================
        if (lang === "de") {
            // Rückenschmerzen / Kreuzschmerzen / LWS / Bandscheibe
            if (q.includes("rücken") || q.includes("ruecken") || q.includes("kreuz") || q.includes("lenden") || q.includes("hexenschuss") || q.includes("bandscheibe")) {
                return `Bei **Rückenschmerzen** (ob im Lendenwirbelbereich oder entlang der gesamten Wirbelsäule) können wir Ihnen gezielt und wirkungsvoll helfen:

• **Unsere Empfehlung:** Eine **Traditionelle Thaimassage (90 Min • 92 €)** oder unsere fokussierte **Rücken-, Schulter- & Nackenmassage (60 Min • 65 €)**.
• **So wirkt es:** Unsere Wat-Pho-zertifizierten Therapeutinnen ertasten Muskelverspannungen (Myogelosen) und lockern die tiefen Rückenstrecker durch rhythmische Handballen- und Daumenakupressur entlang der thailändischen Energielinien (Sen-Linien).
• **Zusätzliche Wohltat:** Zum Abschluss wärmt ein traditioneller thailändischer Kräuterbalsam mit Kampfer und Eukalyptus das Gewebe sanft durch.

👉 *Tipp:* Wenn die Schmerzen besonders tief sitzen, ist auch die **Kräuterstempelmassage (80 €)** mit heißem Dampf hervorragend.

Darf ich für Sie prüfen, welche Termine heute oder in den nächsten Tagen frei sind?`;
            }

            // Nackenschmerzen / Schultern / Büro / Office Syndrome / Kopfschmerzen
            if (q.includes("nacken") || q.includes("schulter") || q.includes("büro") || q.includes("buero") || q.includes("kopfschmerz") || q.includes("migräne") || q.includes("verspannung")) {
                return `Typische Beschwerden durch Bildschirmarbeit und Fehlhaltungen kennen wir sehr gut! 

• **Beste Wahl:** Unsere **Rücken-, Schulter- & Nackenmassage (30 Min Express 40 € oder 60 Min Intensiv 65 €)**.
• **Wirkungsweise:** Wir bearbeiten intensiv den Trapezius-Muskel, den Nackenansatz und die Schulterblätter. Dadurch wird die Durchblutung zum Kopf angeregt, was auch Spannungskopfschmerzen spürbar lindert.

Möchten Sie sich eine wohltuende Auszeit gönnen? Klicken Sie einfach unten auf **📅 Termin buchen**!`;
            }

            // Unterschied Nuad Thai vs Aromaöl
            if (q.includes("unterschied") || q.includes("aroma") || q.includes("öl") || q.includes("oel") || q.includes("welche")) {
                return `Sehr gerne erkläre ich Ihnen den Unterschied:

1. **Traditionelle Thaimassage (Nuad Thai):**
   • *Ablauf:* Findet auf einer traditionellen Bodenmatte statt. Sie tragen bequeme, lockere Baumwollkleidung (wird von uns gestellt). Ohne Öl.
   • *Methode:* Kombination aus Akupressur und passiven Yoga-Dehnungen.
   • *Ideal für:* Energieaufbau, steife Gelenke, tiefe Muskelblockaden.

2. **Aromaöl-Entspannungsmassage:**
   • *Ablauf:* Findet auf der beheizten Massageliege mit warmen duftenden Bio-Ölen statt.
   • *Methode:* Sanfte, fließende Streichungen zur Nervenberuhigung.
   • *Ideal für:* Seelenruhe, reinen Stressabbau, samtweiche Haut.

Welche Art der Entspannung spricht Sie spontan mehr an?`;
            }

            // Schmerzen / Druckstärke / Tut es weh?
            if (q.includes("weh") || q.includes("schmerzhaft") || q.includes("druck") || q.includes("stark") || q.includes("hart") || q.includes("sanft")) {
                return `Eine traditionelle Thaimassage soll intensiv und tiefenwirksam sein, aber **niemals schmerzhaft**! 

Wir nennen das Gefühl „heilsamen Druck“ (Good Pain / Wohlwehkern). Sie bestimmen die Intensität selbst:
• **Sanft:** Sanftes Ausstreichen und behutsamer Druck
• **Normal:** Ausgewogene Kombination aus Dehnen und Druck
• **Kräftig:** Traditionell thailändische Tiefengewebsmassage

Sie können der Masseurin während der Behandlung jederzeit sagen: *„Bitte etwas sanfter“* oder *„Gerne etwas kräftiger“*.`;
            }

            // Schwangerschaft
            if (q.includes("schwanger") || q.includes("baby") || q.includes("geburt") || q.includes("trimester")) {
                return `Herzlichen Glückwunsch! 🌸 Zum Schutz von Mutter und Kind gilt bei uns:
• Im **1. Trimester (erste 12 Wochen)** führen wir aus Sicherheitsgründen grundsätzlich **keine Massagen** durch.
• **Ab dem 2. Trimester** bieten wir eine behutsame Entspannungsmassage in bequemer Seitenlage an. Bestimmte Reflexpunkte an den Fersen und am unteren Rücken werden dabei streng ausgespart.

Sprechen Sie uns bei der Buchung gerne kurz darauf an!`;
            }

            // Kräuterstempelmassage
            if (q.includes("kräuter") || q.includes("kraeuter") || q.includes("stempel")) {
                return `Die **Kräuterstempelmassage (Luk Pra Kob)** ist eine Königsdisziplin der thailändischen Heilkunst:
Frische Kräuter (Zitronengras, Kurkuma, Plai-Ingwer, Kaffir-Limette) werden in Baumwollsäckchen mit Wasserdampf erhitzt und rhythmisch auf die Energiebahnen aufgetupft. Die feuchte Wärme öffnet die Poren und lässt die ätherischen Heilkräuter tief ins Muskelgewebe eindringen. 

Preise: 60 Min = 80 € | 90 Min = 110 €.`;
            }

            // Fußreflexzonenmassage
            if (q.includes("fuß") || q.includes("fuss") || q.includes("füße") || q.includes("reflex")) {
                return `Unsere **Fußreflexzonenmassage** (30 Min 38 € | 60 Min 65 €):
Über 70.000 Nervenenden münden in den Fußsohlen. Mit einem speziellen Holzmassagestab und erfrischendem Kräuterbalsam stimulieren wir gezielt die Organzonen, fördern den Lymphfluss und beleben müde Beine.`;
            }

            // Preise & Kosten
            if (q.includes("preis") || q.includes("kosten") || q.includes("wieviel") || q.includes("teuer")) {
                return `Unsere Preisübersicht im Studio Siam Lotus Berlin:
• **Trad. Thaimassage:** 60 Min = 65 € | 90 Min = 92 € | 120 Min = 120 €
• **Aromaölmassage:** 60 Min = 70 € | 90 Min = 98 € | 120 Min = 130 €
• **Rücken-, Nacken- & Schulter:** 30 Min = 40 € | 60 Min = 65 € | 90 Min = 92 €
• **Fußreflexzonen:** 30 Min = 38 € | 60 Min = 65 €
• **Kräuterstempel:** 60 Min = 80 € | 90 Min = 110 €
*Inklusive warmem Begrüßungstee und Entspannung vor Ort.*`;
            }

            // Anfahrt / Parken / Adresse
            if (q.includes("park") || q.includes("anfahrt") || q.includes("adresse") || q.includes("wo") || q.includes("u-bahn")) {
                return `Sie finden uns in der **Friedrichstraße 185, 10117 Berlin (Mitte)**.
• **ÖPNV:** Nur 2 Minuten Fußweg von der U-Bahn-Station *Stadtmitte* (Linien U2 und U6).
• **Parken:** Öffentliche Parkplätze direkt an der Friedrichstraße (mit Parkschein) oder im Parkhaus *Quartier 205* (Taubenstraße).`;
            }

            // Zahlung
            if (q.includes("zahl") || q.includes("bezahl") || q.includes("karte") || q.includes("ec") || q.includes("bar")) {
                return `Sie können bei uns ganz flexibel vor Ort bezahlen:
• Barzahlung (Euro)
• EC-Karte (Girocard)
• Kreditkarten (Visa, Mastercard, Maestro)
• Kontaktlos per Apple Pay & Google Pay.`;
            }

            // Termin buchen
            if (q.includes("termin") || q.includes("buchen") || q.includes("reservier") || q.includes("heute") || q.includes("morgen") || q.includes("zeit")) {
                return `Sehr gerne! Ich führe Sie direkt durch die Online-Terminreservierung. Klicken Sie einfach unten auf **📅 Termin buchen** oder wählen Sie direkt Ihr gewünschtes Verwöhnprogramm aus!`;
            }

            // Gutschein
            if (q.includes("gutschein") || q.includes("geschenk")) {
                return `Ein Geschenkgutschein für eine Thaimassage ist immer eine wunderbare Überraschung! 🎁 
Sie können Gutscheine direkt bei uns im Studio abholen oder wir senden Ihnen auf Wunsch einen digitalen Gutschein per E-Mail zu.`;
            }

            return `Herzlich willkommen bei Siam Lotus Berlin! 🌸 Als Ihre Wellnessberaterin empfehle ich Ihnen gerne das passende Programm für Ihr Wohlbefinden. 

Haben Sie akute Verspannungen (z.B. im Rücken oder Nacken) oder wünschen Sie sich pure Entspannung mit warmen Aromaölen?`;
        }

        // ==========================================
        // 2. THAI INQUIRIES (ภาษาไทย)
        // ==========================================
        if (lang === "th") {
            // ทักทาย สวัสดี / หวัดดี
            if (q.includes("สวัสดี") || q.includes("หวัดดี") || q.includes("ดีครับ") || q.includes("ดีค่ะ")) {
                return `สวัสดีค่ะ 🙏 ยินดีต้อนรับสู่ **สยาม โลตัส เบอร์ลิน** ค่ะ! จัสมินยินดีดูแลนะคะ

วันนี้รู้สึกเมื่อยล้าตึงตัวตรงไหนเป็นพิเศษไหมคะ (เช่น คอบ่าไหล่, ปวดหลัง, หรือเมื่อยฝ่าเท้า) หรือสนใจนวดผ่อนคลายด้วยน้ำมันอโรมาดีคะ? สามารถพิมพ์บอกอาการ หรือกดปุ่มด้านล่างได้เลยค่ะ 🌸`;
            }

            // ปวดหลัง / ปวดเอว / หมอนรองกระดูก
            if (q.includes("หลัง") || q.includes("เอว") || q.includes("สะบัก")) {
                return `สำหรับอาการ**ปวดหลัง** ทั้งช่วงบ่าสะบักและเอวส่วนล่าง จัสมินขอแนะนำ:

• **คอร์สที่แนะนำ:** **นวดเน้นคอ บ่า ไหล่ และหลัง (60 นาที 65 €)** หรือ **นวดแผนไทยโบราณ (90 นาที 92 €)** ค่ะ
• **วิธีการดูแล:** หมอนวดไทยที่ผ่านการรับรองจากวัดโพธิ์จะใช้เทคนิคการกดจุดตามแนวเส้นประธานสิบ คลายพังผืดที่เกาะตามแนวกระดูกสันหลัง และยืดสะโพกเพื่อคลายแรงกดทับช่วงหลังส่วนล่าง
• **สมุนไพร:** ปิดท้ายด้วยการลงบาล์มสมุนไพรไพลสูตรเย็น-อุ่น ช่วยลดการอักเสบของกล้ามเนื้อได้ดีเยี่ยมค่ะ

ต้องการให้จัสมินช่วยเช็กคิวว่างวันนี้หรือวันพรุ่งนี้ให้เลยไหมคะ?`;
            }

            // ปวดคอ บ่า ไหล่ / ออฟฟิศซินโดรม
            if (q.includes("คอ") || q.includes("บ่า") || q.includes("ไหล่") || q.includes("ออฟฟิศ") || q.includes("ปวดหัว")) {
                return `อาการตึงคอบ่าไหล่จากท่านั่งทำงานหรือหน้าจอคอมพิวเตอร์ (Office Syndrome) พบได้บ่อยมากค่ะ!

• แนะนำเป็นคอร์ส **นวดเน้นคอ บ่า ไหล่ และหลัง (30 นาที 40 € หรือ 60 นาที 65 €)** ค่ะ
• หมอนวดจะเน้นเคลียร์ปมกล้ามเนื้อบริเวณกล้ามเนื้อทราพีเซียส (Trapezius) ฐานกะโหลกศีรษะ และสะบักหลัง ช่วยให้เลือดไหลเวียนขึ้นสมองได้ดีขึ้น ลดอาการปวดศีรษะตึงไมเกรนได้ชัดเจนเลยค่ะ

กดปุ่ม **📅 จองคิวนัดหมาย** ด้านล่างเพื่อเลือกรอบเวลาได้เลยนะคะ`;
            }

            // ปวดเท้า / ปวดขา / เมื่อยขา / รองช้ำ
            if (q.includes("เท้า") || q.includes("ขา") || q.includes("ส้นเท้า") || q.includes("น่อง") || q.includes("เดิน")) {
                return `สำหรับอาการ**เมื่อยล้าฝ่าเท้า ปวดน่อง หรือเดินยืนทั้งวัน** จัสมินขอแนะนำคอร์สนี้เลยค่ะ:

• **คอร์สที่แนะนำ:** **นวดกดจุดสะท้อนเท้า (Fußreflexzonenmassage)**:
  - **30 นาที Express (38 €)** เหมาะสำหรับฟื้นฟูเร่งด่วน
  - **60 นาที คอร์สเต็ม (65 €)** นวดเน้นฝ่าเท้า ไล่ขึ้นมาถึงกล้ามเนื้อน่องและข้อพับ
• **วิธีการนวด:** หมอนวดจะใช้ไม้กดจุดไม้สักทองและยาหม่องสมุนไพรสูตรเย็น กระตุ้นจุดสะท้อนอวัยวะต่างๆ ใต้ฝ่าเท้า ช่วยสลายพังผืดใต้ฝ่าเท้า (รองช้ำ) และกระตุ้นการไหลเวียนน้ำเหลือง เบาสบายขาทันทีค่ะ

สนใจให้จัสมินจองคิวรอบนวดเท้าให้เลยไหมคะ?`;
            }

            // นวดไทย vs นวดน้ำมัน
            if (q.includes("ต่าง") || q.includes("น้ำมัน") || q.includes("แบบไหน") || q.includes("เลือก")) {
                return `ความแตกต่างหลักๆ ระหว่าง 2 ศาสตร์ค่ะ:

1. **นวดแผนไทยโบราณ (Nuad Thai):**
   • ไม่ใช้น้ำมัน สวมชุดผ้าฝ้ายสบายๆ นวดบนฟูก
   • เน้นการกดจุดตามเส้นเอ็นและดัดตัวคล้ายโยคะ เหมาะกับคนชอบความหนักแน่น คลายเส้นตึง เส้นยึด

2. **นวดน้ำมันอโรมา (Aroma Oil):**
   • นวดบนเตียงสปา ใช้น้ำมันหอมระเหยอุ่นๆ กลิ่นผ่อนคลาย
   • สัมผัสนุ่มนวล ลื่นไหลต่อเนื่อง เน้นคลายความเครียดสะสม ช่วยให้หลับลึก และบำรุงผิวพรรณ

คุณลูกค้าชอบสไตล์หนักแน่นกดจุด หรือเน้นผ่อนคลายสบายๆ คะ?`;
            }

            // นวดเจ็บไหม
            if (q.includes("เจ็บ") || q.includes("หนัก") || q.includes("แรง")) {
                return `การนวดไทยที่ดีควรจะรู้สึกตึงหน่วงสบาย แต่**ต้องไม่เจ็บทรมาน**ค่ะ! 

ทางร้านมีระดับน้ำหนักให้เลือก (เบา / ปานกลาง / หนัก) และขณะนวดสามารถบอกพี่หมอนวดได้ตลอดเวลาเลยค่ะว่า "ขอเบาลงหน่อย" หรือ "เน้นหนักขึ้นได้" หมอนวดจะปรับให้พอดีกับความสบายของลูกค้าค่ะ`;
            }

            // คนท้อง / ตั้งครรภ์
            if (q.includes("ท้อง") || q.includes("ตั้งครรภ์")) {
                return `ยินดีด้วยนะคะคุณแม่! 🌸 เพื่อความปลอดภัยสูงสุด:
• ช่วง **3 เดือนแรก (ไตรมาสแรก)** ทางร้านของดให้บริการนวดทุกกรณีค่ะ
• **หลัง 3 เดือนไปแล้ว** สามารถรับบริการนวดผ่อนคลายเบาๆ ในท่านอนตะแคงได้ โดยจะเว้นจุดกดสะท้อนบริเวณส้นเท้าและหลังส่วนล่างค่ะ`;
            }

            // ราคา
            if (q.includes("ราคา") || q.includes("เท่าไหร่") || q.includes("ค่า")) {
                return `เมนูราคาของร้าน Siam Lotus Berlin ค่ะ:
• นวดไทยโบราณ: 60 นาที = 65 € | 90 นาที = 92 € | 120 นาที = 120 €
• นวดน้ำมันอโรมา: 60 นาที = 70 € | 90 นาที = 98 € | 120 นาที = 130 €
• นวดคอบ่าไหล่หลัง: 30 นาที = 40 € | 60 นาที = 65 €
• นวดกดจุดสะท้อนเท้า: 30 นาที = 38 € | 60 นาที = 65 €
• นวดประคบสมุนไพรสด: 60 นาที = 80 € | 90 นาที = 110 €
*มีชามะลิต้อนรับและบริการด้วยรอยยิ้มไทยแท้ค่ะ*`;
            }

            // จองคิว
            if (q.includes("จอง") || q.includes("คิว") || q.includes("นัด") || q.includes("เวลา")) {
                return `ยินดีช่วยทำนัดให้เลยค่ะ! กดปุ่ม **📅 จองคิวนัดหมาย** ด้านล่างนี้ได้เลย จัสมินจะพาเลือกวัน เวลา และบริการทีละขั้นตอนในไม่กี่วินาทีค่ะ`;
            }

            return `ยินดีต้อนรับสู่ สยาม โลตัส เบอร์ลิน ค่ะ 🙏 หากมีอาการเมื่อยล้าจุดไหนเป็นพิเศษ หรือต้องการทราบข้อมูลคอร์สการนวด สามารถสอบถามจัสมินได้เลยนะคะ หรือต้องการให้ช่วยจองคิวนัดหมายเวลาไหนดีคะ?`;
        }

        // ==========================================
        // 3. ENGLISH INQUIRIES (English)
        // ==========================================
        // Feet pain / Foot pain / Legs / Standing all day
        if (q.includes("feet") || q.includes("foot") || q.includes("leg") || q.includes("heel") || q.includes("calf") || q.includes("walk")) {
            return `For **foot and leg pain** (feet pain, tired soles, or tension from walking/standing all day), we have the perfect therapy:

• **Our Recommendation:** Our traditional **Foot Reflexology Massage (Fußreflexzonenmassage)**:
  - **30 Min Express (38 €)** for quick revitalization
  - **60 Min Intensive (65 €)** includes lower leg and calf acupressure.
• **How it works:** Over 7,000 nerve endings meet in your soles. Using a traditional wooden reflexology stick and cooling herbal balm, our therapists stimulate the organ reflex zones, release plantar fasciitis tension, and improve lymphatic circulation.

Would you like to book a soothing foot session today or tomorrow?`;
        }

        if (q.includes("back") || q.includes("spine") || q.includes("lumbar")) {
            return `For **back pain and spinal stiffness**, we have targeted therapies that bring fast relief:

• **Our Recommendation:** A **Traditional Thai Massage (90 Min • 92 €)** or our focused **Back, Neck & Shoulder Massage (60 Min • 65 €)**.
• **How it works:** Certified Wat Pho therapists apply rhythmic thumb and palm acupressure along the myofascial lines (Sen lines) to release deep muscle spasms and knots. We finish with soothing warm herbal balm.

Would you like me to check available slots for today or tomorrow?`;
        }

        if (q.includes("neck") || q.includes("shoulder") || q.includes("office") || q.includes("headache")) {
            return `Tension in the neck and shoulders caused by computer work is very common! 

We recommend our **Back, Neck & Shoulder Massage (30 Min Express 40 € or 60 Min 65 €)**. It releases tightness in the trapezius and upper spine, improving circulation and relieving tension headaches.

Click **📅 Book Appointment** below to reserve your slot!`;
        }

        if (q.includes("diff") || q.includes("oil") || q.includes("traditional") || q.includes("between")) {
            return `Here is the difference between our two most popular treatments:

1. **Traditional Thai Massage (Nuad Thai):** Performed clothed on a floor futon without oil. Combines acupressure with gentle yoga stretches. Great for flexibility, stiff joints, and energy flow.
2. **Aromatherapy Oil Massage:** Performed on a massage table with warm organic essential oils. Gentle, flowing strokes for deep mental relaxation and stress relief.

Which style do you feel like enjoying today?`;
        }

        if (q.includes("pregnant") || q.includes("pregnancy")) {
            return `Congratulations! 🌸 For safety, we do not perform massages during the **first trimester (first 12 weeks)**. After that, we offer gentle, side-lying relaxation massage strictly avoiding lower back and ankle pressure points.`;
        }

        if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
            return `Our price list at Siam Lotus Berlin:
• Traditional Thai Massage: 60 Min = 65 € | 90 Min = 92 € | 120 Min = 120 €
• Aroma Oil Massage: 60 Min = 70 € | 90 Min = 98 € | 120 Min = 130 €
• Back, Neck & Shoulder: 30 Min = 40 € | 60 Min = 65 €
• Foot Reflexology: 30 Min = 38 € | 60 Min = 65 €
• Hot Herbal Compress: 60 Min = 80 € | 90 Min = 110 €`;
        }

        return `Welcome to Siam Lotus Berlin! 🌸 As your wellness consultant, I am delighted to help. Are you looking to relieve acute muscle pain (such as in your back, neck, or feet), or looking for gentle deep relaxation?`;
    }

    // Modal Settings (Gemini & Cloudflare)
    function openSettingsModal() {
        if (!settingsModal) return;
        const geminiInput = document.getElementById("gemini-key-input");
        const accInput = document.getElementById("cf-acc-input");
        const tokInput = document.getElementById("cf-token-input");
        const modSelect = document.getElementById("cf-model-select");

        if (geminiInput) geminiInput.value = state.cfConfig.geminiKey || "";
        if (accInput) accInput.value = state.cfConfig.accountId || "";
        if (tokInput) tokInput.value = state.cfConfig.apiToken || "";
        if (modSelect) modSelect.value = state.cfConfig.model || "@cf/qwen/qwen2.5-7b-instruct";

        settingsModal.classList.remove("hidden");
        settingsModal.classList.add("flex");
    }

    window.closeSettingsModal = function () {
        if (!settingsModal) return;
        settingsModal.classList.add("hidden");
        settingsModal.classList.remove("flex");
    };

    window.saveCloudflareSettings = function () {
        const geminiInput = document.getElementById("gemini-key-input");
        const accInput = document.getElementById("cf-acc-input");
        const tokInput = document.getElementById("cf-token-input");
        const modSelect = document.getElementById("cf-model-select");

        const gemini = geminiInput ? geminiInput.value.trim() : "";
        const acc = accInput ? accInput.value.trim() : "";
        const tok = tokInput ? tokInput.value.trim() : "";
        const mod = modSelect ? modSelect.value : "@cf/qwen/qwen2.5-7b-instruct";

        state.cfConfig.geminiKey = gemini;
        state.cfConfig.accountId = acc;
        state.cfConfig.apiToken = tok;
        state.cfConfig.model = mod;

        setSafeStorage("gemini_api_key", gemini);
        setSafeStorage("cf_account_id", acc);
        setSafeStorage("cf_api_token", tok);
        setSafeStorage("cf_model", mod);

        window.closeSettingsModal();

        if (gemini) {
            appendBotMessage(`✓ **Google Gemini AI** ist jetzt aktiv! Jasmin antwortet nun mit echter generativer KI.`);
        } else if (tok && acc) {
            appendBotMessage(`✓ **Cloudflare Workers AI** ist jetzt aktiv! Modell: <code>${mod}</code>`);
        } else {
            appendBotMessage(`✓ Einstellungen aktualisiert! Jasmin nutzt den integrierten **Thai-Massage-Expertenmodus** (Offline & Live).`);
        }
    };

})();
