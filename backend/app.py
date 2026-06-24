import os
import json
import math
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import struct
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ==================== Schematic Builder ====================

class SchematicBuilder:
    """Generates Minecraft schematic data from descriptions"""
    
    # Block IDs for different materials
    BLOCKS = {
        'stone': 1,
        'dirt': 3,
        'grass_block': 2,
        'oak_wood': 17,
        'dark_oak_wood': 155,
        'spruce_wood': 84,
        'birch_wood': 162,
        'glass': 95,
        'oak_leaves': 18,
        'dark_oak_leaves': 161,
        'concrete': 251,
        'bricks': 45,
        'stone_bricks': 98,
        'oak_stairs': 53,
        'dark_oak_stairs': 160,
        'oak_slab': 44,
        'sand': 12,
        'gravel': 13,
        'cobblestone': 4,
        'iron_block': 42,
        'gold_block': 41,
        'diamond_block': 57,
        'emerald_block': 133,
        'water': 9,
        'lava': 11,
        'oak_log': 17,
        'dark_oak_log': 155,
    }
    
    STYLES = {
        'modern': {'materials': ['concrete', 'glass', 'dark_oak_wood'], 'height_ratio': 0.8},
        'medieval': {'materials': ['stone_bricks', 'dark_oak_wood', 'bricks'], 'height_ratio': 0.7},
        'fantasy': {'materials': ['purple_concrete', 'dark_oak_wood', 'emerald_block'], 'height_ratio': 0.9},
        'industrial': {'materials': ['iron_block', 'stone_bricks', 'concrete'], 'height_ratio': 0.75},
        'nature': {'materials': ['dark_oak_wood', 'oak_leaves', 'grass_block'], 'height_ratio': 0.6},
        'oriental': {'materials': ['dark_oak_wood', 'sand', 'dark_oak_stairs'], 'height_ratio': 0.65},
        'steampunk': {'materials': ['iron_block', 'dark_oak_wood', 'glass'], 'height_ratio': 0.8},
        'minimalist': {'materials': ['concrete', 'glass', 'stone'], 'height_ratio': 0.7},
    }
    
    def __init__(self, description, style, width=50, height=40, depth=50):
        self.description = description.lower()
        self.style = style
        self.width = width
        self.height = height
        self.depth = depth
        self.blocks = []
        self.metadata = {}
        
    def analyze_description(self):
        """Analyze description to determine build complexity"""
        keywords = {
            'house': 15, 'building': 15, 'tower': 20, 'castle': 25,
            'tree': 18, 'farm': 12, 'garden': 10, 'pool': 8,
            'wall': 5, 'bridge': 12, 'temple': 18, 'windmill': 16,
            'mansion': 20, 'cabin': 12, 'palace': 25, 'church': 18
        }
        
        complexity = 5  # Base complexity
        for keyword, value in keywords.items():
            if keyword in self.description:
                complexity = max(complexity, value)
                
        return min(complexity, 25)
    
    def generate_foundation(self):
        """Generate base foundation"""
        foundation_height = 2
        material_id = self.BLOCKS.get('stone_bricks', 98)
        
        for x in range(self.width):
            for z in range(self.depth):
                for y in range(foundation_height):
                    self.blocks.append({
                        'x': x, 'y': y, 'z': z,
                        'block_id': material_id,
                        'metadata': 0
                    })
    
    def generate_walls(self):
        """Generate main structure walls"""
        materials = self.STYLES[self.style]['materials']
        height_ratio = self.STYLES[self.style]['height_ratio']
        
        wall_height = int(self.height * height_ratio)
        wall_thickness = 1
        material_id = self.BLOCKS.get(materials[0], 98)
        
        # Front and back walls
        for x in range(self.width):
            for y in range(2, wall_height):
                for t in range(wall_thickness):
                    # Front wall
                    self.blocks.append({
                        'x': x, 'y': y, 'z': t,
                        'block_id': material_id,
                        'metadata': 0
                    })
                    # Back wall
                    self.blocks.append({
                        'x': x, 'y': y, 'z': self.depth - 1 - t,
                        'block_id': material_id,
                        'metadata': 0
                    })
        
        # Left and right walls
        for z in range(self.depth):
            for y in range(2, wall_height):
                for t in range(wall_thickness):
                    # Left wall
                    self.blocks.append({
                        'x': t, 'y': y, 'z': z,
                        'block_id': material_id,
                        'metadata': 0
                    })
                    # Right wall
                    self.blocks.append({
                        'x': self.width - 1 - t, 'y': y, 'z': z,
                        'block_id': material_id,
                        'metadata': 0
                    })
    
    def generate_roof(self):
        """Generate roof structure"""
        materials = self.STYLES[self.style]['materials']
        height_ratio = self.STYLES[self.style]['height_ratio']
        
        wall_height = int(self.height * height_ratio)
        roof_material = self.BLOCKS.get(materials[1], 17)
        roof_height = min(8, int(self.height - wall_height))
        
        for x in range(self.width):
            for z in range(self.depth):
                # Pyramid roof
                distance_to_edge = min(x, z, self.width - 1 - x, self.depth - 1 - z)
                max_distance = min(self.width, self.depth) // 2
                
                if distance_to_edge < max_distance:
                    roof_level = int((distance_to_edge / max_distance) * roof_height)
                    for y in range(wall_height, wall_height + roof_level):
                        self.blocks.append({
                            'x': x, 'y': y, 'z': z,
                            'block_id': roof_material,
                            'metadata': 0
                        })
    
    def generate_details(self):
        """Generate interior and decorative details"""
        materials = self.STYLES[self.style]['materials']
        detail_material = self.BLOCKS.get(materials[2] if len(materials) > 2 else materials[0], 95)
        
        # Windows
        window_positions = [
            (5, 5), (15, 5), (25, 5), (35, 5),
            (5, 20), (15, 20), (25, 20), (35, 20)
        ]
        
        wall_height = int(self.height * self.STYLES[self.style]['height_ratio'])
        
        for wx, wz in window_positions:
            if wx < self.width and wz < self.depth:
                for y in range(4, wall_height - 3):
                    self.blocks.append({
                        'x': wx, 'y': y, 'z': 0,
                        'block_id': self.BLOCKS['glass'],
                        'metadata': 0
                    })
        
        # Interior floor
        interior_start = 3
        interior_end_x = self.width - 3
        interior_end_z = self.depth - 3
        
        for x in range(interior_start, interior_end_x):
            for z in range(interior_start, interior_end_z):
                self.blocks.append({
                    'x': x, 'y': 3, 'z': z,
                    'block_id': self.BLOCKS.get('oak_wood', 17),
                    'metadata': 0
                })
    
    def generate_schematic(self):
        """Generate complete schematic"""
        self.generate_foundation()
        self.generate_walls()
        self.generate_roof()
        self.generate_details()
        
        self.metadata = {
            'width': self.width,
            'height': self.height,
            'depth': self.depth,
            'block_count': len(self.blocks),
            'style': self.style,
            'description': self.description,
            'generated': datetime.now().isoformat(),
            'complexity': self.analyze_description()
        }
        
        return self.blocks, self.metadata
    
    def to_schematic(self):
        """Convert to .schematic format (NBT-like structure)"""
        data = {
            'schematic': {
                'width': self.width,
                'height': self.height,
                'length': self.depth,
                'blocks': self.blocks,
                'metadata': self.metadata
            }
        }
        return json.dumps(data).encode('utf-8')
    
    def to_mcstructure(self):
        """Convert to .mcstructure format (Bedrock)"""
        data = {
            'format_version': 1,
            'size': [self.width, self.height, self.depth],
            'structure': {
                'block_indices': [[block['block_id'] for block in self.blocks]],
                'entities': [],
                'palette': {
                    'default': {
                        'block_palette': [
                            {'name': 'minecraft:stone'},
                            {'name': 'minecraft:dirt'},
                            {'name': 'minecraft:oak_wood'},
                            {'name': 'minecraft:glass'}
                        ]
                    }
                }
            },
            'metadata': self.metadata
        }
        return json.dumps(data).encode('utf-8')


