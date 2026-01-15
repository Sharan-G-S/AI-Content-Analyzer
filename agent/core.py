"""
Core AI agent implementation using LangChain.
"""
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from agent.tools import ALL_TOOLS
import os


class ContentAnalyzerAgent:
    """AI agent for analyzing content (text, images, URLs)."""
    
    def __init__(self, api_key: str = None):
        """Initialize the agent with OpenAI API key."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            api_key=self.api_key
        )
        
        # Create the agent prompt
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an AI Content Analyzer assistant. You help users analyze various types of content including text, images, and web pages.

You have access to the following tools:
- TextAnalyzer: Analyze text for sentiment, keywords, and statistics
- ImageAnalyzer: Analyze images for properties, colors, and description
- WebScraper: Extract content from URLs
- Calculator: Perform mathematical calculations

When a user asks you to analyze something:
1. Determine what type of content it is
2. Use the appropriate tool(s) to analyze it
3. Provide a clear, helpful summary of the results
4. If the user uploads a file or provides a URL, use the relevant tool

Be conversational, helpful, and provide insights beyond just the raw data. Explain what the analysis means in practical terms."""),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Create the agent
        self.agent = create_openai_tools_agent(
            llm=self.llm,
            tools=ALL_TOOLS,
            prompt=self.prompt
        )
        
        # Create memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Create agent executor
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=ALL_TOOLS,
            memory=self.memory,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=5
        )
    
    def analyze(self, user_input: str, image_path: str = None, url: str = None) -> dict:
        """
        Analyze content based on user input.
        
        Args:
            user_input: The user's question or request
            image_path: Optional path to an image file
            url: Optional URL to analyze
            
        Returns:
            dict with 'response' and 'success' keys
        """
        try:
            # Enhance the input with context about uploaded files or URLs
            enhanced_input = user_input
            
            if image_path:
                enhanced_input += f"\n\nNote: The user has uploaded an image at path: {image_path}. Please analyze it using the ImageAnalyzer tool."
            
            if url:
                enhanced_input += f"\n\nNote: The user has provided a URL: {url}. Please analyze it using the WebScraper tool."
            
            # Run the agent
            result = self.agent_executor.invoke({"input": enhanced_input})
            
            return {
                "response": result.get("output", "I apologize, but I couldn't process that request."),
                "success": True
            }
        except Exception as e:
            return {
                "response": f"I encountered an error: {str(e)}",
                "success": False,
                "error": str(e)
            }
    
    def reset_memory(self):
        """Clear the conversation memory."""
        self.memory.clear()
