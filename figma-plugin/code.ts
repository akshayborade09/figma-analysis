/**
 * Figma UX Analysis Plugin
 * 3-Mode Analysis System: Single Screen | Variants | User Flow
 */

// Show the plugin UI
figma.showUI(__html__, { 
  width: 460, 
  height: 780,
  themeColors: true 
});

// Configuration
const WORKER_URL = 'https://figma-ux-analyzer.analysisfigma.workers.dev/';

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
  
  if (msg.type === 'analyze') {
    await performAnalysis(msg.config);
  }
  if (msg.type === 'test-connection') {
    await testConnection();
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

/**
 * Extract file key from Figma URL
 */
function extractFileKeyFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Match patterns like:
  // https://www.figma.com/design/ABC123/...
  // https://www.figma.com/file/ABC123/...
  const match = url.match(/figma\.com\/(design|file)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

/**
 * Perform analysis based on mode
 */
async function performAnalysis(config: any) {
  try {
    const selectedFrames = figma.currentPage.selection.filter(
      node => node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'SECTION'
    );

    if (selectedFrames.length === 0) {
      figma.notify('⚠️ Please select frames first', { error: true });
      return;
    }

    // Validate frame count for mode
    const requirements = {
      single: { min: 1, max: 1 },
      variant: { min: 2, max: 10 },
      flow: { min: 3, max: 20 }
    };

    const req = requirements[config.mode];
    if (selectedFrames.length < req.min || selectedFrames.length > req.max) {
      figma.notify(`⚠️ ${config.mode} mode requires ${req.min}-${req.max} frames`, { error: true });
      figma.ui.postMessage({ type: 'error', message: `Invalid frame count for ${config.mode} mode` });
      return;
    }

    // Get file key from URL or figma.fileKey
    let fileKey = figma.fileKey;
    
    // If no fileKey (Desktop app), try to extract from provided URL
    if (!fileKey && config.fileUrl) {
      fileKey = extractFileKeyFromUrl(config.fileUrl);
    }
    
    if (!fileKey) {
      figma.notify('⚠️ Please enter a valid Figma file URL', { error: true });
      figma.ui.postMessage({ type: 'error', message: 'No file key available' });
      return;
    }

    figma.notify(`🤖 Starting ${config.mode} analysis...`);

    // Extract frame data based on mode
    let frameData;
    if (config.mode === 'single') {
      frameData = await extractSingleScreenData(selectedFrames[0]);
    } else if (config.mode === 'variant') {
      frameData = await extractVariantData(selectedFrames);
    } else if (config.mode === 'flow') {
      frameData = await extractFlowData(selectedFrames);
    }

    // Prepare payload
    const payload = {
      trigger: 'figma-plugin',
      mode: config.mode,
      fileKey: fileKey,
      fileName: figma.root.name || 'Untitled',
      fileUrl: `https://www.figma.com/design/${fileKey}`,
      frameData: frameData,
      userContext: config.context || '', // User-provided context for analysis
      config: config,
      metadata: {
        triggeredBy: figma.currentUser?.name || 'Unknown',
        userId: figma.currentUser?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        pluginVersion: '1.0.0'
      }
    };

    console.log('Sending to worker:', payload);

    // Send to worker
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Worker response:', responseText);

    if (!response.ok) {
      throw new Error(`Server error ${response.status}: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    figma.notify(`✅ Analysis complete! Check comments.`, { timeout: 5000 });
    figma.ui.postMessage({ type: 'success', result });

  } catch (error: any) {
    console.error('Analysis error:', error);
    figma.notify(`❌ Error: ${error.message}`, { error: true });
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

/**
 * Extract data for single screen analysis
 */
async function extractSingleScreenData(frame: SceneNode): Promise<any> {
  return {
    id: frame.id,
    name: frame.name,
    width: 'width' in frame ? frame.width : 0,
    height: 'height' in frame ? frame.height : 0,
    structure: extractStructure(frame),
    textContent: extractAllText(frame),
    interactiveElements: extractInteractiveElements(frame),
  };
}

/**
 * Extract data for variant comparison
 */
async function extractVariantData(frames: SceneNode[]): Promise<any> {
  return {
    variants: frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      width: 'width' in frame ? frame.width : 0,
      height: 'height' in frame ? frame.height : 0,
      structure: extractStructure(frame),
      textContent: extractAllText(frame),
      interactiveElements: extractInteractiveElements(frame),
    })),
    baseVariantName: frames[0].name // Assume first is base
  };
}

/**
 * Extract data for user flow analysis
 */
async function extractFlowData(frames: SceneNode[]): Promise<any> {
  return {
    screens: frames.map((frame, index) => ({
      id: frame.id,
      name: frame.name,
      order: index + 1,
      width: 'width' in frame ? frame.width : 0,
      height: 'height' in frame ? frame.height : 0,
      structure: extractStructure(frame),
      textContent: extractAllText(frame),
      interactiveElements: extractInteractiveElements(frame),
      prototypeLinks: extractPrototypeLinks(frame),
      flowContext: extractFlowContext(frame),
    })),
    totalSteps: frames.length
  };
}

/**
 * Extract structure
 */
function extractStructure(node: SceneNode, depth: number = 0): any {
  const structure: any = {
    name: node.name,
    type: node.type,
    depth: depth,
  };

  if ('children' in node) {
    structure.children = node.children.map(child => 
      extractStructure(child, depth + 1)
    );
  }

  return structure;
}

/**
 * Extract all text
 */
function extractAllText(node: SceneNode): string[] {
  const textContent: string[] = [];

  function traverse(n: SceneNode) {
    if (n.type === 'TEXT') {
      textContent.push((n as TextNode).characters);
    }
    if ('children' in n) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return textContent;
}

/**
 * Extract interactive elements
 */
function extractInteractiveElements(node: SceneNode): any[] {
  const elements: any[] = [];

  function traverse(n: SceneNode) {
    const name = n.name.toLowerCase();
    
    if (
      name.includes('button') ||
      name.includes('btn') ||
      name.includes('link') ||
      name.includes('input')
    ) {
      elements.push({
        name: n.name,
        type: n.type,
      });
    }

    if ('children' in n) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return elements;
}

/**
 * Extract prototype links
 */
function extractPrototypeLinks(node: SceneNode): any[] {
  const links: any[] = [];

  function traverse(n: SceneNode) {
    if ('reactions' in n && n.reactions) {
      n.reactions.forEach((reaction: Reaction) => {
        if (reaction.action?.type === 'NODE') {
          links.push({
            trigger: reaction.trigger?.type,
            fromNode: n.name,
            toNodeId: reaction.action.destinationId,
          });
        }
      });
    }

    if ('children' in n) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return links;
}

/**
 * Extract flow context
 */
function extractFlowContext(frame: SceneNode): any {
  const name = frame.name.toLowerCase();
  
  let screenType = 'unknown';
  
  if (name.includes('login') || name.includes('signin')) {
    screenType = 'authentication';
  } else if (name.includes('signup') || name.includes('register')) {
    screenType = 'registration';
  } else if (name.includes('home') || name.includes('dashboard')) {
    screenType = 'dashboard';
  } else if (name.includes('checkout')) {
    screenType = 'checkout';
  } else if (name.includes('profile')) {
    screenType = 'profile';
  }

  return {
    screenType,
    frameName: frame.name,
  };
}

/**
 * Test connection
 */
async function testConnection() {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });

    if (response.ok) {
      figma.notify('✅ Connection successful!');
      figma.ui.postMessage({ type: 'connection-success' });
    } else {
      throw new Error('Connection failed');
    }
  } catch (error) {
    figma.notify('❌ Connection failed', { error: true });
    figma.ui.postMessage({ type: 'connection-error' });
  }
}

// Update selection count
figma.on('selectionchange', () => {
  const frames = figma.currentPage.selection.filter(
    node => node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'SECTION'
  );
  
  figma.ui.postMessage({ 
    type: 'selection-update', 
    count: frames.length 
  });
});

// Initial count
setTimeout(() => {
  const frames = figma.currentPage.selection.filter(
    node => node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'SECTION'
  );
  
  figma.ui.postMessage({ 
    type: 'selection-update', 
    count: frames.length 
  });
}, 500);
