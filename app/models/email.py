# app/models/email.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Thread(Base):
    __tablename__ = "threads"
    id = Column(Integer, primary_key=True)
    thread_id = Column(String, unique=True)
    subject = Column(Text)
    snippet = Column(Text)
    history_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    message_id = Column(String, unique=True)
    thread_id = Column(String, ForeignKey("threads.thread_id"))
    sender = Column(Text)
    recipient = Column(Text)
    subject = Column(Text)
    body = Column(Text)
    sent_at = Column(DateTime)
