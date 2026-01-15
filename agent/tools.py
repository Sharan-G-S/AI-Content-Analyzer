"""
Custom tools for the AI Content Analyzer agent.
"""
from langchain.tools import Tool
from langchain.pydantic_v1 import BaseModel, Field
import requests
from bs4 import BeautifulSoup
from typing import Optional
import json
import re


class TextAnalyzerInput(BaseModel):
    """Input for the text analyzer tool."""
    text: str = Field(description="The text to analyze")


class ImageAnalyzerInput(BaseModel):
    """Input for the image analyzer tool."""
    image_path: str = Field(description="Path to the image file")


class WebScraperInput(BaseModel):
    """Input for the web scraper tool."""
    url: str = Field(description="URL to scrape content from")


class CalculatorInput(BaseModel):
    """Input for the calculator tool."""
    expression: str = Field(description="Mathematical expression to evaluate")


def analyze_text(text: str) -> str:
    """
    Analyze text for sentiment, keywords, and provide a summary.
    This is a simplified version - in production, you'd use more sophisticated NLP.
    """
    # Basic sentiment analysis
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
                     'love', 'best', 'happy', 'perfect', 'beautiful']
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 
                     'poor', 'disappointing', 'sad', 'ugly']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        sentiment = "Positive"
    elif negative_count > positive_count:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    # Extract keywords (simple word frequency)
    words = re.findall(r'\b\w+\b', text_lower)
    word_freq = {}
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                  'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being'}
    
    for word in words:
        if word not in stop_words and len(word) > 3:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    keywords = [word for word, _ in top_keywords]
    
    # Basic stats
    word_count = len(words)
    char_count = len(text)
    sentence_count = len(re.findall(r'[.!?]+', text))
    
    result = {
        "sentiment": sentiment,
        "sentiment_score": f"+{positive_count - negative_count}" if positive_count >= negative_count else str(positive_count - negative_count),
        "keywords": keywords,
        "statistics": {
            "words": word_count,
            "characters": char_count,
            "sentences": sentence_count if sentence_count > 0 else 1
        }
    }
    
    return json.dumps(result, indent=2)


def analyze_image(image_path: str) -> str:
    """
    Analyze an image and provide description.
    This is a mock implementation - in production, you'd use computer vision APIs.
    """
    try:
        from PIL import Image
        import os
        
        if not os.path.exists(image_path):
            return json.dumps({"error": "Image file not found"})
        
        img = Image.open(image_path)
        
        # Get basic image properties
        width, height = img.size
        format_type = img.format
        mode = img.mode
        
        # Get dominant colors (simplified)
        img_small = img.resize((50, 50))
        pixels = list(img_small.getdata())
        
        # Calculate average color
        if mode == 'RGB' or mode == 'RGBA':
            avg_color = tuple(sum(p[i] for p in pixels) // len(pixels) for i in range(3))
            color_desc = f"RGB({avg_color[0]}, {avg_color[1]}, {avg_color[2]})"
        else:
            color_desc = "Grayscale or other mode"
        
        result = {
            "dimensions": f"{width}x{height}",
            "format": format_type,
            "mode": mode,
            "dominant_color": color_desc,
            "aspect_ratio": f"{width/height:.2f}",
            "description": f"This is a {format_type} image with dimensions {width}x{height} pixels. The image appears to have {color_desc} as a dominant color theme."
        }
        
        return json.dumps(result, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


def scrape_web_content(url: str) -> str:
    """
    Scrape and extract content from a URL.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title = soup.find('title')
        title_text = title.get_text().strip() if title else "No title found"
        
        # Extract meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '').strip() if meta_desc else "No description found"
        
        # Extract main content (paragraphs)
        paragraphs = soup.find_all('p')
        content_text = ' '.join([p.get_text().strip() for p in paragraphs[:5]])
        
        # Extract headings
        headings = []
        for tag in ['h1', 'h2', 'h3']:
            for heading in soup.find_all(tag)[:3]:
                headings.append(heading.get_text().strip())
        
        result = {
            "url": url,
            "title": title_text,
            "description": description,
            "headings": headings,
            "content_preview": content_text[:500] + "..." if len(content_text) > 500 else content_text,
            "status": "success"
        }
        
        return json.dumps(result, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "status": "failed"})


def calculate(expression: str) -> str:
    """
    Safely evaluate a mathematical expression.
    """
    try:
        # Remove any potentially dangerous characters
        allowed_chars = set('0123456789+-*/().,% ')
        if not all(c in allowed_chars for c in expression):
            return json.dumps({"error": "Invalid characters in expression"})
        
        # Evaluate safely
        result = eval(expression, {"__builtins__": {}}, {})
        
        return json.dumps({
            "expression": expression,
            "result": result
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


# Create LangChain tools
text_analyzer_tool = Tool(
    name="TextAnalyzer",
    func=analyze_text,
    description="Analyzes text for sentiment, extracts keywords, and provides statistics. Input should be the text to analyze."
)

image_analyzer_tool = Tool(
    name="ImageAnalyzer",
    func=analyze_image,
    description="Analyzes an image file and provides description, dimensions, colors, and other properties. Input should be the file path to the image."
)

web_scraper_tool = Tool(
    name="WebScraper",
    func=scrape_web_content,
    description="Scrapes content from a URL and extracts title, description, headings, and main content. Input should be a valid URL."
)

calculator_tool = Tool(
    name="Calculator",
    func=calculate,
    description="Performs mathematical calculations. Input should be a mathematical expression like '2 + 2' or '10 * 5 + 3'."
)

# Export all tools
ALL_TOOLS = [
    text_analyzer_tool,
    image_analyzer_tool,
    web_scraper_tool,
    calculator_tool
]
