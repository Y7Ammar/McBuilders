// ==================== State Management ====================
let currentSchematic = null;
let isGenerating = false;
const API_URL = 'http://localhost:5000';

// ==================== Utility Functions ====================
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
}

function updateCharCount() {
    const textarea = document.getElementById('buildDescription');
    const charCount = document.getElementById('charCount');
    charCount.textContent = textarea.value.length;
    
    if (textarea.value.length > 500) {
        textarea.value = textarea.value.substring(0, 500);
    }
}

// ==================== Schematic Generation ====================
async function generateSchematic() {
    if (isGenerating) return;

    const description = document.getElementById('buildDescription').value.trim();
    const edition = document.querySelector('input[name="edition"]:checked').value;
    const style = document.getElementById('styleSelect').value;

    // Validation
    if (!description) {
        alert('Please describe your build!');
        return;
    }

    if (!style) {
        alert('Please select a building style!');
        return;
    }

    isGenerating = true;
    const generateBtn = document.getElementById('generateBtn');
    const buttonLoader = document.getElementById('buttonLoader');
    
    // Update button state
    generateBtn.disabled = true;
    document.querySelector('.button-text').style.display = 'none';
    buttonLoader.style.display = 'flex';

    // Show loading container
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('loadingContainer').style.display = 'flex';
    
    // Reset progress
    document.getElementById('progressFill').style.width = '0%';

    try {
        // Call the backend API to generate schematic
        const response = await fetch(`${API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                edition: edition,
                style: style
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const apiData = await response.json();
        
        if (!apiData.success) {
            throw new Error(apiData.error || 'Generation failed');
        }

        // Simulate processing steps with visual feedback
        await simulateAIProcessing(description, edition, style);
        
        // Show preview with actual backend data
        showPreview(apiData, description, edition, style);
        
    } catch (error) {
        console.error('Error generating schematic:', error);
        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Cannot connect to backend. Make sure it\'s running on http://localhost:5000\n\nRun: python backend/app.py';
        }
        alert('❌ Error generating schematic:\n' + errorMsg);
        resetGenerator();
    }
}

async function simulateAIProcessing(description, edition, style) {
    const loadingText = document.getElementById('loadingText');
    const progressFill = document.getElementById('progressFill');
    
    const steps = [
        'Analyzing your description...',
        'Understanding the build style...',
        'Processing textures and materials...',
        'Generating structure data...',
        'Optimizing for performance...',
        'Finalizing schematic...'
    ];

    // Simulate 3-minute process (in demo, use 3 seconds for visual effect)
    const totalTime = 3000; // 3 seconds for demo
    const stepDuration = totalTime / steps.length;
    
    for (let i = 0; i < steps.length; i++) {
        loadingText.textContent = steps[i];
        
        await new Promise(resolve => {
            setTimeout(() => {
                const progress = ((i + 1) / steps.length) * 100;
                progressFill.style.width = progress + '%';
                resolve();
            }, stepDuration);
        });
    }
}

function showPreview(apiData, description, edition, style) {
    // Hide loading, show preview
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'flex';
    
    // Use actual backend data
    currentSchematic = {
        description,
        edition,
        style,
        dimensions: apiData.dimensions,
        blockCount: apiData.block_count,
        complexity: apiData.metadata.complexity,
        timestamp: apiData.metadata.generated,
        blocks: apiData.sample_blocks
    };

    // Update preview info with actual data
    const previewInfo = document.getElementById('previewInfo');
    const generatedTime = new Date(currentSchematic.timestamp).toLocaleString();
    previewInfo.innerHTML = `
        <strong>✅ Schematic Generated Successfully!</strong><br>
        <strong>Edition:</strong> ${edition.charAt(0).toUpperCase() + edition.slice(1)}<br>
        <strong>Style:</strong> ${style.charAt(0).toUpperCase() + style.slice(1)}<br>
        <strong>Dimensions:</strong> ${currentSchematic.dimensions.width} × ${currentSchematic.dimensions.height} × ${currentSchematic.dimensions.depth}<br>
        <strong>Total Blocks:</strong> ${currentSchematic.blockCount.toLocaleString()}<br>
        <strong>Complexity:</strong> ${currentSchematic.complexity}/25<br>
        <strong>Generated:</strong> ${generatedTime}
    `;

    // Draw preview
    drawPreview();

    // Re-enable generate button
    isGenerating = false;
    const generateBtn = document.getElementById('generateBtn');
    const buttonLoader = document.getElementById('buttonLoader');
    generateBtn.disabled = false;
    document.querySelector('.button-text').style.display = 'flex';
    buttonLoader.style.display = 'none';
}

function drawPreview() {
    const canvas = document.getElementById('previewCanvas');
    const placeholder = document.getElementById('previewPlaceholder');
    
    if (!canvas) return;

    // Show canvas instead of placeholder
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a simple isometric preview with actual block data
    if (currentSchematic && currentSchematic.blocks && currentSchematic.blocks.length > 0) {
        drawBlockPreview(ctx, canvas.width, canvas.height);
    } else {
        drawIsometricPreview(ctx, canvas.width, canvas.height);
    }
}

function drawBlockPreview(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const blockSize = 8;
    
    const colors = {
        98: '#8B7355',    // stone_bricks - brown
        17: '#654321',    // oak_wood - dark brown
        95: '#87CEEB',    // glass - light blue
        42: '#C0C0C0',    // iron_block - silver
        251: '#808080',   // concrete - gray
    };

    // Draw sample blocks from the schematic
    for (let i = 0; i < Math.min(currentSchematic.blocks.length, 50); i++) {
        const block = currentSchematic.blocks[i];
        const x = centerX + (block.x - 25) * 2;
        const y = centerY + (block.z - 25) * 2 - block.y * 3;
        
        const color = colors[block.block_id] || '#8b5cf6';
        drawIsometricBlock(ctx, x, y, blockSize, color);
    }

    // Add title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Schematic Preview', centerX, 30);
}

function drawIsometricPreview(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const blockSize = 15;

    // Define colors for different block types
    const colors = [
        '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'
    ];

    // Draw random blocks in isometric view
    const layers = 5;
    const blocksPerLayer = 8;

    for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < blocksPerLayer; i++) {
            const angle = (i / blocksPerLayer) * Math.PI * 2;
            const distance = 40 + layer * 30;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance - layer * 15;
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            drawIsometricBlock(ctx, x, y, blockSize, color);
        }
    }

    // Add title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('3D Schematic Preview', centerX, 30);

    // Add gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function drawIsometricBlock(ctx, x, y, size, color) {
    const points = [
        [x, y - size],
        [x + size, y - size / 2],
        [x + size, y + size / 2],
        [x, y + size],
        [x - size, y + size / 2],
        [x - size, y - size / 2]
    ];

    // Draw hexagon
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ==================== Download Schematic ====================
async function downloadSchematic() {
    if (!currentSchematic) {
        alert('No schematic to download!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/download/${currentSchematic.edition}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: currentSchematic.description,
                style: currentSchematic.style
            })
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `schematic_${Date.now()}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch) filename = filenameMatch[1];
        }

        // Download the file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        const extension = currentSchematic.edition === 'java' ? '.schematic' : '.mcstructure';
        alert(`✅ Downloaded: ${filename}\n\nYour ${currentSchematic.edition.toUpperCase()} Edition schematic is ready to use!`);
    } catch (error) {
        console.error('Download error:', error);
        alert('❌ Error downloading schematic:\n' + error.message);
    }
}

