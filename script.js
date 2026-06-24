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

    // Draw actual schematic blocks if available
    if (currentSchematic && currentSchematic.blocks && currentSchematic.blocks.length > 0) {
        drawBlockPreview(ctx, canvas.width, canvas.height);
    } else {
        // Fallback to isometric preview
        drawIsometricPreview(ctx, canvas.width, canvas.height);
    }
}

function drawBlockPreview(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const blockSize = 12;
    
    // Block color mapping
    const colors = {
        1: '#8B7355',    // stone - brown
        2: '#90EE90',    // grass_block - light green
        3: '#8B7355',    // dirt - brown
        4: '#696969',    // cobblestone - dark gray
        9: '#4A90E2',    // water - blue
        11: '#FF6347',   // lava - red
        12: '#F4A460',   // sand - sandy
        13: '#A9A9A9',   // gravel - gray
        17: '#654321',   // oak_wood - dark brown
        18: '#228B22',   // oak_leaves - forest green
        42: '#C0C0C0',   // iron_block - silver
        44: '#696969',   // oak_slab - dark gray
        45: '#DC143C',   // bricks - crimson
        53: '#8B4513',   // oak_stairs - saddle brown
        84: '#8B4513',   // spruce_wood - saddle brown
        95: '#87CEEB',   // glass - sky blue
        98: '#A0826D',   // stone_bricks - tan
        133: '#50C878',  // emerald_block - emerald
        155: '#8B4513',  // dark_oak_wood - saddle brown
        160: '#8B4513',  // dark_oak_stairs - saddle brown
        161: '#228B22',  // dark_oak_leaves - forest green
        162: '#D2B48C',  // birch_wood - tan
        251: '#808080',  // concrete - gray
    };

    // Sort blocks by Y position for proper rendering (back to front)
    const sortedBlocks = [...currentSchematic.blocks].sort((a, b) => {
        const distA = Math.sqrt((a.x - 25) ** 2 + (a.z - 25) ** 2 + a.y ** 2);
        const distB = Math.sqrt((b.x - 25) ** 2 + (b.z - 25) ** 2 + b.y ** 2);
        return distA - distB;
    });

    // Draw blocks
    for (const block of sortedBlocks) {
        // Isometric projection
        const x = centerX + (block.x - 25) * 3 - (block.z - 25) * 3;
        const y = centerY + (block.x - 25) * 1.5 + (block.z - 25) * 1.5 - block.y * 4;
        
        const color = colors[block.block_id] || '#8b5cf6';
        drawIsometricBlock(ctx, x, y, blockSize, color);
    }

    // Add title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentSchematic.blockCount.toLocaleString()} Blocks Generated`, centerX, 35);
    ctx.font = '12px Arial';
    ctx.fillText(`${currentSchematic.dimensions.width}×${currentSchematic.dimensions.height}×${currentSchematic.dimensions.depth}`, centerX, 55);
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

    // Draw border with shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}