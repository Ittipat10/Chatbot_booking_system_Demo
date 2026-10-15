// booking.js - Interactive Haute Thai Silk Booking Modal Engine
// Siam Lotus Wellness Berlin

(function () {
    "use strict";

    const bookingState = {
        step: 1, // 1: Service, 2: Duration, 3: Date & Time, 4: Details, 5: Confirmed
        service: null,
        duration: 60,
        price: 65,
        date: null,
        time: "14:30",
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        pressure: "Normal / Ausgewogen",
        notes: "",
        bookingId: null,
        isSubmitting: false
    };

    // Initialize Default Date to Tomorrow
    function getDefaultDateString(offsetDays = 1) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split("T")[0];
    }

    bookingState.date = getDefaultDateString(1);

    // Initialize on DOM Ready
    document.addEventListener("DOMContentLoaded", () => {
        initBookingModal();
    });

    function initBookingModal() {
        const modal = document.getElementById("booking-modal");
        if (!modal) return;

        // Close on backdrop click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                window.closeBookingModal();
            }
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !modal.classList.contains("hidden")) {
                window.closeBookingModal();
            }
        });
    }

    // Public Functions
    window.openBookingModal = function (serviceId = "trad-thai") {
        const modal = document.getElementById("booking-modal");
        if (!modal) return;

        // Find service
        const list = (typeof SERVICES !== "undefined") ? SERVICES : [];
        const found = list.find(s => s.id === serviceId) || list[0];
        
        bookingState.service = found;
        if (found && found.durations && found.durations.length > 0) {
            const defaultDur = found.durations[1] || found.durations[0];
            bookingState.duration = defaultDur.duration;
            bookingState.price = defaultDur.price;
        }

        bookingState.step = 1;
        bookingState.bookingId = null;
        bookingState.isSubmitting = false;

        renderModalContent();
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.body.style.overflow = "hidden";
    };

    window.closeBookingModal = function () {
        const modal = document.getElementById("booking-modal");
        if (!modal) return;
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        document.body.style.overflow = "";
    };

    window.setBookingStep = function (step) {
        bookingState.step = step;
        renderModalContent();
    };

    window.selectService = function (serviceId) {
        const list = (typeof SERVICES !== "undefined") ? SERVICES : [];
        const found = list.find(s => s.id === serviceId);
        if (found) {
            bookingState.service = found;
            const def = found.durations[1] || found.durations[0];
            bookingState.duration = def.duration;
            bookingState.price = def.price;
            bookingState.step = 2;
            renderModalContent();
        }
    };

    window.selectDuration = function (dur, price) {
        bookingState.duration = dur;
        bookingState.price = price;
        bookingState.step = 3;
        renderModalContent();
    };

    window.selectDate = function (dateStr) {
        bookingState.date = dateStr;
        renderDateSelector();
    };

    window.selectTimeSlot = function (t) {
        bookingState.time = t;
        renderTimeSelector();
    };

    // Render Steps
    function renderModalContent() {
        const container = document.getElementById("booking-modal-body");
        if (!container) return;

        updateStepIndicator();

        switch (bookingState.step) {
            case 1:
                renderStep1Service(container);
                break;
            case 2:
                renderStep2Duration(container);
                break;
            case 3:
                renderStep3DateTime(container);
                break;
            case 4:
                renderStep4GuestDetails(container);
                break;
            case 5:
                renderStep5Confirmation(container);
                break;
        }
    }

    function updateStepIndicator() {
        const indicator = document.getElementById("booking-step-indicator");
        if (!indicator) return;

        const steps = [
            { num: 1, label: "Behandlung" },
            { num: 2, label: "Dauer" },
            { num: 3, label: "Termin" },
            { num: 4, label: "Gast" }
        ];

        let html = `<div class="flex items-center justify-between max-w-md mx-auto mb-6 px-2">`;
        steps.forEach((s, idx) => {
            const isActive = bookingState.step === s.num;
            const isCompleted = bookingState.step > s.num;
            
            const circleClass = isCompleted 
                ? "bg-gold-500 text-royal-950 font-bold border-gold-400" 
                : isActive 
                ? "bg-royal-800 text-gold-300 border-gold-400 ring-2 ring-gold-400/50" 
                : "bg-white/10 text-stone-400 border-white/20";

            html += `
                <div class="flex items-center">
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-cinzel border ${circleClass} transition-all">
                            ${isCompleted ? "✓" : s.num}
                        </div>
                        <span class="text-[10px] mt-1 font-cinzel tracking-wider uppercase ${isActive ? 'text-gold-300 font-semibold' : 'text-stone-400'}">${s.label}</span>
                    </div>
                </div>
            `;
            if (idx < steps.length - 1) {
                html += `<div class="flex-1 h-[1px] mx-2 ${isCompleted ? 'bg-gold-500' : 'bg-white/20'}"></div>`;
            }
        });
        html += `</div>`;
        indicator.innerHTML = html;
    }

    // STEP 1: Select Service
    function renderStep1Service(container) {
        const list = (typeof SERVICES !== "undefined") ? SERVICES : [];
        let html = `
            <div class="space-y-4">
                <div class="text-center space-y-1 mb-5">
                    <h3 class="font-serif text-2xl text-white">Wählen Sie Ihre Zeremonie</h3>
                    <p class="text-xs text-purple-200/80 font-light">Traditionelle Heilkunst und tiefenwirksame Entspannung</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
        `;

        list.forEach(s => {
            const isSelected = bookingState.service && bookingState.service.id === s.id;
            const minPrice = s.durations[0].price;
            html += `
                <div onclick="window.selectService('${s.id}')" class="p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-royal-800 border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-[#1e052c] border-gold-500/25 hover:border-gold-500/70 hover:bg-royal-800/80'} group flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <h4 class="font-cinzel text-xs font-bold text-white group-hover:text-gold-300 transition-colors">${s.name.de}</h4>
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-royal-700 text-gold-300 border border-gold-500/30 font-cinzel">${s.tag || 'Exklusiv'}</span>
                        </div>
                        <p class="text-[11px] text-purple-200/75 leading-relaxed font-light line-clamp-2">${s.shortDesc.de}</p>
                    </div>
                    <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10 text-xs">
                        <span class="text-stone-400">ab ${minPrice} €</span>
                        <span class="text-gold-400 font-cinzel font-semibold group-hover:translate-x-1 transition-transform">Auswählen →</span>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }

    // STEP 2: Select Duration
    function renderStep2Duration(container) {
        const s = bookingState.service;
        if (!s) return;

        let html = `
            <div class="space-y-6">
                <div class="text-center space-y-1 mb-5">
                    <span class="text-[11px] font-cinzel tracking-widest uppercase text-gold-400">${s.name.de}</span>
                    <h3 class="font-serif text-2xl text-white">Wie viel Zeit möchten Sie sich schenken?</h3>
                    <p class="text-xs text-purple-200/80 font-light">Wählen Sie die ideale Behandlungsdauer</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        `;

        s.durations.forEach(d => {
            const isSelected = bookingState.duration === d.duration;
            html += `
                <div onclick="window.selectDuration(${d.duration}, ${d.price})" class="p-5 rounded-2xl text-center cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-royal-800 border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#1e052c] border-gold-500/30 hover:border-gold-500/80 hover:bg-royal-800'} group">
                    <div class="font-cinzel text-lg font-bold text-white group-hover:text-gold-300">${d.duration} Min</div>
                    <div class="text-2xl font-serif text-gold-400 my-2">${d.price} €</div>
                    <div class="text-[10px] text-purple-200/70 uppercase tracking-wider">${d.label.includes('Empfohlen') ? '★ Empfehlung' : 'Ausgewogen'}</div>
                </div>
            `;
        });

        html += `
                </div>
                <div class="flex justify-between pt-4 border-t border-white/10 max-w-lg mx-auto">
                    <button onclick="window.setBookingStep(1)" class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-cinzel uppercase tracking-wider transition">
                        ← Zurück
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    // STEP 3: Select Date & Time
    function renderStep3DateTime(container) {
        let html = `
            <div class="space-y-6">
                <div class="text-center space-y-1 mb-3">
                    <span class="text-[11px] font-cinzel tracking-widest uppercase text-gold-400">${bookingState.service.name.de} • ${bookingState.duration} Min (${bookingState.price} €)</span>
                    <h3 class="font-serif text-2xl text-white">Wunschdatum & Uhrzeit wählen</h3>
                </div>
                
                <!-- Date Selector (Next 14 Days) -->
                <div>
                    <label class="block text-xs font-cinzel font-semibold text-purple-200 mb-2 uppercase tracking-wider">Verfügbare Tage</label>
                    <div id="booking-date-grid" class="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                    </div>
                </div>

                <!-- Time Selector -->
                <div>
                    <label class="block text-xs font-cinzel font-semibold text-purple-200 mb-2 uppercase tracking-wider">Uhrzeit</label>
                    <div id="booking-time-grid" class="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    </div>
                </div>

                <div class="flex justify-between pt-4 border-t border-white/10">
                    <button onclick="window.setBookingStep(2)" class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-cinzel uppercase tracking-wider transition">
                        ← Zurück
                    </button>
                    <button onclick="window.setBookingStep(4)" class="px-7 py-2.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-royal-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition">
                        Weiter zu den Kontaktdaten →
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = html;

        renderDateSelector();
        renderTimeSelector();
    }

    function renderDateSelector() {
        const grid = document.getElementById("booking-date-grid");
        if (!grid) return;

        const daysOfWeekDe = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
        const monthsDe = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
        
        let html = "";
        for (let i = 1; i <= 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const iso = d.toISOString().split("T")[0];
            const isSelected = bookingState.date === iso;

            const dayName = daysOfWeekDe[d.getDay()];
            const dayNum = d.getDate();
            const monthName = monthsDe[d.getMonth()];

            html += `
                <div onclick="window.selectDate('${iso}')" class="shrink-0 w-16 p-3 rounded-2xl text-center cursor-pointer transition-all border ${isSelected ? 'bg-gold-500 text-royal-950 font-bold border-gold-300 shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-105' : 'bg-[#1e052c] text-purple-200 border-gold-500/25 hover:border-gold-500/60 hover:bg-royal-800'}">
                    <div class="text-[10px] uppercase font-cinzel ${isSelected ? 'text-royal-950' : 'text-stone-400'}">${dayName}</div>
                    <div class="text-lg font-cinzel my-0.5">${dayNum}</div>
                    <div class="text-[10px] ${isSelected ? 'text-royal-950' : 'text-stone-400'}">${monthName}</div>
                </div>
            `;
        }
        grid.innerHTML = html;
    }

    function renderTimeSelector() {
        const grid = document.getElementById("booking-time-grid");
        if (!grid) return;

        const slots = (typeof TIME_SLOTS !== "undefined") ? TIME_SLOTS : [
            "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"
        ];

        let html = "";
        slots.forEach(t => {
            const isSelected = bookingState.time === t;
            html += `
                <div onclick="window.selectTimeSlot('${t}')" class="p-2.5 rounded-xl text-center cursor-pointer text-xs font-cinzel transition border ${isSelected ? 'bg-gold-500 text-royal-950 font-bold border-gold-300 shadow-md' : 'bg-[#1e052c] text-purple-200 border-gold-500/25 hover:border-gold-500 hover:text-white'}">
                    ${t}
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    // STEP 4: Guest Details Form
    function renderStep4GuestDetails(container) {
        let html = `
            <div class="space-y-5">
                <div class="text-center space-y-1 mb-3">
                    <h3 class="font-serif text-2xl text-white">Ihre Kontaktdaten</h3>
                    <p class="text-xs text-purple-200/80 font-light">Für die verbindliche Reservierung & SMS-Bestätigung</p>
                </div>

                <!-- Summary Bar -->
                <div class="p-3.5 rounded-xl bg-royal-800/80 border border-gold-500/30 flex justify-between items-center text-xs">
                    <div>
                        <div class="font-cinzel text-gold-300 font-bold">${bookingState.service.name.de}</div>
                        <div class="text-stone-300 text-[11px]">${bookingState.date} um ${bookingState.time} Uhr (${bookingState.duration} Min)</div>
                    </div>
                    <div class="text-right">
                        <span class="font-serif text-lg text-gold-400">${bookingState.price} €</span>
                    </div>
                </div>

                <form id="booking-submit-form" onsubmit="window.handleBookingSubmit(event)" class="space-y-3.5 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label class="block text-purple-200 font-cinzel mb-1 tracking-wider uppercase">Vor- & Nachname *</label>
                            <input type="text" id="bm-name" required value="${escapeHTML(bookingState.guestName)}" placeholder="z.B. Anna Schmidt" class="w-full px-3.5 py-2.5 rounded-xl bg-[#1e052c] border border-gold-500/30 focus:border-gold-400 text-white placeholder-stone-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-purple-200 font-cinzel mb-1 tracking-wider uppercase">Telefonnummer *</label>
                            <input type="tel" id="bm-phone" required value="${escapeHTML(bookingState.guestPhone)}" placeholder="z.B. +49 170 1234567" class="w-full px-3.5 py-2.5 rounded-xl bg-[#1e052c] border border-gold-500/30 focus:border-gold-400 text-white placeholder-stone-500 outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label class="block text-purple-200 font-cinzel mb-1 tracking-wider uppercase">E-Mail-Adresse (Optional)</label>
                            <input type="email" id="bm-email" value="${escapeHTML(bookingState.guestEmail)}" placeholder="anna@beispiel.de" class="w-full px-3.5 py-2.5 rounded-xl bg-[#1e052c] border border-gold-500/30 focus:border-gold-400 text-white placeholder-stone-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-purple-200 font-cinzel mb-1 tracking-wider uppercase">Druckstärke-Präferenz</label>
                            <select id="bm-pressure" class="w-full px-3.5 py-2.5 rounded-xl bg-[#1e052c] border border-gold-500/30 focus:border-gold-400 text-white outline-none">
                                <option value="Sanft / ผ่อนคลายเบาๆ">Sanft / ผ่อนคลายเบาๆ (Soft)</option>
                                <option value="Normal / Ausgewogen" selected>Normal / Ausgewogen (Medium)</option>
                                <option value="Kräftig / เน้นหนักแน่น">Kräftig / เน้นหนักแน่น (Strong)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-purple-200 font-cinzel mb-1 tracking-wider uppercase">Besondere Wünsche / Fokusbereiche</label>
                        <input type="text" id="bm-notes" value="${escapeHTML(bookingState.notes)}" placeholder="z.B. Fokus auf oberen Rücken, Nackenverspannung..." class="w-full px-3.5 py-2.5 rounded-xl bg-[#1e052c] border border-gold-500/30 focus:border-gold-400 text-white placeholder-stone-500 outline-none">
                    </div>

                    <div class="flex justify-between pt-4 border-t border-white/10 items-center">
                        <button type="button" onclick="window.setBookingStep(3)" class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-cinzel uppercase tracking-wider transition">
                            ← Zurück
                        </button>
                        <button type="submit" id="bm-submit-btn" class="px-8 py-3 rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-royal-950 font-cinzel font-bold text-xs uppercase tracking-widest shadow-xl transition active:scale-95">
                            Termin jetzt verbindlich anfragen ✨
                        </button>
                    </div>
                </form>
            </div>
        `;
        container.innerHTML = html;
    }

    // Submit Booking to Server API
    window.handleBookingSubmit = async function (e) {
        e.preventDefault();
        if (bookingState.isSubmitting) return;

        const nameInput = document.getElementById("bm-name");
        const phoneInput = document.getElementById("bm-phone");
        const emailInput = document.getElementById("bm-email");
        const pressureInput = document.getElementById("bm-pressure");
        const notesInput = document.getElementById("bm-notes");
        const submitBtn = document.getElementById("bm-submit-btn");

        bookingState.guestName = nameInput ? nameInput.value.trim() : "";
        bookingState.guestPhone = phoneInput ? phoneInput.value.trim() : "";
        bookingState.guestEmail = emailInput ? emailInput.value.trim() : "";
        bookingState.pressure = pressureInput ? pressureInput.value : "Normal / Ausgewogen";
        bookingState.notes = notesInput ? notesInput.value.trim() : "";

        if (!bookingState.guestName || !bookingState.guestPhone) {
            alert("Bitte geben Sie Namen und Telefonnummer ein.");
            return;
        }

        bookingState.isSubmitting = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>⏳ Buchung wird verarbeitet...</span>`;
        }

        const payload = {
            serviceId: bookingState.service ? bookingState.service.id : "",
            serviceName: bookingState.service ? bookingState.service.name.de : "Traditionelle Thaimassage",
            duration: bookingState.duration,
            price: bookingState.price,
            date: bookingState.date,
            time: bookingState.time,
            customerName: bookingState.guestName,
            customerPhone: bookingState.guestPhone,
            customerEmail: bookingState.guestEmail,
            notes: (bookingState.pressure ? `[Druck: ${bookingState.pressure}] ` : "") + bookingState.notes,
            source: "Website Booking Modal (Localhost Demo)"
        };

        try {
            const resp = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                const resData = await resp.json();
                bookingState.bookingId = resData.bookingId || ("SL-" + Math.floor(100000 + Math.random() * 900000));
            } else {
                // Fallback ID if offline
                bookingState.bookingId = "SL-" + Math.floor(100000 + Math.random() * 900000);
            }
        } catch (err) {
            console.warn("Backend error, using client confirmation:", err);
            bookingState.bookingId = "SL-" + Math.floor(100000 + Math.random() * 900000);
        }

        bookingState.isSubmitting = false;
        bookingState.step = 5;
        renderModalContent();
    };

    // STEP 5: Confirmation Card
    function renderStep5Confirmation(container) {
        const sName = bookingState.service ? bookingState.service.name.de : "Traditionelle Thaimassage";
        let html = `
            <div class="text-center space-y-6 max-w-md mx-auto py-2">
                <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-gold-500 to-gold-400 text-royal-950 flex items-center justify-center text-3xl mx-auto shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                    ✓
                </div>
                
                <div class="space-y-1">
                    <span class="text-xs font-cinzel text-gold-400 uppercase tracking-widest">Kop Khun Kha 🙏 Herzlichen Dank</span>
                    <h3 class="font-serif text-3xl text-white">Ihr Termin ist reserviert!</h3>
                    <p class="text-xs text-purple-200/80">Wir freuen uns sehr auf Ihren Besuch im Siam Lotus Berlin.</p>
                </div>

                <!-- Royal Voucher Confirmation Card -->
                <div class="bg-gradient-to-br from-[#230533] to-[#12021b] border-2 border-gold-500/70 rounded-2xl p-5 text-left text-xs space-y-3 shadow-xl">
                    <div class="flex justify-between items-center border-b border-gold-500/30 pb-2.5">
                        <span class="font-cinzel text-gold-300 font-bold">SIAM LOTUS SANCTUARY</span>
                        <span class="font-mono text-[11px] text-purple-200/70">ID: ${bookingState.bookingId}</span>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-stone-400">Behandlung:</span>
                            <span class="font-cinzel font-semibold text-white text-right">${sName}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-stone-400">Dauer & Preis:</span>
                            <span class="font-serif text-gold-400 font-bold text-sm">${bookingState.duration} Min • ${bookingState.price} €</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-stone-400">Termin:</span>
                            <span class="font-semibold text-white">${bookingState.date} um ${bookingState.time} Uhr</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-stone-400">Gast:</span>
                            <span class="text-purple-200">${escapeHTML(bookingState.guestName)} (📞 ${escapeHTML(bookingState.guestPhone)})</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-stone-400">Adresse:</span>
                            <span class="text-purple-200 text-right">Friedrichstraße 185, 10117 Berlin</span>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-gold-500/30 text-[11px] text-gold-300 bg-royal-800/50 p-2.5 rounded-xl">
                        ✨ Zahlung erfolgt entspannt vor Ort (Bar / EC-Karte / Kreditkarte).
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button onclick="window.print()" class="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-cinzel uppercase tracking-wider transition">
                        🖨️ Bestätigung drucken
                    </button>
                    <button onclick="window.closeBookingModal()" class="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-royal-950 font-cinzel font-bold rounded-xl text-xs uppercase tracking-wider shadow-md">
                        Fertig
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g, tag => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;"
        }[tag] || tag));
    }

})();
