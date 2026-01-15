# 🤖 AI Content Analyzer

A complete AI agent application that intelligently analyzes text, images, and web content using LangChain and OpenAI GPT-4. Features a beautiful, modern web interface with real-time chat interaction.

![AI Content Analyzer](https://img.shields.io/badge/AI-Agent-blue) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![Flask](https://img.shields.io/badge/Flask-3.0-red) ![LangChain](https://img.shields.io/badge/LangChain-0.1-yellow)

## ✨ Features

### 🎯 Core Capabilities
- **Text Analysis**: Sentiment analysis, keyword extraction, and statistical insights
- **Image Analysis**: Image properties, color analysis, and descriptions
- **Web Scraping**: Extract content, metadata, and summaries from URLs
- **Mathematical Calculations**: Perform complex calculations
- **Multi-step Reasoning**: Agent can chain multiple tools to solve complex queries

### 🎨 User Interface
- Modern dark theme with glassmorphism effects
- Smooth animations and transitions
- Real-time chat interface
- File upload with drag-and-drop support
- URL input for web content analysis
- Responsive design for all devices

### 🧠 AI Agent Features
- Powered by LangChain framework
- Uses OpenAI GPT-4 for intelligent reasoning
- Conversation memory for context-aware responses
- Custom tool integration
- Error handling and graceful degradation

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone or navigate to the project directory**
```bash
cd ai-content-analyzer
```

2. **Create a virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

5. **Run the application**
```bash
python app.py
```

6. **Open your browser**
Navigate to: `http://localhost:5000`

## 📖 Usage Examples

### Text Analysis
```
User: "Analyze this text: I absolutely love this product! It's amazing and works perfectly."
Agent: [Uses TextAnalyzer tool to provide sentiment, keywords, and statistics]
```

### Image Analysis
1. Click "Upload Image" in the sidebar
2. Select an image file
3. Ask: "What can you tell me about this image?"
4. Agent analyzes and describes the image

### Web Content Analysis
```
User: "Analyze this website: https://example.com"
Agent: [Uses WebScraper tool to extract and summarize content]
```

### Complex Multi-step Query
```
User: "Analyze the sentiment of the homepage at https://example.com and calculate the average word count per paragraph"
Agent: [Chains WebScraper and Calculator tools to solve the query]
```

## 🏗️ Architecture

### Backend Components

```
ai-content-analyzer/
├── app.py                 # Flask API server
├── agent/
│   ├── __init__.py       # Package initialization
│   ├── core.py           # AI agent implementation
│   └── tools.py          # Custom tools (analyzers)
├── static/
│   ├── index.html        # Main UI
│   ├── css/
│   │   └── styles.css    # Premium styling
│   └── js/
│       └── app.js        # Frontend logic
├── uploads/              # Temporary file storage
├── requirements.txt      # Python dependencies
└── .env                  # Configuration (not in repo)
```

### Technology Stack

**Backend:**
- Flask 3.0 - Web framework
- LangChain 0.1 - AI agent orchestration
- OpenAI GPT-4 - Language model
- BeautifulSoup4 - Web scraping
- Pillow - Image processing

**Frontend:**
- Vanilla JavaScript - No framework overhead
- Modern CSS3 - Glassmorphism, gradients, animations
- Google Fonts (Inter) - Premium typography

## 🔧 API Endpoints

### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "agent_ready": true,
  "message": "AI Content Analyzer is running"
}
```

### `POST /api/analyze`
Main analysis endpoint

**Request (multipart/form-data):**
- `message` (string): User's question or request
- `file` (file, optional): Image file to analyze
- `url` (string, optional): URL to analyze

**Response:**
```json
{
  "success": true,
  "response": "Analysis results..."
}
```

### `POST /api/reset`
Reset conversation memory

**Response:**
```json
{
  "success": true,
  "message": "Conversation reset successfully"
}
```

## 🛠️ Customization

### Adding New Tools

1. Create a new tool function in `agent/tools.py`:
```python
def my_custom_tool(input_text: str) -> str:
    # Your tool logic here
    return result

my_tool = Tool(
    name="MyTool",
    func=my_custom_tool,
    description="Description of what this tool does"
)
```

2. Add to `ALL_TOOLS` list:
```python
ALL_TOOLS = [
    text_analyzer_tool,
    image_analyzer_tool,
    web_scraper_tool,
    calculator_tool,
    my_tool  # Add your tool
]
```

### Customizing the UI

Edit `static/css/styles.css` to change:
- Color scheme (`:root` variables)
- Layout and spacing
- Animations and transitions
- Typography

## 🎨 Design System

The application uses a carefully crafted design system:

**Colors:**
- Primary: Indigo (#6366f1)
- Secondary: Pink (#ec4899)
- Accent: Teal (#14b8a6)
- Background: Dark slate with gradients

**Typography:**
- Font: Inter (Google Fonts)
- Monospace: Fira Code

**Effects:**
- Glassmorphism with backdrop blur
- Smooth gradient transitions
- Micro-animations on hover
- Custom scrollbars

## 🔒 Security Considerations

- File uploads are restricted to image types only
- Maximum file size: 16MB
- Uploaded files are stored temporarily
- Calculator tool uses safe evaluation
- CORS enabled for development (configure for production)

## 🐛 Troubleshooting

### Agent not initializing
- Check that your OpenAI API key is correctly set in `.env`
- Verify the API key has sufficient credits
- Check console output for specific error messages

### File upload not working
- Ensure the `uploads/` directory exists and is writable
- Check file size (max 16MB)
- Verify file type is an allowed image format

### Server connection errors
- Confirm the server is running on port 5000
- Check for port conflicts
- Verify firewall settings

## 📝 Development

### Running in Development Mode
```bash
export FLASK_DEBUG=True
python app.py
```

### Testing the API
```bash
# Health check
curl http://localhost:5000/api/health

# Analyze text
curl -X POST http://localhost:5000/api/analyze \
  -F "message=Analyze this: Great product!"
```

## 🚀 Production Deployment

For production deployment:

1. Set `FLASK_DEBUG=False` in `.env`
2. Use a production WSGI server (e.g., Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
3. Configure CORS properly for your domain
4. Use HTTPS
5. Set up proper logging
6. Implement rate limiting
7. Use environment-specific API keys

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new analysis tools
- Improve the UI/UX
- Enhance error handling
- Add tests
- Improve documentation

## 💡 Future Enhancements

- [ ] Add support for PDF analysis
- [ ] Implement audio/video analysis
- [ ] Add export functionality for analysis results
- [ ] Create user authentication
- [ ] Add analysis history
- [ ] Implement streaming responses
- [ ] Add more visualization options
- [ ] Support for multiple AI models

## 📧 Support

For issues, questions, or suggestions, please create an issue in the repository or mail to sharangs08@gmail.com

---

**Built with 💚 from Sharan G S**
