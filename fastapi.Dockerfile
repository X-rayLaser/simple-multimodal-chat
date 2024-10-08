FROM python:3.10

RUN groupadd -r user && useradd -m -r -g user user

ENV PATH="$PATH:/home/user/.local/bin"

RUN apt-get update -y && apt-get install build-essential

COPY ./fastapi /fastapi

RUN chown -R user: /fastapi

WORKDIR /fastapi

USER user

RUN pip install -r requirements.txt

CMD ["fastapi", "dev", "app.py", "--host", "0.0.0.0", "--port", "8000"]