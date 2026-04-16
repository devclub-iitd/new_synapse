
from pydantic import BaseModel, Field
from typing import List
from enum import Enum
from datetime import datetime
import boto3
import os

from dotenv import load_dotenv
load_dotenv()


class EventType(str, Enum):
    MAIL = "mail"
    NOTIFICATION = "notification"
    BOTH="both"


class SQSEvent(BaseModel):
    type: EventType
    to: List[str]= Field(default_factory=list)
    title: str = Field(..., max_length=100)
    body: str
    redirect: str = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


sqs = boto3.client("sqs")
QUEUE_URL = os.environ.get("AWS_SQS_QUEUE_URL")


def send_event(event: SQSEvent):
    response = sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=event.model_dump_json()
    )
    return response