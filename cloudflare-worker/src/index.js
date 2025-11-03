/**
 * Figma UX Analysis Cloudflare Worker
 * Receives requests from Figma plugin, analyzes with Claude, posts comments back
 */

export default {
    async fetch(request, env) {
      return handleRequest(request, env);
    }
  };
  
  async function handleRequest(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
  
    // Only POST allowed
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }
  
    try {
      const payload = await request.json();
      
      // Test endpoint
      if (payload.test === true) {
        return jsonResponse({ 
          status: 'ok', 
          message: 'Connection successful!',
          timestamp: new Date().toISOString()
        }, 200, corsHeaders);
      }
  
      // Get AI configuration from user or fallback to environment
      const aiProvider = payload.aiConfig?.provider || 'aiml';
      const userApiKey = payload.aiConfig?.apiKey;
      
      // Determine which API key to use
      let aiApiKey;
      if (userApiKey) {
        aiApiKey = userApiKey; // Use user's key
        console.log(`🔑 Using user-provided ${aiProvider} API key`);
      } else {
        // Fallback to environment key (for backward compatibility)
        aiApiKey = env.AIML_API_KEY;
        console.log(`🔑 Using default AIML API key from environment`);
      }
      
      // Validate we have an AI API key
      if (!aiApiKey) {
        throw new Error('No API key available. Please provide your API key in the plugin.');
      }
      
      // Validate Figma token
      if (!env.FIGMA_ACCESS_TOKEN) {
        throw new Error('Missing FIGMA_ACCESS_TOKEN. Please set it as a worker secret.');
      }
  
      // Validate file key exists
      if (!payload.fileKey) {
        throw new Error('File key is required. Please ensure your file is saved to Figma.');
      }

      // Convert frameData to frames array based on mode
      let frames = [];
      if (payload.mode === 'single') {
        frames = [payload.frameData];
      } else if (payload.mode === 'variant') {
        frames = payload.frameData.variants || [];
      } else if (payload.mode === 'flow') {
        frames = payload.frameData.screens || [];
      }

      console.log(`📊 Analyzing ${frames.length} frames in ${payload.mode} mode from "${payload.fileName}"`);
  
      // Process frames sequentially to avoid rate limits
      const results = [];
      for (const frame of frames) {
        try {
          const result = await analyzeFrame(frame, payload, env, aiProvider, aiApiKey);
          results.push(result);
          console.log(`✅ Analyzed: ${frame.name}`);
        } catch (error) {
          console.error(`❌ Failed to analyze ${frame.name}:`, error.message);
          results.push({ 
            frameId: frame.id, 
            success: false, 
            error: error.message 
          });
        }
      }
  
      return jsonResponse({
        success: true,
        analyzed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results,
        message: `Analysis complete! Processed ${results.length} frames.`
      }, 200, corsHeaders);
  
    } catch (error) {
      console.error('❌ Error:', error);
      return jsonResponse({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }, 500, corsHeaders);
    }
  }
  
  /**
   * Analyze single frame
   */
  async function analyzeFrame(frame, payload, env, aiProvider, aiApiKey) {
    console.log(`📊 Starting analysis for frame: ${frame.name} (ID: ${frame.id})`);
    
    try {
      // 1. Export image from Figma
      console.log('🖼️  Step 1: Exporting image from Figma...');
      const imageUrl = await exportFrameImage(
        payload.fileKey, 
        frame.id, 
        env.FIGMA_ACCESS_TOKEN
      );
      console.log(`✅ Image URL received: ${imageUrl.substring(0, 100)}...`);

      // 2. Download as base64
      console.log('📥 Step 2: Downloading and converting to base64...');
      const imageBase64 = await downloadImageAsBase64(imageUrl);
      const imageSizeKB = Math.round(imageBase64.length / 1024);
      console.log(`✅ Image converted to base64: ${imageSizeKB} KB`);
      
      if (imageSizeKB > 4000) {
        console.warn(`⚠️  Large image size: ${imageSizeKB} KB (may cause issues)`);
      }

      // 3. Analyze with selected AI provider
      console.log(`🤖 Step 3: Sending to ${aiProvider} AI...`);
      const feedbackItems = await analyzeWithAI(
        imageBase64,
        frame,
        payload.config,
        aiApiKey,
        aiProvider,
        payload.userContext || ''
      );
      console.log(`✅ Received ${feedbackItems.length} feedback items`);

      // 4. Post comments to Figma
      console.log('💬 Step 4: Posting comments to Figma...');
      
      // For flow mode, post individual frame summary + detailed comments
      // For other modes, post standard clustered comments
      if (payload.mode === 'flow') {
        await postFlowFrameComments(
          payload.fileKey,
          frame.id,
          feedbackItems,
          frame.name,
          env.FIGMA_ACCESS_TOKEN
        );
      } else {
        await postCommentsToFigma(
          payload.fileKey,
          frame.id,
          feedbackItems,
          frame.name,
          env.FIGMA_ACCESS_TOKEN
        );
      }
      console.log('✅ Comments posted successfully');

      return { 
        frameId: frame.id, 
        frameName: frame.name,
        success: true, 
        commentsPosted: feedbackItems.length 
      };
    } catch (error) {
      console.error(`💥 Error analyzing frame ${frame.name}:`, error.message);
      console.error(`💥 Error stack:`, error.stack);
      throw error;
    }
  }
  
  /**
   * Export frame as PNG from Figma
   */
  async function exportFrameImage(fileKey, nodeId, figmaToken) {
    const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`;
    
    const response = await fetch(url, {
      headers: { 'X-Figma-Token': figmaToken }
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma export failed (${response.status}): ${error}`);
    }
  
    const data = await response.json();
    
    if (!data.images || !data.images[nodeId]) {
      throw new Error('No image URL returned from Figma');
    }
  
    return data.images[nodeId];
  }
  
  /**
   * Download image and convert to base64
   */
  async function downloadImageAsBase64(imageUrl) {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image (${response.status})`);
    }
  
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binary);
  }
  
  /**
   * Route to appropriate AI provider
   */
  async function analyzeWithAI(imageBase64, frame, config, apiKey, provider, userContext = '') {
    console.log(`🔀 Routing to ${provider} provider...`);
    
    switch (provider.toLowerCase()) {
      case 'aiml':
        return await analyzeWithAIML(imageBase64, frame, config, apiKey, userContext);
      
      case 'openai':
        return await analyzeWithOpenAI(imageBase64, frame, config, apiKey, userContext);
      
      case 'anthropic':
        return await analyzeWithClaude(imageBase64, frame, config, apiKey, userContext);
      
      case 'gemini':
      case 'google':
        return await analyzeWithGemini(imageBase64, frame, config, apiKey, userContext);
      
      case 'groq':
        return await analyzeWithGroq(imageBase64, frame, config, apiKey, userContext);
      
      case 'openrouter':
        return await analyzeWithOpenRouter(imageBase64, frame, config, apiKey, userContext);
      
      case 'huggingface':
        return await analyzeWithHuggingFace(imageBase64, frame, config, apiKey, userContext);
      
      case 'cloudflare':
        return await analyzeWithCloudflare(imageBase64, frame, config, apiKey, userContext);
      
      case 'together':
        return await analyzeWithTogether(imageBase64, frame, config, apiKey, userContext);
      
      case 'replicate':
        return await analyzeWithReplicate(imageBase64, frame, config, apiKey, userContext);
      
      case 'cohere':
        return await analyzeWithCohere(imageBase64, frame, config, apiKey, userContext);
      
      case 'mistral':
        return await analyzeWithMistral(imageBase64, frame, config, apiKey, userContext);
      
      default:
        throw new Error(`Unsupported AI provider: ${provider}. Please select a valid provider.`);
    }
  }

  /**
   * Analyze with AIML API (GPT-4o-mini Vision - FREE)
   */
  async function analyzeWithAIML(imageBase64, frame, config, aimlKey, userContext = '') {
    const prompt = buildAnalysisPrompt(frame, config, userContext);

    console.log('🤖 Sending to AIML API (GPT-4o-mini)...');

    try {
      const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aimlKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.4,
          max_tokens: 4096,
          top_p: 1
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ AIML API error:', error);
        throw new Error(`AIML API error (${response.status}): ${error}`);
      }

      const result = await response.json();
      console.log('✅ AIML response received');
      
      // Extract text from response
      const analysisText = result.choices[0].message.content;
      console.log('📄 Analysis text length:', analysisText.length);

      // Remove markdown code blocks if present
      let cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Find JSON array
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ Could not find JSON. Response excerpt:', analysisText.substring(0, 300));
        throw new Error('Could not parse JSON from AIML response');
      }

      const feedbackItems = JSON.parse(jsonMatch[0]);
      console.log(`✅ Parsed ${feedbackItems.length} feedback items`);
      
      return feedbackItems;

    } catch (error) {
      console.error('💥 AIML analysis failed:', error.message);
      throw new Error(`AIML analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Build comprehensive UX psychology analysis prompt
   */
  function buildAnalysisPrompt(frame, config, userContext = '') {
    // Format text content
    const textContentStr = frame.textContent && frame.textContent.length > 0 
      ? frame.textContent.join('\n') 
      : 'No text content extracted';
    
    // Format interactive elements
    const interactiveStr = frame.interactiveElements && frame.interactiveElements.length > 0
      ? JSON.stringify(frame.interactiveElements, null, 2)
      : 'No interactive elements identified';
    
    // Format prototype flows
    const prototypeStr = frame.prototypeLinks && frame.prototypeLinks.length > 0
      ? JSON.stringify(frame.prototypeLinks, null, 2)
      : 'No prototype connections';
    
    // Add user context if provided
    const userContextSection = userContext 
      ? `\n**USER PROVIDED CONTEXT:**\n${userContext}\n\nPlease consider this context when providing feedback.\n`
      : '';
    
    return `You are an expert UX researcher and behavioral psychologist analyzing a ${config.designType} screen.

**SCREEN CONTEXT:**
- Name: "${frame.name}"
- Type: ${frame.flowContext?.screenType || 'unknown'}
- Purpose: ${frame.flowContext?.purpose || 'Not specified'}
- Dimensions: ${frame.width}×${frame.height}px${userContextSection}

**TEXT CONTENT ON SCREEN:**
${textContentStr}

**INTERACTIVE ELEMENTS:**
${interactiveStr}

**PROTOTYPE FLOWS:**
${prototypeStr}

**YOUR ANALYSIS MUST COVER:**

1. **VISUAL DESIGN** (from image):
   - WCAG accessibility (contrast ratios, touch targets, text sizing)
   - Visual hierarchy and information architecture
   - Gestalt principles (proximity, similarity, closure)
   - Platform guidelines (${config.platform})

2. **UX PSYCHOLOGY** (from structure + content):
   - Cognitive load: Is there too much information overwhelming users?
   - Mental models: Does this match user expectations for this screen type?
   - Decision fatigue: Are there too many choices causing paralysis?
   - Friction points: Any unnecessary steps or barriers?
   - Persuasion techniques: Social proof, scarcity, urgency usage
   - Emotional design: Does it evoke appropriate feelings for the context?

3. **BEHAVIORAL PATTERNS**:
   - Call-to-action clarity: Is the primary action immediately obvious?
   - Progressive disclosure: Is information revealed appropriately?
   - Feedback mechanisms: Does user know what will happen after actions?
   - Error prevention: Are there guardrails and validation?
   - Habit formation: Does this encourage return visits/engagement?

4. **USER FLOW ANALYSIS**:
   - Entry points: How did user arrive here? Is context clear?
   - Exit options: Where can they go next? Is navigation obvious?
   - Navigation clarity: Is the path forward unambiguous?
   - Information architecture: Is content organized logically?
   - Task completion: Can user achieve their goal efficiently?

5. **MICROCOPY & CONTENT**:
   - Clarity: Is language simple, direct, and jargon-free?
   - Tone of voice: Appropriate for context and user state?
   - Button labels: Action-oriented and clear about outcomes?
   - Error messages: Helpful, empathetic, and solution-focused?
   - Onboarding: Does it guide users effectively?

6. **INTERACTION DESIGN**:
   - Affordances: Do elements look clickable/interactive?
   - Feedback: What happens after user actions? Is it clear?
   - State changes: Are loading, success, error states visible?
   - Micro-interactions: Are they delightful or distracting?

7. **INFORMATION ARCHITECTURE**:
   - Content organization: Logical grouping and hierarchy?
   - Navigation depth: Is content buried too deep?
   - Scannability: Can users quickly find what they need?

**SPECIFIC PSYCHOLOGY PRINCIPLES TO CHECK:**
- **Hick's Law**: Are there too many options causing decision paralysis?
- **Miller's Law**: Is cognitive load kept under 7±2 items per section?
- **Fitts's Law**: Are important targets large and close to previous interaction points?
- **Jakob's Law**: Does this match familiar patterns from similar apps?
- **Peak-End Rule**: Is the experience memorable at key moments?
- **Zeigarnik Effect**: Are progress indicators used effectively?
- **Von Restorff Effect**: Does the primary CTA stand out distinctly?
- **Serial Position Effect**: Is key information at start or end?

**OUTPUT FORMAT:**
Return ONLY a JSON array with this structure:

[
  {
    "location": "Specific element or area",
    "category": "Visual Design | UX Psychology | Behavioral Patterns | User Flows | Microcopy | Interaction Design | Information Architecture",
    "severity": "critical" | "high" | "medium" | "low" | "positive",
    "finding": "What you observed (be specific)",
    "recommendation": "Exact fix with psychology rationale explaining WHY this matters from a behavioral perspective",
    "principle": "Specific principle (e.g., 'Hick's Law', 'Cognitive Load', 'WCAG 2.1')"
  }
]

**EXAMPLE GOOD FEEDBACK:**

{
  "location": "Sign up form",
  "category": "UX Psychology",
  "severity": "high",
  "finding": "Form has 12 fields on first screen, causing decision fatigue and increasing bounce rate likelihood",
  "recommendation": "Break into 3-step progressive disclosure: (1) Email + Password, (2) Basic Info, (3) Preferences. Show progress bar. Reduces perceived effort by 70%. This works because users can only hold 7±2 items in working memory (Miller's Law). 12 fields overwhelms cognitive capacity, triggering abandonment. Multi-step feels less daunting even if total time is same.",
  "principle": "Miller's Law + Progressive Disclosure"
}

{
  "location": "Primary CTA button placement",
  "category": "Behavioral Patterns",
  "severity": "medium",
  "finding": "Primary button is at top-right, going against F-pattern scanning behavior and requiring 800px mouse travel from last input field",
  "recommendation": "Move primary CTA directly below last form field, within 200px. Add floating sticky CTA for long forms. Reduces Fitts's Law distance by 75%. Users scan in F-pattern (top-left to bottom-left). Top-right placement breaks natural flow. Large mouse travel distance increases task time and error rate.",
  "principle": "Fitts's Law + F-Pattern Scanning"
}

Provide 15-20 findings covering all 7 analysis areas above.
Include both visual AND behavioral/psychological insights.
Be specific, actionable, and explain the 'WHY' behind each recommendation using psychology principles.

RESPOND WITH ONLY THE JSON ARRAY. NO OTHER TEXT.`;
  }
  
  /**
   * Post flow frame comments (one collective comment above frame)
   */
  async function postFlowFrameComments(fileKey, nodeId, feedbackItems, frameName, figmaToken) {
    const url = `https://api.figma.com/v1/files/${fileKey}/comments`;
  
    // Map to severity levels
    const criticalItems = feedbackItems.filter(f => f.severity === 'critical' || f.severity === 'high');
    const moderateItems = feedbackItems.filter(f => f.severity === 'medium');
    const goodItems = feedbackItems.filter(f => f.severity === 'low' || f.severity === 'positive');
  
    // Create one collective comment with all feedback categories
    let comment = `Frame: "${frameName}"\n\n`;
    
    if (criticalItems.length > 0) {
      comment += `CRITICAL (${criticalItems.length}):\n`;
      criticalItems.forEach((item, index) => {
        comment += `${index + 1}. ${item.finding}\n`;
      });
      comment += `\n`;
    }
    
    if (moderateItems.length > 0) {
      comment += `MODERATE (${moderateItems.length}):\n`;
      moderateItems.forEach((item, index) => {
        comment += `${index + 1}. ${item.finding}\n`;
      });
      comment += `\n`;
    }
    
    if (goodItems.length > 0) {
      comment += `GOOD (${goodItems.length}):\n`;
      goodItems.forEach((item, index) => {
        comment += `${index + 1}. ${item.finding}\n`;
      });
    }
    
    // Post single comment above frame
    await postSingleComment(url, nodeId, comment, figmaToken, { x: 0.5, y: -0.1 });
  }

  /**
   * Post comments to Figma
   */
  async function postCommentsToFigma(fileKey, nodeId, feedbackItems, frameName, figmaToken) {
    const url = `https://api.figma.com/v1/files/${fileKey}/comments`;
  
    // Map to new severity levels: CRITICAL, MODERATE, GOOD
    const criticalItems = feedbackItems.filter(f => f.severity === 'critical' || f.severity === 'high');
    const moderateItems = feedbackItems.filter(f => f.severity === 'medium');
    const goodItems = feedbackItems.filter(f => f.severity === 'low' || f.severity === 'positive');
  
    // Post summary comment
    const summary = formatSummary(frameName, criticalItems.length, moderateItems.length, goodItems.length);
    await postSingleComment(url, nodeId, summary, figmaToken, { x: 0.05, y: 0.05 });
    await sleep(150);
  
    // Post clustered comments (3 total)
    if (criticalItems.length > 0) {
      const criticalComment = formatClusteredComment('CRITICAL ISSUES', criticalItems);
      await postSingleComment(url, nodeId, criticalComment, figmaToken, { x: 0.95, y: 0.15 });
      await sleep(150);
    }
    
    if (moderateItems.length > 0) {
      const moderateComment = formatClusteredComment('MODERATE ISSUES', moderateItems);
      await postSingleComment(url, nodeId, moderateComment, figmaToken, { x: 0.95, y: 0.50 });
      await sleep(150);
    }
    
    if (goodItems.length > 0) {
      const goodComment = formatClusteredComment('GOOD PRACTICES', goodItems);
      await postSingleComment(url, nodeId, goodComment, figmaToken, { x: 0.95, y: 0.85 });
    }
  }
  
  /**
   * Post single comment
   */
  async function postSingleComment(url, nodeId, message, figmaToken, offset) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Figma-Token': figmaToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        client_meta: {
          node_id: nodeId,
          node_offset: { x: offset.x, y: offset.y }
        }
      })
    });
  
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to post comment: ${error}`);
      throw new Error(`Comment post failed: ${response.status}`);
    }
  
    return true;
  }
  
  /**
   * Format summary comment (clean, no emojis/asterisks)
   */
  function formatSummary(frameName, criticalCount, moderateCount, goodCount) {
    const total = criticalCount + moderateCount + goodCount;
    
    let summary = `UX Analysis: "${frameName}"\n\n`;
    summary += `Found ${total} findings:\n`;
    
    if (criticalCount > 0) summary += `Critical: ${criticalCount}\n`;
    if (moderateCount > 0) summary += `Moderate: ${moderateCount}\n`;
    if (goodCount > 0) summary += `Good: ${goodCount}\n`;
    
    summary += `\nSee detailed feedback in individual comments.\n`;
    summary += `\nGenerated by UX Analysis Bot • ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;
    
    return summary;
  }
  
  /**
   * Format clustered comment with colored emojis (clean format, multiple findings)
   */
  function formatClusteredComment(title, items) {
    // Add emoji based on severity
    let emoji = '';
    if (title.includes('CRITICAL')) emoji = '🔴 ';
    if (title.includes('MODERATE')) emoji = '🟡 ';
    if (title.includes('GOOD')) emoji = '🟢 ';
    
    let comment = `${emoji}${title} (${items.length})\n\n`;
    
    items.forEach((item, index) => {
      comment += `Finding ${index + 1}: ${item.finding}\n`;
      comment += `Location: ${item.location}\n`;
      comment += `Recommendation: ${item.recommendation}\n`;
      comment += `(${item.principle})\n`;
      
      // Add spacing between findings
      if (index < items.length - 1) {
        comment += `\n`;
      }
    });
    
    return comment;
  }
  
  
  /**
   * AI Provider Implementations (Stubs - to be implemented)
   */
  
  async function analyzeWithOpenAI(imageBase64, frame, config, apiKey, userContext) {
    // Use OpenAI API directly (similar structure to AIML)
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
            ]
          }
        ],
        temperature: 0.4,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from OpenAI response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithGroq(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ]
        }],
        temperature: 0.4,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Groq response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithGemini(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.candidates[0].content.parts[0].text;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Gemini response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithClaude(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.4,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.content[0].text;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Claude response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithOpenRouter(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://figma-ux-analyzer.analysisfigma.workers.dev',
        'X-Title': 'UX Analysis for feedback'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ]
        }],
        temperature: 0.4,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from OpenRouter response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithTogether(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ]
        }],
        temperature: 0.4,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`Together AI error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Together AI response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithReplicate(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    // Start prediction
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'b72178aed2f4b6d8ec2f9c5b8e8c8f8e8c8f8e8c', // LLaVA or similar vision model
        input: {
          image: `data:image/png;base64,${imageBase64}`,
          prompt: prompt,
          max_tokens: 4096,
          temperature: 0.4
        }
      })
    });
    
    if (!startResponse.ok) {
      throw new Error(`Replicate API error (${startResponse.status}): ${await startResponse.text()}`);
    }
    
    let prediction = await startResponse.json();
    
    // Poll for completion
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await sleep(1000);
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      prediction = await pollResponse.json();
    }
    
    if (prediction.status === 'failed') {
      throw new Error('Replicate prediction failed');
    }
    
    const analysisText = prediction.output.join('');
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Replicate response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithHuggingFace(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          image: `data:image/png;base64,${imageBase64}`,
          text: prompt
        },
        parameters: {
          max_new_tokens: 4096,
          temperature: 0.4
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result[0].generated_text || result.generated_text;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Hugging Face response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithCloudflare(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    // Note: Cloudflare Workers AI requires account ID in the key format: accountId:apiKey
    const [accountId, actualKey] = apiKey.includes(':') ? apiKey.split(':') : [null, apiKey];
    
    if (!accountId) {
      throw new Error('Cloudflare API key must be in format: accountId:apiKey');
    }
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/llava-hf/llava-1.5-7b-hf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${actualKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image: [Array.from(atob(imageBase64)).map(c => c.charCodeAt(0))],
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`Cloudflare AI error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.result.response;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Cloudflare response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithCohere(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    // Note: Cohere has limited vision support, using Command-R with text description
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: `${prompt}\n\n[Image analysis requested - base64 data provided but Cohere has limited vision support. Analyzing based on frame metadata and structure.]`,
        temperature: 0.4,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`Cohere API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.text;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Cohere response');
    return JSON.parse(jsonMatch[0]);
  }

  async function analyzeWithMistral(imageBase64, frame, config, apiKey, userContext) {
    const prompt = buildAnalysisPrompt(frame, config, userContext);
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: `data:image/png;base64,${imageBase64}` }
          ]
        }],
        temperature: 0.4,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`Mistral API error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    const jsonMatch = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) throw new Error('Could not parse JSON from Mistral response');
    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Utility functions
   */
  function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }