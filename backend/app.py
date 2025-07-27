from flask import Flask, jsonify, request
from flask_cors import CORS
import qrcode
import io
import base64
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Template data
CHRISTIAN_TEMPLATE = {
    "title": "In Loving Memory",
    "subtitle": "Remembering",
    "name": "John Doe",
    "instruction": "Scan to access memorial",
    "arabic": None,
    "image": "/static/images/christian-memorial.jpg",
    "qr": "/static/qr/christian-qr.png"
}

MUSLIM_TEMPLATE = {
    "title": "في ذكرى محبة",
    "subtitle": "تذكر",
    "name": "أحمد محمد",
    "instruction": "امسح للوصول للنصب التذكاري",
    "arabic": "في ذكرى محبة",
    "image": "/static/images/muslim-memorial.jpg",
    "qr": "/static/qr/muslim-qr.png"
}

@app.route('/api/christian-template', methods=['GET'])
def christian_template():
    """Get Christian memorial template"""
    return jsonify(CHRISTIAN_TEMPLATE)

@app.route('/api/muslim-template', methods=['GET'])
def muslim_template():
    """Get Muslim memorial template"""
    return jsonify(MUSLIM_TEMPLATE)

@app.route('/api/generate-qr', methods=['POST'])
def generate_qr():
    """Generate QR code for memorial"""
    data = request.get_json()
    memorial_id = data.get('memorial_id', 'default')
    
    # Create QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"https://gateofmemory.com/memorial/{memorial_id}")
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return jsonify({
        "qr_code": f"data:image/png;base64,{img_str}",
        "memorial_id": memorial_id
    })

@app.route('/api/upload-photo', methods=['POST'])
def upload_photo():
    """Upload memorial photo"""
    if 'photo' not in request.files:
        return jsonify({"error": "No photo provided"}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Save file (in production, you'd want to use cloud storage)
    filename = f"memorial_photo_{file.filename}"
    file.save(os.path.join('static/uploads', filename))
    
    return jsonify({
        "success": True,
        "filename": filename,
        "url": f"/static/uploads/{filename}"
    })

@app.route('/api/save-memorial', methods=['POST'])
def save_memorial():
    """Save memorial details"""
    data = request.get_json()
    
    # In production, you'd save to a database
    memorial_data = {
        "name": data.get('name'),
        "date": data.get('date'),
        "message": data.get('message'),
        "template_type": data.get('template_type', 'christian'),
        "id": f"memorial_{len(data)}"  # Simple ID generation
    }
    
    return jsonify({
        "success": True,
        "memorial": memorial_data
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Gate of Memory API is running"})

if __name__ == '__main__':
    # Create static directories if they don't exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('static/qr', exist_ok=True)
    os.makedirs('static/uploads', exist_ok=True)
    
    app.run(debug=True, host='127.0.0.1', port=5000) 