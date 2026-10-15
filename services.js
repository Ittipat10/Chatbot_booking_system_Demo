// services.js - Massage Services and Shop Data
const SHOP_INFO = {
    name: "Siam Lotus Wellness & Traditionelle Thaimassage",
    city: "Berlin",
    address: "Friedrichstraße 185, 10117 Berlin",
    phone: "+49 (0)30 1234 5678",
    email: "kontakt@siamlotus-massage.de",
    openingHours: {
        de: "Mo - Sa: 10:00 - 20:00 Uhr | So & Feiertage: 11:00 - 18:00 Uhr",
        en: "Mon - Sat: 10:00 AM - 8:00 PM | Sun & Holidays: 11:00 AM - 6:00 PM",
        th: "จันทร์ - เสาร์: 10:00 - 20:00 น. | อาทิตย์และวันหยุด: 11:00 - 18:00 น."
    }
};

const SERVICES = [
    {
        id: "trad-thai",
        name: {
            de: "Traditionelle Thaimassage (Nuad Thai)",
            en: "Traditional Thai Massage (Nuad Thai)",
            th: "นวดแผนไทยโบราณ (นวดราชสำนัก/เชลยศักดิ์)"
        },
        shortDesc: {
            de: "Ganzkörpermassage mit Akupressur, passiven Dehnbewegungen und Energiebahn-Stimulation ohne Öl.",
            en: "Full body treatment with acupressure and yoga-like stretching without oil.",
            th: "นวดกดจุดตามเส้นประธานสิบและยืดเหยียดร่างกายสไตล์โยคะ ไม่ใช้น้ำมัน"
        },
        durations: [
            { duration: 60, price: 65, label: "60 Min - 65 €" },
            { duration: 90, price: 92, label: "90 Min - 92 € (Empfohlen)" },
            { duration: 120, price: 120, label: "120 Min - 120 €" }
        ],
        icon: "sparkles",
        tag: "Beliebt / Popular"
    },
    {
        id: "aroma-oil",
        name: {
            de: "Aromaöl-Entspannungsmassage",
            en: "Aromatherapy Oil Massage",
            th: "นวดน้ำมันอโรมาผ่อนคลาย"
        },
        shortDesc: {
            de: "Sanfte, fließende Massage mit warmen duftenden ätherischen Bio-Ölen zum tiefen Stressabbau.",
            en: "Gentle relaxing massage with warm organic essential oils to relieve deep stress.",
            th: "นวดสัมผัสนุ่มนวลด้วยน้ำมันหอมระเหยอุ่นๆ ช่วยผ่อนคลายความเครียดสะสม"
        },
        durations: [
            { duration: 60, price: 70, label: "60 Min - 70 €" },
            { duration: 90, price: 98, label: "90 Min - 98 € (Bestseller)" },
            { duration: 120, price: 130, label: "120 Min - 130 €" }
        ],
        icon: "heart",
        tag: "Bestseller"
    },
    {
        id: "back-neck",
        name: {
            de: "Rücken-, Schulter- & Nackenmassage",
            en: "Back, Neck & Shoulder Massage",
            th: "นวดเน้นคอ บ่า ไหล่ และหลัง"
        },
        shortDesc: {
            de: "Gezielte Behandlung gegen Verspannungen durch Büroarbeit und Bildschirmstress.",
            en: "Targeted therapy specifically for office tension, computer neck and back relief.",
            th: "นวดคลายอาการออฟฟิศซินโดรม เน้นคลายกล้ามเนื้อคอ บ่า และสะบักหลัง"
        },
        durations: [
            { duration: 30, price: 40, label: "30 Min - 40 €" },
            { duration: 60, price: 65, label: "60 Min - 65 €" },
            { duration: 90, price: 92, label: "90 Min - 92 €" }
        ],
        icon: "shield",
        tag: "Office Relief"
    },
    {
        id: "foot-reflex",
        name: {
            de: "Fußreflexzonenmassage",
            en: "Foot Reflexology Massage",
            th: "นวดกดจุดสะท้อนเท้า"
        },
        shortDesc: {
            de: "Vitalisierende Fuß- und Wadenmassage mit speziellem Holzmassagestab und Kräuterbalsam.",
            en: "Stimulating foot and calf treatment using traditional wooden stick and herbal balm.",
            th: "นวดฝ่าเท้าและน่องด้วยไม้กดจุดและบาล์มสมุนไพร กระตุ้นระบบหมุนเวียนโลหิต"
        },
        durations: [
            { duration: 30, price: 38, label: "30 Min - 38 €" },
            { duration: 60, price: 65, label: "60 Min - 65 €" }
        ],
        icon: "activity",
        tag: "Vitalisierend"
    },
    {
        id: "herbal-stamp",
        name: {
            de: "Traditionelle Kräuterstempelmassage",
            en: "Hot Herbal Compress Massage",
            th: "นวดประคบสมุนไพรสดสูตรไทยโบราณ"
        },
        shortDesc: {
            de: "Gedämpfte thailändische Kräuterbeutel fördern die Durchblutung und lockern tiefe Muskelverspannungen.",
            en: "Steamed medicinal Thai herb sachets to boost circulation and relieve stiff muscles.",
            th: "ลูกประคบสมุนไพรร้อนกลิ่นหอมกรุ่น คลายเส้นตึงและบรรเทาอาการปวดเมื่อยลึก"
        },
        durations: [
            { duration: 60, price: 80, label: "60 Min - 80 €" },
            { duration: 90, price: 110, label: "90 Min - 110 €" }
        ],
        icon: "sun",
        tag: "Premium"
    },
    {
        id: "royal-silk",
        name: {
            de: "The Royal Siam Silk Ritual",
            en: "The Royal Siam Silk Ritual",
            th: "รอยัล สยาม ซิลค์ ริชวล (พิธีกรรมนวดบนผ้าไหมหลวง)"
        },
        shortDesc: {
            de: "Königliches 120-Minuten-Ritual: Fußbad, Wat Pho Dehnung, Bio-Aromaöl & Kräuterstempel auf Seide.",
            en: "120-minute Royal ceremony: Jasmine foot bath, Wat Pho stretches, warm oils & herbal stamps on Thai silk.",
            th: "พิธีนวดชั้นสูง 120 นาที: สปาเท้าดอกมะลิ นวดราชสำนัก น้ำมันอโรมาอุ่น และประคบสมุนไพรบนผ้าไหมแท้"
        },
        durations: [
            { duration: 120, price: 145, label: "120 Min - 145 € (Signature Ritual)" }
        ],
        icon: "crown",
        tag: "Signature"
    }
];

