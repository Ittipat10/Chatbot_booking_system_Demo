# server.py - Local development server with Booking System & Workers AI proxy
import http.server
import socketserver
import json
import urllib.request
import urllib.error
import os
import csv
import time
import random
from datetime import datetime

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
BOOKINGS_JSON_PATH = os.path.join(DIRECTORY, "bookings.json")
BOOKINGS_CSV_PATH = os.path.join(DIRECTORY, "bookings.csv")

def load_bookings():
    if not os.path.exists(BOOKINGS_JSON_PATH):
        return []
    try:
        with open(BOOKINGS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_bookings(bookings):
    with open(BOOKINGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(bookings, f, ensure_ascii=False, indent=2)

def append_to_csv(booking):
    file_exists = os.path.exists(BOOKINGS_CSV_PATH)
    fields = [
        "booking_id", "created_at", "date", "time", "service_name", 
        "duration", "price", "customer_name", "customer_phone", 
        "customer_email", "notes", "source", "status"
    ]
    with open(BOOKINGS_CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        if not file_exists:
            writer.writeheader()
        writer.writerow({
            "booking_id": booking.get("id"),
            "created_at": booking.get("createdAt"),
            "date": booking.get("date"),
            "time": booking.get("time"),
            "service_name": booking.get("serviceName"),
            "duration": booking.get("duration"),
            "price": booking.get("price"),
            "customer_name": booking.get("customerName"),
            "customer_phone": booking.get("customerPhone"),
            "customer_email": booking.get("customerEmail", ""),
            "notes": booking.get("notes", ""),
            "source": booking.get("source", "web"),
            "status": booking.get("status", "confirmed")
        })

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CF-Account, X-CF-Token")
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/bookings":
            bookings = load_bookings()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "bookings": bookings}, ensure_ascii=False).encode("utf-8"))
            return
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}

        # ----------------------------------------------------
        # 1. BOOKING ENDPOINT: POST /api/book
        # ----------------------------------------------------
        if self.path == "/api/book":
            customer_name = body.get("customerName", "").strip()
            customer_phone = body.get("customerPhone", "").strip()
            service_name = body.get("serviceName", "Traditionelle Thaimassage").strip()
            date = body.get("date", "").strip()
            time_slot = body.get("time", "").strip()
            duration = body.get("duration", 60)
            price = body.get("price", 65)
            notes = body.get("notes", "").strip()
            source = body.get("source", "web_modal")

            if not customer_name or not customer_phone:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Name und Telefonnummer sind erforderlich."}).encode("utf-8"))
                return

            booking_id = "SL-" + str(random.randint(100000, 999999))
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            new_booking = {
                "id": booking_id,
                "createdAt": now_iso,
                "customerName": customer_name,
                "customerPhone": customer_phone,
                "customerEmail": body.get("customerEmail", "").strip(),
                "serviceId": body.get("serviceId", ""),
                "serviceName": service_name,
                "duration": duration,
                "price": price,
                "date": date,
                "time": time_slot,
                "notes": notes,
                "source": source,
                "status": "confirmed"
            }

            # Save to JSON database
            bookings = load_bookings()
            bookings.insert(0, new_booking) # newest first
            save_bookings(bookings)

            # Append to CSV database
            try:
                append_to_csv(new_booking)
            except Exception as e:
                print(f"Warning: Could not write to bookings.csv: {e}")

            # Simulated Shop Notification Alert in Terminal
            print("\n" + "=" * 62)
            print("🔔 [NEUE TERMINBUCHUNG / มีการจองคิวใหม่เข้ามา!]")
            print(f"   Buchungs-ID:  {booking_id}")
            print(f"   Kunde/Gast:   {customer_name} (📞 {customer_phone})")
            print(f"   Behandlung:   {service_name} ({duration} Min)")
            print(f"   Termin:       {date} um {time_slot} Uhr")
            print(f"   Preis:        {price} €")
            if notes:
                print(f"   Notizen:      {notes}")
            print(f"   Buchungsweg:  {source}")
            print(f"   Gespeichert:  bookings.json & bookings.csv")
            print("=" * 62 + "\n")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "bookingId": booking_id,
                "booking": new_booking,
                "message": "Termin erfolgreich reserviert!"
            }, ensure_ascii=False).encode("utf-8"))
            return

        # ----------------------------------------------------
        # 2. CANCEL BOOKING ENDPOINT: POST /api/bookings/cancel
        # ----------------------------------------------------
        elif self.path == "/api/bookings/cancel":
            b_id = body.get("id")
            bookings = load_bookings()
            updated = False
            for b in bookings:
                if b.get("id") == b_id:
                    b["status"] = "cancelled"
                    updated = True
                    break
            if updated:
                save_bookings(bookings)
                print(f"⚠️ [BOOKING CANCELLED] ID: {b_id}")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "id": b_id}).encode("utf-8"))
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Booking not found"}).encode("utf-8"))
            return

        # ----------------------------------------------------
        # 3. CHATBOT ENDPOINT: POST /api/chat
        # ----------------------------------------------------
        elif self.path == "/api/chat":
            message = body.get("message", "")
            history = body.get("history", [])
            language = body.get("language", "auto")
            account_id = body.get("cf_account_id") or self.headers.get("X-CF-Account") or os.environ.get("CF_ACCOUNT_ID", "")
            api_token = body.get("cf_api_token") or self.headers.get("X-CF-Token") or os.environ.get("CF_API_TOKEN", "")
            model = body.get("cf_model") or os.environ.get("CF_AI_MODEL", "@cf/meta/llama-3.1-8b-instruct-fast")

            # If no Cloudflare access, return fallback answer
            if not account_id or not api_token:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "response": "Sawadee kha! Willkommen bei Siam Lotus Berlin. Wie kann ich Ihnen bei der Wahl Ihrer Massage behilflich sein?"
                }).encode("utf-8"))
                return

            cf_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}"
            
            lang_instruction = "Thai (ภาษาไทย สุภาพ ลงท้ายด้วยค่ะ)" if language == "th" else "English" if language == "en" else "German (Deutsch)"
            system_prompt = (
                f"You are Jasmin 🌸, a polite, experienced Thai wellness and massage consultant at Siam Lotus Berlin "
                f"(Friedrichstraße 185, 10117 Berlin). Respond warmly in {lang_instruction}. "
                f"Give expert advice about Thai massage (Wat Pho, Nuad Thai), office syndrome, back pain, and studio bookings."
            )

            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-5:]:
                messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": message})

            req_body = json.dumps({
                "messages": messages,
                "max_tokens": 512,
                "temperature": 0.7
            }).encode("utf-8")

            req = urllib.request.Request(cf_url, data=req_body, method="POST")
            req.add_header("Authorization", f"Bearer {api_token}")
            req.add_header("Content-Type", "application/json")

            try:
                with urllib.request.urlopen(req) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    result = resp_data.get("result", {})
                    ai_text = result.get("response")
                    if not ai_text and "choices" in result and len(result["choices"]) > 0:
                        ai_text = result["choices"][0].get("message", {}).get("content", "")

                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"response": ai_text}).encode("utf-8"))
            except Exception as e:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "response": "Sawadee kha! Willkommen bei Siam Lotus Berlin. Unsere Therapeutinnen freuen sich auf Ihren Besuch."
                }).encode("utf-8"))
        else:
            super().do_POST()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    ports_to_try = [8088, 8000, 8080, 8888, 3000, 5000]
    httpd = None
    active_port = None

    for p in ports_to_try:
        try:
            httpd = socketserver.TCPServer(("", p), Handler)
            active_port = p
            break
        except OSError:
            continue

    if not httpd:
        print("Could not bind to any test port.")
        exit(1)

    with httpd:
        print(f"✨ Siam Lotus Server is running at: http://localhost:{active_port}")
        print(f"📋 Admin Dashboard: http://localhost:{active_port}/admin.html")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
