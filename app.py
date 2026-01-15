"""
Flask API server for the AI Content Analyzer.
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from agent import ContentAnalyzerAgent
import os
from werkzeug.utils import secure_filename
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static')
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the AI agent
try:
    agent = ContentAnalyzerAgent()
    print("✓ AI Agent initialized successfully")
except Exception as e:
    print(f"✗ Failed to initialize AI agent: {e}")
    agent = None


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Serve the main application page."""
    return send_from_directory('static', 'index.html')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'agent_ready': agent is not None,
        'message': 'AI Content Analyzer is running'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint."""
    if not agent:
        return jsonify({
            'success': False,
            'error': 'AI agent is not initialized. Please check your OpenAI API key.'
        }), 500
    
    try:
        # Get user input
        user_input = request.form.get('message', '').strip()
        url = request.form.get('url', '').strip()
        
        if not user_input and not url:
            return jsonify({
                'success': False,
                'error': 'Please provide a message or URL'
            }), 400
        
        # Handle file upload
        image_path = None
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                # Generate unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(image_path)
        
        # Prepare the message
        if not user_input:
            if url:
                user_input = f"Please analyze this URL: {url}"
            elif image_path:
                user_input = "Please analyze the uploaded image."
        
        # Run the agent
        result = agent.analyze(
            user_input=user_input,
            image_path=image_path,
            url=url if url else None
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    """Reset the conversation memory."""
    if not agent:
        return jsonify({
            'success': False,
            'error': 'AI agent is not initialized'
        }), 500
    
    try:
        agent.reset_memory()
        return jsonify({
            'success': True,
            'message': 'Conversation reset successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print("\n" + "="*60)
    print("🤖 AI Content Analyzer Server")
    print("="*60)
    print(f"Server running on: http://localhost:{port}")
    print(f"Debug mode: {debug}")
    print(f"Agent status: {'Ready ✓' if agent else 'Not initialized ✗'}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
