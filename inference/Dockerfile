# Gargi inference -- container image, deployed to Cloud Run.
# See deploy/gcp/ for the deploy script and the reasoning behind the settings.
FROM python:3.11-slim

# Cloud Run injects PORT (8080 by default) and app.py honours it; the value
# here is only the local default.
ENV PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface \
    PORT=8080 \
    TORCH_THREADS=2

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY model.py app.py ./

# Bake both checkpoints into the image rather than fetching them at startup.
# On Cloud Run this is the difference between a cold start that unpacks a local
# layer and one that pulls 880 MB from the Hub before it can serve anything.
ARG INSTRUCT_REPO=gishnu/malayalam-nanogpt-instruct-v3-100M
ARG BASE_REPO=gishnu/malayalam-nanogpt-base-v3-100M
RUN python -c "\
from huggingface_hub import hf_hub_download; \
[hf_hub_download(r, f) for r in ['${INSTRUCT_REPO}', '${BASE_REPO}'] \
                       for f in ['pytorch_model.bin', 'tokenizer.json']]"

# Run unprivileged. Cloud Run does not require it, but there is no reason for
# an inference service that only reads weights to run as root.
RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

EXPOSE 8080
CMD ["python", "app.py"]
