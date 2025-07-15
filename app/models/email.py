# app/models/email.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy import Boolean, Text
from sqlalchemy import Float

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
    # needs_reply = Column(Boolean, default=None)
    # reply_draft = Column(Text, nullable=True)

class AIMessageAnalysis(Base):
    __tablename__ = "ai_message_analysis"
    id = Column(Integer, primary_key=True)
    message_id = Column(String, ForeignKey("messages.message_id"), unique=True)
    
    needs_reply = Column(Boolean, default=None, nullable=True)
    summary = Column(Text, nullable=True)
    reply_draft = Column(Text, nullable=True)
    reply_confidence = Column(Float, nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)

