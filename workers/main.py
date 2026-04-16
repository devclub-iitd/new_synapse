import os
import json
import asyncio
import logging
from contextlib import asynccontextmanager

import boto3
import firebase_admin
from firebase_admin import credentials, messaging
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Logging ──
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("worker")

# ── Firebase init ──
FIREBASE_CRED_PATH = os.environ.get("FIREBASE_SERVICE_ACCOUNT", os.path.join(os.path.dirname(__file__), "firebase-service-account.json"))

if os.path.exists(FIREBASE_CRED_PATH):
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred)
    logger.info("Firebase initialized from %s", FIREBASE_CRED_PATH)
else:
    logger.warning("Firebase service account not found at %s — push notifications will fail", FIREBASE_CRED_PATH)
    firebase_admin.initialize_app()

# ── SQS client ──
sqs = boto3.client(
    "sqs",
    region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
)
QUEUE_URL = os.environ["AWS_SQS_QUEUE_URL"]

# ── DB (for fetching device tokens) ──
import psycopg2

DATABASE_URL = os.environ["DATABASE_URL"]


def get_device_tokens(user_ids: list[int]) -> list[str]:
    """Fetch all FCM device tokens for the given user IDs."""
    if not user_ids:
        return []
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT DISTINCT device_token FROM user_devices WHERE user_id = ANY(%s)",
            (user_ids,),
        )
        tokens = [row[0] for row in cur.fetchall()]
        cur.close()
        return tokens
    finally:
        conn.close()


def send_push(tokens: list[str], title: str, body: str, redirect: str | None = None):
    """Send Firebase Cloud Messaging to a list of device tokens."""
    if not tokens:
        logger.info("No device tokens to push to")
        return

    data = {}
    if redirect:
        data["redirect"] = redirect

    message = messaging.MulticastMessage(
        tokens=tokens,
        notification=messaging.Notification(title=title, body=body),
        data=data,
        android=messaging.AndroidConfig(priority="high"),
        webpush=messaging.WebpushConfig(
            headers={"Urgency": "high"},
        ),
    )

    response = messaging.send_each_for_multicast(message)
    logger.info(
        "Push sent: %d success, %d failure",
        response.success_count,
        response.failure_count,
    )

    # Clean up invalid tokens
    for i, send_resp in enumerate(response.responses):
        if send_resp.exception:
            error_code = getattr(send_resp.exception, "code", "")
            if error_code in ("NOT_FOUND", "UNREGISTERED", "INVALID_ARGUMENT"):
                logger.info("Removing invalid token: %s...", tokens[i][:20])
                _remove_token(tokens[i])


def _remove_token(token: str):
    """Remove an invalid device token from the DB."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM user_devices WHERE device_token = %s", (token,))
        conn.commit()
        cur.close()
    finally:
        conn.close()


def process_message(body: dict):
    """Process a single SQS message."""
    msg_type = body.get("type", "")
    user_ids = body.get("to", [])
    title = body.get("title", "")
    msg_body = body.get("body", "")
    redirect = body.get("redirect")

    # Convert string IDs to ints
    int_ids = []
    for uid in user_ids:
        try:
            int_ids.append(int(uid))
        except (ValueError, TypeError):
            continue

    if msg_type in ("notification", "both"):
        tokens = get_device_tokens(int_ids)
        if tokens:
            send_push(tokens, title, msg_body, redirect)
        else:
            logger.info("No tokens found for users: %s", int_ids)

    if msg_type in ("mail", "both"):
        # TODO: mailing service
        logger.info("Mail handler not implemented yet — skipping mail for: %s", int_ids)


async def poll_sqs():
    """Long-poll SQS in a loop."""
    logger.info("Starting SQS polling on %s", QUEUE_URL)
    while True:
        try:
            response = await asyncio.to_thread(
                sqs.receive_message,
                QueueUrl=QUEUE_URL,
                MaxNumberOfMessages=10,
                WaitTimeSeconds=20,
            )

            messages = response.get("Messages", [])
            for msg in messages:
                try:
                    body = json.loads(msg["Body"])
                    logger.info("Processing: type=%s to=%s title=%s", body.get("type"), body.get("to"), body.get("title"))
                    process_message(body)
                except Exception as e:
                    logger.error("Failed to process message: %s — %s", msg.get("MessageId"), e)

                # Delete the message from the queue
                await asyncio.to_thread(
                    sqs.delete_message,
                    QueueUrl=QUEUE_URL,
                    ReceiptHandle=msg["ReceiptHandle"],
                )

        except Exception as e:
            logger.error("SQS poll error: %s", e)
            await asyncio.sleep(5)


# ── FastAPI app ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(poll_sqs())
    logger.info("Worker started")
    yield
    task.cancel()
    logger.info("Worker stopped")


app = FastAPI(title="Synapse Worker", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}
