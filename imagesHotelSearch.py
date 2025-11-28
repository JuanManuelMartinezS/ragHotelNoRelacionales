from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image
from bson import ObjectId

# Helper to get hotel name from coll_hotels based on hotel_id
def get_hotel_name_from_id(hotel_id_val):
    if not hotel_id_val:
        return "N/A"
    
    # Attempt to find by ObjectId first (assuming _id in coll_hotels is ObjectId)
    try:
        hotel_doc = coll_hotels.find_one({"_id": ObjectId(hotel_id_val)}, {"name": 1})
        if hotel_doc:
            return hotel_doc.get("name", "Unknown Hotel")
    except:
        pass # hotel_id_val is not a valid ObjectId string, try other fields

    # Fallback: try finding by a string 'hotel_id' field if it exists in coll_hotels
    hotel_doc = coll_hotels.find_one({"hotel_id": hotel_id_val}, {"name": 1})
    if hotel_doc:
        return hotel_doc.get("name", "Unknown Hotel")
        
    return "Unknown Hotel"

# 1. Define a GET endpoint '/api/hotels/search/by-text'
@app.route('/api/hotels/search/by-text', methods=['GET'])
def search_hotels_by_text():
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    
    # Search for images in multimodal_rag.media (coll_images_ref)
    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10 # Default K, can be adjusted or passed as param
    )

    # Process results to include hotel names
    processed_results = []
    for img_doc in image_results:
        hotel_id_from_image = img_doc.get("hotel_id") # Assuming hotel_id is in image document
        hotel_name = get_hotel_name_from_id(hotel_id_from_image)
        
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_from_image) if hotel_id_from_image else None,
            "hotel_name": hotel_name
        })
        
    return jsonify(processed_results)

# 2. Define a GET endpoint '/api/hotels/search/by-text/<hotel_id>'
@app.route('/api/hotels/search/by-text/<hotel_id_param>', methods=['GET'])
def search_hotels_by_text_and_hotel(hotel_id_param):
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    filters = {"hotel_id": hotel_id_param} # Filter by the provided hotel_id

    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10,
        filters=filters
    )

    hotel_name = get_hotel_name_from_id(hotel_id_param)

    processed_results = []
    for img_doc in image_results:
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_param) if hotel_id_param else None,
            "hotel_name": hotel_name
        })
        
    return jsonify(processed_results)

# 3. Define a POST endpoint '/api/hotels/search/by-image'
@app.route('/api/hotels/search/by-image', methods=['POST'])
def search_hotels_by_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    try:
        img = Image.open(BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image file: {e}"}), 400

    query_embedding = embed_images_clip([img])[0].tolist()
    
    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10
    )

    processed_results = []
    for img_doc in image_results:
        hotel_id_from_image = img_doc.get("hotel_id") # Assuming hotel_id is in image document
        hotel_name = get_hotel_name_from_id(hotel_id_from_image)
        
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_from_image) if hotel_id_from_image else None,
            "hotel_name": hotel_name
        })

    return jsonify(processed_results)

# 4. Define a POST endpoint '/api/hotels/search/by-image/<hotel_id>'
@app.route('/api/hotels/search/by-image/<hotel_id_param>', methods=['POST'])
def search_hotels_by_image_and_hotel(hotel_id_param):
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    try:
        img = Image.open(BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image file: {e}"}), 400

    query_embedding = embed_images_clip([img])[0].tolist()
    filters = {"hotel_id": hotel_id_param} # Filter by the provided hotel_id

    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10,
        filters=filters
    )
    
    hotel_name = get_hotel_name_from_id(hotel_id_param)

    processed_results = []
    for img_doc in image_results:
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_param) if hotel_id_param else None,
            "hotel_name": hotel_name
        })

    return jsonify(processed_results)

print("✅ Hotel image search API endpoints defined.")
