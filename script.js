// ==================== State Management ====================
let currentSchematic = null;
let isGenerating = false;

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
        // Simulate AI processing (2-3 minutes in real implementation)
        await simulateAIProcessing(description, edition, style);
        
        // After processing, show preview
        showPreview(description, edition, style);
    } catch (error) {
        console.error('Error generating schematic:', error);
        alert('Error generating schematic. Please try again.');
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

    // Simulate 3-minute process (in demo, use 6 seconds for 3 minutes of real processing)
    const totalTime = 6000; // 6 seconds for demo
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

function showPreview(description, edition, style) {
    // Hide loading, show preview
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'flex';
    
    // Create schematic data
    currentSchematic = {
        description,
        edition,
        style,
        dimensions: {
            width: Math.floor(Math.random() * 50) + 30,
            height: Math.floor(Math.random() * 40) + 20,
            depth: Math.floor(Math.random() * 50) + 30
        },
        blockCount: Math.floor(Math.random() * 5000) + 2000,
        timestamp: new Date().toLocaleString()
    };

    // Update preview info
    const previewInfo = document.getElementById('previewInfo');
    previewInfo.innerHTML = `
        <strong>Schematic Details:</strong><br>
        <strong>Edition:</strong> ${edition.charAt(0).toUpperCase() + edition.slice(1)}<br>
        <strong>Style:</strong> ${style.charAt(0).toUpperCase() + style.slice(1)}<br>
        <strong>Dimensions:</strong> ${currentSchematic.dimensions.width} × ${currentSchematic.dimensions.height} × ${currentSchematic.dimensions.depth}<br>
        <strong>Total Blocks:</strong> ${currentSchematic.blockCount.toLocaleString()}<br>
        <strong>Generated:</strong> ${currentSchematic.timestamp}
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

    // Draw a simple isometric preview
    drawIsometricPreview(ctx, canvas.width, canvas.height);
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
function downloadSchematic() {
    if (!currentSchematic) {
        alert('No schematic to download!');
        return;
    }

    const edition = currentSchematic.edition;
    const extension = edition === 'java' ? '.schematic' : '.mcstructure';
    const filename = `McBuilders_Schematic_${Date.now()}${extension}`;

    // Create a mock schematic file
    const schematicData = JSON.stringify({
        name: 'McBuilders Generated Schematic',
        description: currentSchematic.description,
        edition: edition,
        style: currentSchematic.style,
        dimensions: currentSchematic.dimensions,
        blockCount: currentSchematic.blockCount,
        created: currentSchematic.timestamp,
        blocks: generateMockBlockData(currentSchematic.blockCount)
    }, null, 2);

    // Create blob and download
    const blob = new Blob([schematicData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show feedback
    alert(`✅ Downloaded: ${filename}\n\nYour ${edition.toUpperCase()} Edition schematic is ready to use!`);
}

function generateMockBlockData(count) {
    const blockTypes = ['stone', 'oak_wood', 'dark_oak_wood', 'birch_wood', 'glass', 'dark_oak_leaves'];
    const blocks = [];

    for (let i = 0; i < Math.min(count, 100); i++) {
        blocks.push({
            x: Math.floor(Math.random() * 50),
            y: Math.floor(Math.random() * 40),
            z: Math.floor(Math.random() * 50),
            type: blockTypes[Math.floor(Math.random() * blockTypes.length)]
        });
    }

    return blocks;
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
