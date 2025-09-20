# LegalDoc_GenAI/summarizer.py

import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.output_parsers.pydantic import PydanticOutputParser
from models import KmrlDocSummary, LastDateResponse, Department, DepartmentPredictionResponse
from datetime import date
from pydantic import BaseModel, Field
from typing import Optional, List

def get_model(api_key: str):
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.0,
        max_output_tokens=8192,
        google_api_key=api_key
    )

def generate_document_summary(document_content: str, language: str, department: str, google_api_key: str) -> KmrlDocSummary:
    model = get_model(google_api_key)
    parser = PydanticOutputParser(pydantic_object=KmrlDocSummary)

    department_instructions = {
        "Operations Department": "Focus on actionable items, deadlines, and personnel. Financials and compliance are less critical.",
        "Engineering & Maintenance Department": "Prioritize equipment details, actionable maintenance tasks, and safety risks. Financials are secondary.",
        "Procurement & Stores Department": "Extract equipment details, financial implications (costs, vendors), and deadlines.",
        "Safety & Regulatory Compliance Department": "Focus heavily on compliance risks, deadlines, and actionable items to ensure adherence.",
        "Human Resources (HR)": "Extract information related to personnel, policy changes, and deadlines.",
        "Finance & Accounts Department": "Prioritize financial implications, vendor details, and deadlines. Technical details are less important.",
        "Executive / Board of Directors": "Provide a high-level summary focusing on key points, financial implications, and major risks."
    }

    specific_instruction = department_instructions.get(department, "Provide a balanced summary covering all key aspects.")

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are an expert assistant for KMRL (Kochi Metro Rail Limited). Your task is to summarize documents for the {department}. {specific_instruction} Respond in a structured format."),
        ("human", "Summarize the following document for the {department} in {language}. "
         "The document content is: \n\n{document_content}\n\n"
         "{format_instructions}"
        )
    ]).partial(format_instructions=parser.get_format_instructions())
    
    chain = prompt | model | parser
    
    try:
        summary = chain.invoke({
            "language": language,
            "department": department,
            "document_content": document_content
        })
        return summary
    except Exception as e:
        return KmrlDocSummary(
            category="Error",
            description="Could not generate a summary due to an error.",
            key_points=[f"An error occurred: {str(e)}"],
            urgency_level="Low"
        )

def predict_department(document_content: str, google_api_key: str) -> DepartmentPredictionResponse:
    """
    Predicts all relevant departments for a given document.
    """
    model = get_model(google_api_key)
    parser = PydanticOutputParser(pydantic_object=DepartmentPredictionResponse)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert at routing documents within KMRL. Based on the document content, predict all relevant departments it may concern."),
        ("human", "Document content: \n\n{document_content}\n\n{format_instructions}")
    ]).partial(format_instructions=parser.get_format_instructions())

    chain = prompt | model | parser

    try:
        response = chain.invoke({"document_content": document_content})
        return response
    except Exception as e:
        # Fallback in case of an error to a default list
        return DepartmentPredictionResponse(predicted_departments=[Department.OPERATIONS])


def extract_last_date(document_content: str, google_api_key: str) -> Optional[date]:
    """
    Extracts the last date to take action from a document.
    """
    model = get_model(google_api_key)
    
    class LastDateExtractor(BaseModel):
        last_date: Optional[date] = Field(None, description="The last date to take action, in YYYY-MM-DD format. Return null if not found.")

    parser = PydanticOutputParser(pydantic_object=LastDateExtractor)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert legal assistant. Extract the final deadline or last date for action mentioned in the document. The date should be in YYYY-MM-DD format."),
        ("human", "Document content: \n\n{document_content}\n\n{format_instructions}")
    ]).partial(format_instructions=parser.get_format_instructions())

    chain = prompt | model | parser
    
    try:
        response = chain.invoke({"document_content": document_content})
        return response.last_date
    except Exception as e:
        print(f"Error extracting date: {e}")
        return None