const TIME_SLOTS = [
    "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"
];

const FAQS = [
    {
        q: ["parken", "parkplatz", "parking", "parkmöglichkeiten", "ที่จอดรถ"],
        a: "Direkt vor dem Studio gibt es Parkplätze an der Friedrichstraße (mit Parkschein) sowie das Parkhaus 'Quartier 205' in 2 Minuten Fußweg."
    },
    {
        q: ["zahlung", "bezahlen", "bezahlung", "karte", "bar", "ec", "payment", "จ่ายเงิน"],
        a: "Sie können bei uns ganz bequem vor Ort in Bar oder mit EC-Karte / Kreditkarte (Visa, Mastercard) sowie Apple Pay / Google Pay bezahlen."
    },
    {
        q: ["kleidung", "ausziehen", "anziehen", "clothes", "แต่งกาย"],
        a: "Für die traditionelle Thaimassage stellen wir Ihnen bequeme Baumwollkleidung bereit. Bei der Aromaölmassage erhalten Sie Einwegunterwäsche und werden diskret mit warmen Tüchern abgedeckt."
    },
    {
        q: ["adresse", "wo", "wohnen", "ort", "standort", "lage", "address", "ที่อยู่", "เดินทาง"],
        a: "Wir befinden uns in der Friedrichstraße 185, 10117 Berlin (U-Bahn Stadtmitte U2/U6, ca. 2 Min Fußweg)."
    },
    {
        q: ["gutschein", "geschenkgutschein", "voucher", "gift", "กิ๊ฟวอยเชอร์"],
        a: "Ja, Geschenkgutscheine können Sie direkt bei uns im Studio erwerben oder sprechen Sie uns im Chat an, wir senden Ihnen gerne einen digitalen Gutschein zum Ausdrucken!"
    }
];