# ==================== Flask Routes ====================

@app.route('/', methods=['GET'])
def index():
    """Serve the main page"""
    return jsonify({
        'message': 'McBuilders API',
        'version': '1.0.0',
        'endpoints': {
            'generate': 'POST /api/generate',
            'health': 'GET /api/health'
        }
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api/generate', methods=['POST'])
def generate_schematic():
    """Generate a schematic from description"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        description = data.get('description', '').strip()
        edition = data.get('edition', 'java').lower()
        style = data.get('style', 'modern').lower()
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        if len(description) > 500:
            return jsonify({'error': 'Description too long (max 500 chars)'}), 400
        
        if style not in SchematicBuilder.STYLES:
            return jsonify({
                'error': f'Invalid style. Choose from: {list(SchematicBuilder.STYLES.keys())}'
            }), 400
        
        if edition not in ['java', 'bedrock']:
            return jsonify({'error': 'Edition must be "java" or "bedrock"'}), 400
        
        # Generate random dimensions based on description
        complexity = 5
        keywords = description.split()
        if len(keywords) > 10:
            complexity += 3
        
        width = min(40 + complexity * 2, 128)
        height = min(30 + complexity * 2, 256)
        depth = min(40 + complexity * 2, 128)
        
        # Create and generate schematic
        builder = SchematicBuilder(description, style, width, height, depth)
        blocks, metadata = builder.generate_schematic()
        
        # Prepare response
        response_data = {
            'success': True,
            'metadata': metadata,
            'block_count': len(blocks),
            'dimensions': {
                'width': width,
                'height': height,
                'depth': depth
            },
            'sample_blocks': blocks[:20]  # Send first 20 blocks as sample
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<edition>', methods=['POST'])
def download_schematic(edition):
    """Download generated schematic"""
    try:
        data = request.get_json()
        
        description = data.get('description', '').strip()
        style = data.get('style', 'modern').lower()
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # Generate schematic
        builder = SchematicBuilder(description, style)
        blocks, metadata = builder.generate_schematic()
        
        # Generate file based on edition
        if edition == 'bedrock':
            file_data = builder.to_mcstructure()
            filename = f'McBuilders_{datetime.now().strftime("%Y%m%d_%H%M%S")}.mcstructure'
            mimetype = 'application/octet-stream'
        else:  # java
            file_data = builder.to_schematic()
            filename = f'McBuilders_{datetime.now().strftime("%Y%m%d_%H%M%S")}.schematic'
            mimetype = 'application/octet-stream'
        
        return send_file(
            io.BytesIO(file_data),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def stats():
    """Get API statistics"""
    return jsonify({
        'api_version': '1.0.0',
        'supported_styles': list(SchematicBuilder.STYLES.keys()),
        'supported_editions': ['java', 'bedrock'],
        'max_description_length': 500,
        'max_dimensions': {
            'width': 128,
            'height': 256,
            'depth': 128
        }
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
