# LegalDoc_GenAI/models.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from enum import Enum

class Department(str, Enum):
    OPERATIONS = "Operations Department"
    ENGINEERING_MAINTENANCE = "Engineering & Maintenance Department"
    PROCUREMENT_STORES = "Procurement & Stores Department"
    SAFETY_REGULATORY = "Safety & Regulatory Compliance Department"
    HR = "Human Resources (HR)"
    FINANCE_ACCOUNTS = "Finance & Accounts Department"
    EXECUTIVE = "Executive / Board of Directors"

class KmrlDocSummary(BaseModel):
    # Common fields for all departments
    category: str = Field(..., description="Category/type of the document (e.g., Incident Report, Maintenance Job Card, Invoice, Safety Circular).")
    description: str = Field(..., description="A concise 2-3 line overview of the document's main purpose.")
    key_points: List[str] = Field(..., description="Bulleted list of the most critical points or takeaways from the document.")
    urgency_level: str = Field(..., description="Categorical urgency level (e.g., High, Medium, Low).")
    
    # Department-specific optional fields
    actionable_items: Optional[List[str]] = Field(None, description="Specific, actionable tasks or next steps required.")
    deadlines: Optional[List[str]] = Field(None, description="Key dates, deadlines, or timeline events mentioned.")
    involved_personnel: Optional[List[str]] = Field(None, description="Names or roles of individuals/teams mentioned.")
    financial_implications: Optional[str] = Field(None, description="Summary of financial costs, figures, or budget impacts.")
    compliance_risks: Optional[List[str]] = Field(None, description="Potential risks related to safety, regulations, or compliance.")
    equipment_details: Optional[List[str]] = Field(None, description="Details about specific equipment, assets, or parts mentioned.")

class SummaryRequest(BaseModel):
    document_content: str
    language: str
    department: str

class SummaryResponse(BaseModel):
    summary: KmrlDocSummary
    is_summarized: bool

class ChatRequest(BaseModel):
    conversation_id: str
    query: str

class LastDateResponse(BaseModel):
    last_date: Optional[date] = Field(..., description="The last date to take action mentioned in the document.")

class DepartmentPredictionRequest(BaseModel):
    document_content: str

class DepartmentPredictionResponse(BaseModel):
    predicted_departments: List[Department] = Field(..., description="A list of all likely departments for this document.")