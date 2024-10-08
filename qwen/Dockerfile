FROM python:3.10

RUN groupadd -r user && useradd -m -r -g user user

ENV PATH="$PATH:/home/user/.local/bin"

RUN apt-get update -y && apt-get install build-essential

COPY . /qwen

RUN chown -R user: /qwen

WORKDIR /qwen

USER user

RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt

CMD ["fastapi", "dev", "server.py", "--host", "0.0.0.0", "--port", "8000"]