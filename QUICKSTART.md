# 🚀 Quick Start Guide

Get your AI Content Analyzer running in 3 minutes!

## Prerequisites
- Python 3.8+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Option 1: Automated Setup (Recommended)

```bash
cd /Users/sharan/.gemini/antigravity/scratch/ai-content-analyzer
./setup.sh
```

Then:
1. Edit `.env` and add your OpenAI API key
2. Run `source venv/bin/activate`
3. Run `python app.py`
4. Open http://localhost:5000

## Option 2: Manual Setup

```bash
# Navigate to project
cd /Users/sharan/.gemini/antigravity/scratch/ai-content-analyzer

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# Run the app
python app.py
```

## First Steps

Once the app is running:

1. **Test Text Analysis**
   - Type: "Analyze this: I love this amazing product!"
   - Watch the agent use the TextAnalyzer tool

2. **Test Image Analysis**
   - Click "Upload Image" in the sidebar
   - Select any image file
   - Ask: "What can you tell me about this image?"

3. **Test Web Scraping**
   - Type: "Analyze https://example.com"
   - See the agent extract and summarize content

4. **Test Multi-Tool Reasoning**
   - Ask complex questions that require multiple tools
   - Example: "Get content from example.com and analyze its sentiment"

## Troubleshooting

**Agent not initializing?**
- Check your OpenAI API key in `.env`
- Verify you have API credits

**Port already in use?**
- Change `PORT=5000` in `.env` to another port

**Dependencies failing?**
- Ensure Python 3.8+ is installed
- Try `pip install --upgrade pip` first

## Need Help?

Check the full [README.md](README.md) for detailed documentation.

---

**Enjoy your AI Content Analyzer! 🤖**