// ==================== Reset Generator ====================
function resetGenerator() {
    isGenerating = false;
    currentSchematic = null;
    
    // Reset form
    document.getElementById('buildDescription').value = '';
    document.getElementById('styleSelect').value = '';
    document.getElementById('charCount').textContent = '0';
    
    // Reset UI
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('loadingContainer').style.display = 'none';
    
    // Reset button
    const generateBtn = document.getElementById('generateBtn');
    const buttonLoader = document.getElementById('buttonLoader');
    generateBtn.disabled = false;
    document.querySelector('.button-text').style.display = 'flex';
    buttonLoader.style.display = 'none';
    
    // Reset canvas
    const canvas = document.getElementById('previewCanvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    document.getElementById('previewPlaceholder').style.display = 'flex';
}

// ==================== Event Listeners ====================
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('buildDescription');
    textarea.addEventListener('input', updateCharCount);
    
    // Add smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Handle contact buttons
    document.querySelectorAll('.contact-button').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.textContent.toLowerCase();
            if (text.includes('email')) {
                alert('📧 Email: contact@mcbuilders.com');
            } else if (text.includes('discord')) {
                alert('💬 Join our Discord: discord.gg/mcbuilders');
            } else if (text.includes('github')) {
                window.open('https://github.com/Y7Ammar/McBuilders', '_blank');
            }
        });
    });
});

// ==================== Keyboard Shortcuts ====================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isGenerating && document.getElementById('buildDescription').value.trim()) {
            generateSchematic();
        }
    }
    
    // Escape to reset
    if (e.key === 'Escape' && currentSchematic) {
        resetGenerator();
    }
});

// ==================== Canvas Resize Handler ====================
window.addEventListener('resize', function() {
    if (currentSchematic && document.getElementById('previewContainer').style.display !== 'none') {
        drawPreview();
    }
});
