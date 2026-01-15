/**
 * AI Content Analyzer - Enhanced Frontend Application
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
const typingIndicator = document.getElementById('typingIndicator');
const statusIndicator = document.getElementById('statusIndicator');
const themeToggle = document.getElementById('themeToggle');
const clearChatBtn = document.getElementById('clearChat');
const exportChatBtn = document.getElementById('exportChat');
const attachFileBtn = document.getElementById('attachFile');
const messageCountEl = document.getElementById('messageCount');
const analysisCountEl = document.getElementById('analysisCount');

// State
let isProcessing = false;
let selectedFile = null;
let messageCount = 0;
let analysisCount = 0;
let isDarkMode = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkServerHealth();
    autoResizeTextarea();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);

    // Send message on Enter key (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', autoResizeTextarea);

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileName.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            fileName.style.color = 'var(--success)';
        }
    });

    // Attach file button
    attachFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Reset button
    resetButton.addEventListener('click', handleReset);

    // Clear chat button
    clearChatBtn.addEventListener('click', clearChat);

    // Export chat button
    exportChatBtn.addEventListener('click', exportChat);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
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
            updateStatus('Connected', true);
        } else {
            addMessage('agent', '⚠️ Warning: AI agent is not initialized. Please check your OpenAI API key in the .env file.');
            updateStatus('Agent Not Ready', false);
        }
    } catch (error) {
        console.error('Server health check failed:', error);
        addMessage('agent', '❌ Unable to connect to the server. Please make sure the server is running.');
        updateStatus('Disconnected', false);
    }
}

/**
 * Update status indicator
 */
function updateStatus(text, isConnected) {
    const statusText = statusIndicator.querySelector('.status-text');
    const statusDot = statusIndicator.querySelector('.status-dot');

    statusText.textContent = text;
    statusDot.style.background = isConnected ? 'var(--success)' : 'var(--error)';
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

    // Update stats
    messageCount++;
    updateStats();

    // Clear inputs
    const userMessage = message || 'Please analyze this content.';
    messageInput.value = '';
    autoResizeTextarea();

    // Set processing state
    setProcessing(true);

    // Show typing indicator
    showTypingIndicator();

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

        // Hide typing indicator
        hideTypingIndicator();

        // Add response
        if (data.success) {
            addMessage('agent', formatResponse(data.response));
            analysisCount++;
            messageCount++;
            updateStats();
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
        hideTypingIndicator();
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
    const time = getTimeString();

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-icon">${icon}</div>
            <span class="message-role">${roleName}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">
            ${content}
        </div>
        ${role === 'agent' && !isLoading ? '<button class="copy-btn" onclick="copyMessage(this)">📋 Copy</button>' : ''}
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    return messageId;
}

/**
 * Get current time string
 */
function getTimeString() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Copy message content
 */
function copyMessage(button) {
    const messageContent = button.previousElementSibling;
    const text = messageContent.innerText;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.color = 'var(--success)';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.color = '';
        }, 2000);
    });
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
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
        sendButtonText.textContent = 'Sending...';
    } else {
        sendButtonText.textContent = 'Send';
    }
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

/**
 * Update stats
 */
function updateStats() {
    messageCountEl.textContent = messageCount;
    analysisCountEl.textContent = analysisCount;
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
            clearChat();
            addMessage('agent', 'Conversation reset! I\'m ready to help you analyze new content.');

            // Reset stats
            messageCount = 1;
            analysisCount = 0;
            updateStats();
        } else {
            alert('Failed to reset conversation: ' + data.error);
        }
    } catch (error) {
        alert('Error resetting conversation: ' + error.message);
    }
}

/**
 * Clear chat messages
 */
function clearChat() {
    messagesContainer.innerHTML = '';
    messageInput.value = '';
    urlInput.value = '';
    fileInput.value = '';
    fileName.textContent = '';
    selectedFile = null;
}

/**
 * Export chat conversation
 */
function exportChat() {
    const messages = messagesContainer.querySelectorAll('.message');
    let exportText = 'AI Content Analyzer - Conversation Export\n';
    exportText += '='.repeat(50) + '\n\n';

    messages.forEach(msg => {
        const role = msg.querySelector('.message-role').textContent;
        const time = msg.querySelector('.message-time').textContent;
        const content = msg.querySelector('.message-content').innerText;

        exportText += `[${time}] ${role}:\n${content}\n\n`;
    });

    // Create download link
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Toggle theme (placeholder for future implementation)
 */
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = isDarkMode ? '🌙' : '☀️';

    // Future: Implement light mode CSS
    alert('Light mode coming soon! 🌟');
}

/**
 * Use example prompt
 */
function usePrompt(element) {
    const promptText = element.textContent.trim();
    messageInput.value = promptText;
    autoResizeTextarea();
    messageInput.focus();
}

/**
 * Quick action buttons
 */
function quickAction(action) {
    let prompt = '';

    switch (action) {
        case 'sentiment':
            prompt = 'Analyze the sentiment of: ';
            break;
        case 'keywords':
            prompt = 'Extract keywords from: ';
            break;
        case 'summary':
            prompt = 'Summarize: ';
            break;
        case 'calculate':
            prompt = 'Calculate: ';
            break;
    }

    messageInput.value = prompt;
    autoResizeTextarea();
    messageInput.focus();

    // Move cursor to end
    messageInput.setSelectionRange(prompt.length, prompt.length);
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
