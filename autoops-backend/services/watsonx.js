const axios = require('axios');
require('dotenv').config();

/**
 * IBM watsonx AI Service for Root Cause Analysis and Fix Generation
 */
class WatsonxService {
  constructor() {
    this.apiKey = process.env.WATSONX_API_KEY;
    this.projectId = process.env.WATSONX_PROJECT_ID;
    this.url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    this.model = 'ibm/granite-13b-chat-v2';
  }

  /**
   * Get IBM Cloud IAM token for authentication
   */
  async getIAMToken() {
    try {
      const response = await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apiKey
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting IAM token:', error.message);
      throw new Error('Failed to authenticate with IBM Cloud');
    }
  }

  /**
   * Analyze error and identify root cause using watsonx AI
   */
  async analyzeRootCause(alertData, codeContext) {
    try {
      const token = await this.getIAMToken();
      
      // Prepare context for AI analysis
      const alertInfo = this.extractAlertInfo(alertData);
      const codeSnippets = this.prepareCodeContext(codeContext);
      
      const prompt = `You are an expert DevOps engineer analyzing a production incident.

INCIDENT DETAILS:
- Alert: ${alertInfo.name}
- Severity: ${alertInfo.severity}
- Description: ${alertInfo.description}
- Service: ${alertInfo.service}
- Instance: ${alertInfo.instance}

CODE CONTEXT:
${codeSnippets}

TASK: Analyze this incident and provide:
1. Root cause identification
2. Affected code files and line numbers
3. Confidence level (0-1)
4. Technical explanation

Respond in JSON format:
{
  "rootCause": "detailed root cause explanation",
  "affectedFiles": ["file1.js", "file2.js"],
  "confidence": 0.85,
  "technicalDetails": "technical explanation"
}`;

      const response = await axios.post(
        `${this.url}/ml/v1/text/generation?version=2023-05-29`,
        {
          model_id: this.model,
          input: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.3,
            top_p: 0.9
          },
          project_id: this.projectId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const aiResponse = response.data.results[0].generated_text;
      return this.parseAIResponse(aiResponse, alertInfo);
    } catch (error) {
      console.error('Error in watsonx analysis:', error.message);
      // Fallback to basic analysis
      return this.fallbackAnalysis(alertData, codeContext);
    }
  }

  /**
   * Generate code fix using watsonx AI
   */
  async generateFix(incident, codeContext) {
    try {
      const token = await this.getIAMToken();
      
      const affectedFileContent = this.getAffectedFileContent(
        incident.affectedFiles,
        codeContext
      );

      const prompt = `You are an expert software engineer. Generate a code fix for this incident.

INCIDENT:
- Alert: ${incident.alertName}
- Root Cause: ${incident.rootCause}
- Description: ${incident.description}

AFFECTED CODE:
${affectedFileContent}

TASK: Generate a complete code fix that:
1. Resolves the root cause
2. Adds proper error handling
3. Includes comments explaining the fix
4. Follows best practices

Respond in JSON format:
{
  "fixDescription": "what the fix does",
  "files": [
    {
      "path": "file/path.js",
      "changes": "complete fixed code"
    }
  ],
  "testSuggestions": ["test case 1", "test case 2"]
}`;

      const response = await axios.post(
        `${this.url}/ml/v1/text/generation?version=2023-05-29`,
        {
          model_id: this.model,
          input: prompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.2,
            top_p: 0.9
          },
          project_id: this.projectId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const aiResponse = response.data.results[0].generated_text;
      return this.parseFixResponse(aiResponse, incident);
    } catch (error) {
      console.error('Error generating fix:', error.message);
      return this.fallbackFix(incident);
    }
  }

  /**
   * Extract alert information from webhook payload
   */
  extractAlertInfo(alertData) {
    const firstAlert = alertData.alerts?.[0];
    return {
      name: firstAlert?.labels?.alertname || alertData.commonLabels?.alertname || 'Unknown',
      severity: firstAlert?.labels?.severity || alertData.commonLabels?.severity || 'unknown',
      description: firstAlert?.annotations?.description || alertData.commonAnnotations?.description || 'No description',
      summary: firstAlert?.annotations?.summary || alertData.commonAnnotations?.summary || 'No summary',
      service: firstAlert?.labels?.service || alertData.commonLabels?.service || 'unknown',
      instance: firstAlert?.labels?.instance || alertData.commonLabels?.instance || 'unknown'
    };
  }

  /**
   * Prepare code context for AI analysis
   */
  prepareCodeContext(codeContext) {
    const files = Object.entries(codeContext).slice(0, 5); // Top 5 files
    return files.map(([path, content]) => {
      const lines = content.split('\n').slice(0, 50).join('\n'); // First 50 lines
      return `File: ${path}\n${lines}\n---`;
    }).join('\n\n');
  }

  /**
   * Get content of affected files
   */
  getAffectedFileContent(affectedFiles, codeContext) {
    if (!affectedFiles || affectedFiles.length === 0) {
      return 'No specific files identified';
    }
    
    return affectedFiles.map(file => {
      const content = codeContext[file] || 'File not found';
      return `File: ${file}\n${content}\n---`;
    }).join('\n\n');
  }

  /**
   * Parse AI response for root cause analysis
   */
  parseAIResponse(aiResponse, alertInfo) {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rootCause: parsed.rootCause || alertInfo.description,
          affectedFiles: parsed.affectedFiles || [],
          confidence: parsed.confidence || 0.75,
          technicalDetails: parsed.technicalDetails || ''
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error.message);
    }
    
    // Fallback parsing
    return {
      rootCause: alertInfo.description,
      affectedFiles: [],
      confidence: 0.6,
      technicalDetails: aiResponse.substring(0, 500)
    };
  }

  /**
   * Parse AI response for fix generation
   */
  parseFixResponse(aiResponse, incident) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing fix response:', error.message);
    }
    
    return {
      fixDescription: 'AI-generated fix for ' + incident.alertName,
      files: [],
      testSuggestions: []
    };
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  fallbackAnalysis(alertData, codeContext) {
    const alertInfo = this.extractAlertInfo(alertData);
    
    return {
      rootCause: alertInfo.description || `Issue detected: ${alertInfo.name}`,
      affectedFiles: Object.keys(codeContext).slice(0, 3),
      confidence: 0.5,
      technicalDetails: 'Fallback analysis - AI service unavailable'
    };
  }

  /**
   * Fallback fix when AI is unavailable
   */
  fallbackFix(incident) {
    const fixes = {
      'HighErrorRate': {
        fixDescription: 'Add error handling and input validation',
        files: [{
          path: 'src/routes/users.js',
          changes: '// Add try-catch blocks and input validation'
        }],
        testSuggestions: ['Test with invalid inputs', 'Test error scenarios']
      },
      'DatabaseConnectionFailure': {
        fixDescription: 'Implement connection retry logic and pool management',
        files: [{
          path: 'src/config/database.js',
          changes: '// Add connection retry logic with exponential backoff'
        }],
        testSuggestions: ['Test connection failures', 'Test retry mechanism']
      }
    };

    return fixes[incident.alertName] || {
      fixDescription: 'Review and fix the identified issue',
      files: [],
      testSuggestions: ['Add comprehensive tests']
    };
  }
}

module.exports = new WatsonxService();

// Made with Bob
