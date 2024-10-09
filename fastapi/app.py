from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import openai
from openai import DefaultHttpxClient
import os


http_proxy = os.environ.get("http_proxy_url")
https_proxy = os.environ.get("https_proxy_url", http_proxy)
print("http proxy", http_proxy)
print("https proxy", https_proxy)

if http_proxy or https_proxy:
    proxies = {
        "http://": http_proxy,
        "https://": https_proxy,
    }
else:
    proxies = None

http_client = DefaultHttpxClient(
    proxies=proxies
)


origins = [
    "http://localhost:3000",
]

class ChatCompletionJob(BaseModel):
    model: str
    base_url: str
    messages: List[Dict[str, Any]]
    params: Dict[str, Any] = None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_response(job):
    timeout = 30 * 60 # 30 minutes
    client = openai.OpenAI(
        base_url=f"{job.base_url}/v1",
        api_key="sk-no-key-required",
        timeout=timeout,
        http_client=http_client
    )

    stream = client.chat.completions.create(
        model=job.model,
        messages=job.messages,
        stream=True,
        extra_body={"cache_prompt": True}
    )
    print("about to start reading stream")
    for chunk in stream:
        chunk_text = chunk.choices[0].delta.content or ""
        yield chunk_text


@app.post("/make_response/")
def create_item(job: ChatCompletionJob):
    return StreamingResponse(generate_response(job), media_type='text/event-stream')
