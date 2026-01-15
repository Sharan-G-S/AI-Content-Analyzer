/**
 * AI Content Analyzer - Frontend Application
 */

// DOM Elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const sendButtonText = document.getElementById('sendButtonText');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const urlInput = document.getElementById('urlInput');
const resetButton = document.getElementById('resetButton');

// State
let isProcessing = false;
let selectedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkServerHealth();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileName.textContent = `Selected: ${file.name}`;
            fileName.style.color = 'var(--success)';
        }
    });

    // Reset button
    resetButton.addEventListener('click', handleReset);
}

/**
 * Check server health
 */
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (data.agent_ready) {
            console.log('✓ Server is healthy and agent is ready');
        } else {
            addMessage('agent', '⚠️ Warning: AI agent is not initialized. Please check your OpenAI API key in the .env file.');
        }
    } catch (error) {
        console.error('Server health check failed:', error);
        addMessage('agent', '❌ Unable to connect to the server. Please make sure the server is running.');
    }
}

/**
 * Handle sending a message
 */
async function handleSendMessage() {
    if (isProcessing) return;

    const message = messageInput.value.trim();
    const url = urlInput.value.trim();

    if (!message && !selectedFile && !url) {
        return;
    }

    // Add user message to chat
    if (message) {
        addMessage('user', message);
    } else if (selectedFile) {
        addMessage('user', `📎 Uploaded: ${selectedFile.name}`);
    } else if (url) {
        addMessage('user', `🔗 URL: ${url}`);
    }

    // Clear inputs
    const userMessage = message || 'Please analyze this content.';
    messageInput.value = '';

    // Set processing state
    setProcessing(true);

    // Add loading message
    const loadingId = addMessage('agent', '<div class="loading"></div> Analyzing...', true);

    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('message', userMessage);

        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        if (url) {
            formData.append('url', url);
        }

        // Send request
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Remove loading message
        removeMessage(loadingId);

        // Add response
        if (data.success) {
            addMessage('agent', formatResponse(data.response));
        } else {
            addMessage('agent', `❌ Error: ${data.error || 'Unknown error occurred'}`);
        }

        // Clear file selection
        if (selectedFile) {
            selectedFile = null;
            fileInput.value = '';
            fileName.textContent = '';
        }

        // Clear URL
        if (url) {
            urlInput.value = '';
        }

    } catch (error) {
        removeMessage(loadingId);
        addMessage('agent', `❌ Error: ${error.message}`);
    } finally {
        setProcessing(false);
    }
}

/**
 * Add a message to the chat
 */
function addMessage(role, content, isLoading = false) {
    const messageId = `msg-${Date.now()}-${Math.random()}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.id = messageId;

    const icon = role === 'user' ? '👤' : '🤖';
    const roleName = role === 'user' ? 'You' : 'AI Agent';

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-icon">${icon}</div>
            <span class="message-role">${roleName}</span>
        </div>
        <div class="message-content">
            ${content}
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    return messageId;
}

/**
 * Remove a message from the chat
 */
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

/**
 * Format the agent's response
 */
function formatResponse(text) {
    // Convert markdown-style code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre>$2</pre>');

    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code style="background: var(--bg-primary); padding: 2px 6px; border-radius: 4px;">$1</code>');

    // Convert bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Convert line breaks
    text = text.replace(/\n/g, '<br>');

    // Convert JSON blocks to formatted code
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonObj = JSON.parse(jsonMatch[0]);
            const formatted = JSON.stringify(jsonObj, null, 2);
            text = text.replace(jsonMatch[0], `<pre>${formatted}</pre>`);
        }
    } catch (e) {
        // Not valid JSON, ignore
    }

    return text;
}

/**
 * Set processing state
 */
function setProcessing(processing) {
    isProcessing = processing;
    sendButton.disabled = processing;
    messageInput.disabled = processing;

    if (processing) {
        sendButtonText.innerHTML = '<div class="loading"></div>';
    } else {
        sendButtonText.textContent = 'Send';
    }
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Handle conversation reset
 */
async function handleReset() {
    if (!confirm('Are you sure you want to reset the conversation?')) {
        return;
    }

    try {
        const response = await fetch('/api/reset', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            // Clear messages except the welcome message
            messagesContainer.innerHTML = `
                <div class="message agent">
                    <div class="message-header">
                        <div class="message-icon">🤖</div>
                        <span class="message-role">AI Agent</span>
                    </div>
                    <div class="message-content">
                        <p>Conversation reset! I'm ready to help you analyze new content.</p>
                    </div>
                </div>
            `;

            // Clear inputs
            messageInput.value = '';
            urlInput.value = '';
            fileInput.value = '';
            fileName.textContent = '';
            selectedFile = null;
        } else {
            alert('Failed to reset conversation: ' + data.error);
        }
    } catch (error) {
        alert('Error resetting conversation: ' + error.message);
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
