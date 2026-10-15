import urllib.request
import hashlib
import json
import base64
import os
import time
import uuid

ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "")
API_TOKEN = os.environ.get("CF_API_TOKEN", "")
PROJECT_NAME = os.environ.get("CF_PROJECT_NAME", "siam-lotus-massage")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if not ACCOUNT_ID or not API_TOKEN:
    print("❌ Error: CF_ACCOUNT_ID and CF_API_TOKEN must be set as environment variables.")
    print("Example:")
    print("  export CF_ACCOUNT_ID=\"your_account_id\"")
    print("  export CF_API_TOKEN=\"your_api_token\"")
    print("  python3 deploy_cf_v2.py")
    exit(1)

STATIC_FILES = [
    "index.html",
    "styles.css",
    "services.js",
    "chatbot.js"
]

print("=== 1. Fetching Upload Token ===")
tok_url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/upload-token"
tok_req = urllib.request.Request(tok_url, headers={"Authorization": f"Bearer {API_TOKEN}"})
with urllib.request.urlopen(tok_req) as resp:
    jwt = json.loads(resp.read().decode("utf-8"))["result"]["jwt"]
print("Acquired JWT upload token.")

print("\n=== 2. Hashing Static Assets ===")
files_data = {}
manifest = {}
for fname in STATIC_FILES:
    fpath = os.path.join(BASE_DIR, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "rb") as f:
        data = f.read()
    md5 = hashlib.md5(data).hexdigest()
    manifest[f"/{fname}"] = md5
    
    mime = "text/html" if fname.endswith(".html") else "text/css" if fname.endswith(".css") else "application/javascript" if fname.endswith(".js") else "application/json"
    files_data[md5] = {
        "name": fname,
        "content": data,
        "mime": mime
    }
    print(f"File {fname:15} -> MD5: {md5} ({len(data)} bytes)")

print("\n=== 3. Checking Missing Hashes ===")
check_url = "https://api.cloudflare.com/client/v4/pages/assets/check-missing"
check_req = urllib.request.Request(
    check_url,
    data=json.dumps({"hashes": list(files_data.keys())}).encode("utf-8"),
    headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
)
with urllib.request.urlopen(check_req) as resp:
    check_res = json.loads(resp.read().decode("utf-8"))
    missing = check_res.get("result", [])
print(f"Missing hashes to upload: {len(missing)} / {len(files_data)}")

if missing:
    print("\n=== 4. Uploading Assets ===")
    upload_payload = []
    for h in missing:
        item = files_data[h]
        upload_payload.append({
            "key": h,
            "value": base64.b64encode(item["content"]).decode("ascii"),
            "metadata": {"contentType": item["mime"]},
            "base64": True
        })
    upload_url = "https://api.cloudflare.com/client/v4/pages/assets/upload"
    up_req = urllib.request.Request(
        upload_url,
        data=json.dumps(upload_payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(up_req) as resp:
        up_res = json.loads(resp.read().decode("utf-8"))
        print("Upload result:", up_res)

print("\n=== 5. Upserting Hashes ===")
upsert_url = "https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes"
upsert_req = urllib.request.Request(
    upsert_url,
    data=json.dumps({"hashes": list(files_data.keys())}).encode("utf-8"),
    headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
)
with urllib.request.urlopen(upsert_req) as resp:
    upsert_res = json.loads(resp.read().decode("utf-8"))
    print("Upsert result:", upsert_res)

print("\n=== 6. Creating Deployment with _worker.js and _routes.json ===")
with open(os.path.join(BASE_DIR, "_worker.js"), "rb") as f:
    worker_bytes = f.read()
with open(os.path.join(BASE_DIR, "_routes.json"), "rb") as f:
    routes_bytes = f.read()

boundary = uuid.uuid4().hex
parts = [
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"manifest\"\r\n\r\n{json.dumps(manifest)}\r\n".encode("utf-8"),
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"_worker.js\"; filename=\"_worker.js\"\r\nContent-Type: application/javascript\r\n\r\n".encode("utf-8") + worker_bytes + b"\r\n",
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"_routes.json\"; filename=\"_routes.json\"\r\nContent-Type: application/json\r\n\r\n".encode("utf-8") + routes_bytes + b"\r\n",
    f"--{boundary}--\r\n".encode("utf-8")
]
body = b"".join(parts)

dep_url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments"
dep_req = urllib.request.Request(dep_url, data=body, headers={
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": f"multipart/form-data; boundary={boundary}"
})

try:
    with urllib.request.urlopen(dep_req) as resp:
        dep_res = json.loads(resp.read().decode("utf-8"))
        dep_id = dep_res.get("result", {}).get("id")
        print(f"Deployment initiated: ID {dep_id}")
except urllib.error.HTTPError as e:
    print(f"Deployment HTTPError ({e.code}):", e.read().decode("utf-8"))
    exit(1)

print("\n=== 7. Polling Deployment Status ===")
poll_url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments/{dep_id}"
poll_req = urllib.request.Request(poll_url, headers={"Authorization": f"Bearer {API_TOKEN}"})

for i in range(15):
    time.sleep(2)
    with urllib.request.urlopen(poll_req) as resp:
        status_data = json.loads(resp.read().decode("utf-8"))
        latest_stage = status_data.get("result", {}).get("latest_stage", {})
        print(f"Stage: {latest_stage.get('name')} -> {latest_stage.get('status')}")
        if latest_stage.get("status") == "success":
            print("\n🎉 Deployment SUCCEEDED!")
            print(f"Production URL: https://{PROJECT_NAME}.pages.dev")
            break
        elif latest_stage.get("status") == "failure":
            print("\n❌ Deployment failed.")
            print(json.dumps(status_data, indent=2))
            break
