# McBuilders Backend Setup

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run the Backend Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

You should see output like:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### Step 3: Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-06-24T20:00:00.000000"
}
```

## API Endpoints

### POST /api/generate
Generate a Minecraft schematic from a description

**Request:**
```json
{
  "description": "A modern house with a garden and swimming pool",
  "style": "modern",
  "edition": "java"
}
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "width": 50,
    "height": 40,
    "depth": 50,
    "block_count": 5000,
    "style": "modern",
    "description": "a modern house with a garden and swimming pool",
    "generated": "2024-06-24T20:00:00.000000",
    "complexity": 15
  },
  "block_count": 5000,
  "dimensions": {
    "width": 50,
    "height": 40,
    "depth": 50
  },
  "sample_blocks": [...]
}
```

**Parameters:**
- `description` (required): Description of the build (max 500 characters)
- `style` (required): Building style - `modern`, `medieval`, `fantasy`, `industrial`, `nature`, `oriental`, `steampunk`, `minimalist`
- `edition` (required): `java` or `bedrock`

### POST /api/download/{edition}
Download the generated schematic file

**Request:**
```json
{
  "description": "A modern house",
  "style": "modern"
}
```

**Response:**
- Returns a `.schematic` file for Java Edition
- Returns a `.mcstructure` file for Bedrock Edition

### GET /api/health
Check if the API is running

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-24T20:00:00.000000"
}
```

### GET /api/stats
Get API statistics and supported options

**Response:**
```json
{
  "api_version": "1.0.0",
  "supported_styles": ["modern", "medieval", "fantasy", ...],
  "supported_editions": ["java", "bedrock"],
  "max_description_length": 500,
  "max_dimensions": {
    "width": 128,
    "height": 256,
    "depth": 128
  }
}
```

## Supported Styles

1. **Modern** - Contemporary buildings with clean lines and glass
2. **Medieval** - Medieval architecture with stone and wood
3. **Fantasy** - Magical and fantastical structures
4. **Industrial** - Industrial era buildings with metal and brick
5. **Nature** - Organic, nature-inspired builds
6. **Oriental** - Oriental/Asian-inspired architecture
7. **Steampunk** - Steampunk aesthetic with gears and metal
8. **Minimalist** - Minimalist design with simple forms

## How It Works

1. **Description Analysis**: The backend analyzes the build description to determine:
   - Complexity level (1-25)
   - Appropriate dimensions
   - Suitable materials

2. **Structure Generation**: Based on the style and description:
   - Generates a foundation
   - Creates walls with appropriate materials
   - Adds a roof structure
   - Adds details like windows and interior flooring

3. **File Export**: Converts the schematic to the requested format:
   - `.schematic` for Java Edition (Minecraft 1.12.2 and below)
   - `.mcstructure` for Bedrock Edition

## Frontend Integration

The frontend (index.html, styles.css, script.js) is configured to:
1. Send requests to `http://localhost:5000/api/generate`
2. Process the response and show a preview
3. Download the schematic file using `/api/download/{edition}`

Make sure the backend is running before using the website!

## Troubleshooting

### Port 5000 Already in Use
Change the port in `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

### CORS Errors
The backend has CORS enabled by default. If you get CORS errors:
- Make sure Flask-CORS is installed: `pip install flask-cors`
- Check that the backend is running on the same host/port

### Connection Refused
If you get "Connection refused" when generating schematics:
1. Make sure the backend server is running: `python backend/app.py`
2. Check the port number (default: 5000)
3. Ensure no firewall is blocking the connection

## Future Enhancements

- [ ] Integration with real AI models (GPT, LLaMA)
- [ ] Better NBT schematic format support
- [ ] WorldEdit format compatibility
- [ ] Schematic preview endpoint
- [ ] Batch generation
- [ ] Custom block palettes
- [ ] Performance optimization for large structures
