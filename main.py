from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from typing import List
import secrets
import uvicorn
from services.google_indexing import google_indexing
from services.indexnow import indexnow_engine
from services.speedy_index import speedy_index_engine
from services.mega_pubsub import mega_pubsub_engine
from services.social_syndication import social_syndication
from services.gsc_inspection import gsc_inspection_engine
from services.news_publisher import news_publisher
from services.github_suite import github_suite
from services.real_human_bot import real_human_bot
from services.stealth_grey_hat import stealth_grey_hat
from services.pbn_syndication import pbn_syndication


app = FastAPI(title="AI Fast Indexing Engine (Python)")

# Mount frontend
app.mount("/public", StaticFiles(directory="public"), name="public")

security = HTTPBasic()

TARGET_USER = {
    "email": "sj7835860705@gmail.com",
    "password": "@Support9267"
}

def verify_auth(credentials: HTTPBasicCredentials = Depends(security)):
    is_correct_username = secrets.compare_digest(credentials.username, TARGET_USER["email"])
    is_correct_password = secrets.compare_digest(credentials.password, TARGET_USER["password"])
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

class UrlSubmitRequest(BaseModel):
    urls: List[str]

@app.get("/")
async def serve_frontend():
    return FileResponse("public/index.html")

@app.get("/login.html")
async def serve_login():
    return FileResponse("public/index.html") # fallback since no login.html

async def process_urls_in_background(urls: List[str]):
    print(f"[Background] Starting automated processing for {len(urls)} URLs...")
    
    # 1. Google Indexing API
    for url in urls:
        google_indexing.submit_url(url)
        
    # 2. IndexNow Protocol
    await indexnow_engine.submit_indexnow_batch(urls)
    
    # 3. SpeedyIndex Engine
    await speedy_index_engine.submit_batch(urls)
    
    # 4. Mega PubSubHubbub Syndication
    for url in urls:
        await mega_pubsub_engine.dispatch_mega_pubsub(url)
    
    # 5. Social Media Syndication
    for url in urls:
        await social_syndication.syndicate_to_social_hubs(url)
        
    # 6. GSC Request Indexing
    # Usually GSC is done on the gateway domain, passing 'localhost' as fallback host
    for url in urls:
        await gsc_inspection_engine.process_url(url, url, "ai-fast-indexing-engine.vercel.app")
        
    # 7. News Publisher Broadcast
    await news_publisher.execute_news_priority_broadcast(urls)
    
    # 8. GitHub Master Suite
    await github_suite.run_github_master_suite(urls)
    
    # 9. Real Human Bot Daemon
    await real_human_bot.register_urls(urls)
    
    # 10. Stealth Grey Hat Indexing
    for url in urls:
        await stealth_grey_hat.execute_stealth_indexing(url)
        
    # 11. PBN Syndication Engine
    for url in urls:
        await pbn_syndication.syndicate_to_pbn(url)
    
    print("[Background] Processing complete.")

@app.get("/fui-api/api/indexing/refresh-status")
async def refresh_status():
    from services.cache_manager import cache_manager
    credits = cache_manager.data.get("credits", 1000)
    sa = cache_manager.get_service_account()
    return {
        "creditsRemaining": credits,
        "serviceAccountConfigured": sa.get("client_email") is not None,
        "serviceAccountEmail": sa.get("client_email", "")
    }

@app.post("/fui-api/api/indexing/diagnose")
async def diagnose(payload: dict):
    # Dummy diagnose for frontend pending status
    return {"googleIndexed": False}

@app.post("/fui-api/api/indexing/add-credits")
async def add_credits(payload: dict):
    from services.cache_manager import cache_manager
    cache_manager.data["credits"] = cache_manager.data.get("credits", 0) + payload.get("amount", 50)
    cache_manager.save_data()
    return {"success": True, "creditsRemaining": cache_manager.data["credits"]}

@app.post("/fui-api/api/indexing/submit")
async def submit_urls(request: UrlSubmitRequest, background_tasks: BackgroundTasks):
    print(f"Received {len(request.urls)} URLs. Offloading to background tasks.")
    
    # Add to background queue so the API returns instantly
    background_tasks.add_task(process_urls_in_background, request.urls)
    
    results = []
    for u in request.urls:
        results.append({
            "status": "success",
            "url": u,
            "gatewayUrl": None
        })
        
    return {
        "success": True,
        "submitted": len(request.urls),
        "failed": 0,
        "creditsUsed": len(request.urls),
        "results": results
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
