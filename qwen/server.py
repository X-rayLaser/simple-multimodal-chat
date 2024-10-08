from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, AutoProcessor
from qwen_vl_utils import process_vision_info
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json
app = FastAPI()

# default: Load the model on the available device(s)
model = Qwen2VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-VL-7B-Instruct", torch_dtype="auto"
)

# default processer
processor = AutoProcessor.from_pretrained("Qwen/Qwen2-VL-7B-Instruct")


def prepare_msg(msg):
    if not isinstance(msg, dict):
        raise BadMessageError(msg)

    if not ("role" in msg and "content" in msg):
        raise BadMessageError(msg)

    content = msg["content"]
    if isinstance(content, str):
        return msg
    
    if not isinstance(content, list):
        raise BadMessageContentError(content)

    items = [prepare_content_item(content, item) for item in content]
    return {
        "role": msg["role"],
        "content": items
    }


def prepare_content_item(content, item):
    if isinstance(item, str):
        return item

    if not isinstance(item, dict):
        raise BadMessageContentError(content, item)
    try:
        if item["type"] == "text":
            return {"type": "text", "text": item["text"]}
        elif item["type"] == "image_url":
            image_field = item["image_url"]
            if isinstance(image_field, str):
                image = image_field
            elif isinstance(image_field, dict):
                image = image_field["url"]
            else:
                raise BadMessageContentError(content, item)
            
            return { "type": "image", "image": image }
    except KeyError:
        raise BadMessageContentError(content, item)


class BadMessageError(Exception):
    def __str__(self) -> str:
        return f'Malformed message format: "{self.args[0]}"'


class BadMessageContentError(BadMessageError):
    def __str__(self) -> str:
        return f'Malformed message content. Message content: "{self.args[0]}". Offending item: "{self.args[1]}"'



def generate_response(messages):
    text = processor.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    image_inputs, video_inputs = process_vision_info(messages)
    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt",
    )
    inputs = inputs.to("cpu")

    # Inference: Generation of the output
    generated_ids = model.generate(**inputs, max_new_tokens=256)
    generated_ids_trimmed = [
        out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    output_text = processor.batch_decode(
        generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
    )
    print(output_text[0])

    d = {
        "choices": [{
            "delta": {
                "content": output_text[0]
            }
        }]
    }
    json_obj = json.dumps(d)
    yield f'data: {json_obj}\n\n'


class ChatCompletionJob(BaseModel):
    messages: List[Dict[str, Any]]
    model: str = None
    params: Dict[str, Any] = None


@app.post("/v1/chat/completions")
def create_item(job: ChatCompletionJob):
    try:
        messages = [prepare_msg(msg) for msg in job.messages]
    except BadMessageError as e:
        raise HTTPException(status_code=400, detail=str(e))
    else:
        return StreamingResponse(generate_response(messages), media_type='text/event-stream')
