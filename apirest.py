# ===== GENERIC QUERY ENDPOINT =====

@app.route('/api/query', methods=['POST'])
def generic_query():
    """
    Generic query endpoint for READ operations.
    
    Request body (JSON):
    {
        "database": "Hotel",
        "collection": "hotel",
        "query": {"name": "Hotel Example"},  // Optional
        "projection": {"name": 1, "_id": 0},  // Optional
        "limit": 10,  // Optional
        "username": "custom_user",  // Optional - uses default if not provided
        "password": "custom_pass"  // Optional - required if username is provided
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required."}), 400
    
    database_name = data.get('database')
    collection_name = data.get('collection')
    
    if not database_name or not collection_name:
        return jsonify({"error": "Both 'database' and 'collection' are required."}), 400
    
    query = data.get('query', {})
    projection = data.get('projection')
    limit = data.get('limit', 0)
    username = data.get('username')
    password = data.get('password')
    
    print(f"\n🔍 [GENERIC QUERY]")
    print(f"   Database: {database_name}")
    print(f"   Collection: {collection_name}")
    print(f"   Query: {query}")
    print(f"   Projection: {projection}")
    print(f"   Limit: {limit}")
    print(f"   Custom User: {username if username else 'Using default'}")
    
    try:
        results = execute_query(database_name, collection_name, query, projection, limit, username, password)
        print(f"✅ Query returned {len(results)} documents")
        
        # Convert ObjectId to string for JSON serialization
        for doc in results:
            if '_id' in doc:
                doc['_id'] = str(doc['_id'])
        
        return jsonify(results)
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insert', methods=['POST'])
def insert_document():
    """
    Insert one or multiple documents into a collection.
    
    Request body (JSON):
    {
        "database": "Hotel",
        "collection": "resena",
        "document": {"comentario": "Excelente hotel", "rating": 5},  // For single insert
        "documents": [{"comentario": "Bien"}, {"comentario": "Mal"}],  // For multiple inserts
        "username": "custom_user",  // Optional
        "password": "custom_pass"  // Optional
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required."}), 400
    
    database_name = data.get('database')
    collection_name = data.get('collection')
    document = data.get('document')
    documents = data.get('documents')
    username = data.get('username')
    password = data.get('password')
    
    if not database_name or not collection_name:
        return jsonify({"error": "Both 'database' and 'collection' are required."}), 400
    
    if not document and not documents:
        return jsonify({"error": "Either 'document' or 'documents' is required."}), 400
    
    if document and documents:
        return jsonify({"error": "Provide either 'document' OR 'documents', not both."}), 400
    
    print(f"\n➕ [INSERT]")
    print(f"   Database: {database_name}")
    print(f"   Collection: {collection_name}")
    print(f"   Custom User: {username if username else 'Using default'}")
    
    try:
        # Use custom credentials if provided
        if username and password:
            password_encoded = quote_plus(password)
            custom_uri = f"mongodb+srv://{username}:{password_encoded}@{CLUSTER}/?retryWrites=true&w=majority&appName={APPNAME}"
            custom_client = MongoClient(custom_uri)
            db = custom_client[database_name]
        else:
            db = client[database_name]
        
        collection = db[collection_name]
        
        # Insert single document
        if document:
            result = collection.insert_one(document)
            inserted_id = str(result.inserted_id)
            print(f"✅ Document inserted with _id: {inserted_id}")
            
            response = {
                "success": True,
                "inserted_id": inserted_id,
                "inserted_count": 1
            }
        
        # Insert multiple documents
        else:
            result = collection.insert_many(documents)
            inserted_ids = [str(id) for id in result.inserted_ids]
            print(f"✅ {len(inserted_ids)} documents inserted")
            
            response = {
                "success": True,
                "inserted_ids": inserted_ids,
                "inserted_count": len(inserted_ids)
            }
        
        # Close custom client if it was created
        if username and password:
            custom_client.close()
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/update', methods=['POST'])
def update_document():
    """
    Update one or multiple documents in a collection.
    
    Request body (JSON):
    {
        "database": "Hotel",
        "collection": "resena",
        "query": {"_id": "65abc123..."},  // Filter
        "update": {"$set": {"rating": 5}},  // Update operation
        "update_many": false,  // Optional - false for updateOne, true for updateMany
        "username": "custom_user",  // Optional
        "password": "custom_pass"  // Optional
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required."}), 400
    
    database_name = data.get('database')
    collection_name = data.get('collection')
    query = data.get('query')
    update = data.get('update')
    update_many = data.get('update_many', False)
    username = data.get('username')
    password = data.get('password')
    
    if not all([database_name, collection_name, query, update]):
        return jsonify({"error": "'database', 'collection', 'query', and 'update' are required."}), 400
    
    print(f"\n🔄 [UPDATE]")
    print(f"   Database: {database_name}")
    print(f"   Collection: {collection_name}")
    print(f"   Query: {query}")
    print(f"   Update: {update}")
    print(f"   Update Many: {update_many}")
    
    try:
        if username and password:
            password_encoded = quote_plus(password)
            custom_uri = f"mongodb+srv://{username}:{password_encoded}@{CLUSTER}/?retryWrites=true&w=majority&appName={APPNAME}"
            custom_client = MongoClient(custom_uri)
            db = custom_client[database_name]
        else:
            db = client[database_name]
        
        collection = db[collection_name]
        
        if update_many:
            result = collection.update_many(query, update)
            print(f"✅ {result.modified_count} documents updated")
            response = {
                "success": True,
                "matched_count": result.matched_count,
                "modified_count": result.modified_count
            }
        else:
            result = collection.update_one(query, update)
            print(f"✅ Document updated")
            response = {
                "success": True,
                "matched_count": result.matched_count,
                "modified_count": result.modified_count
            }
        
        if username and password:
            custom_client.close()
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete', methods=['POST'])
def delete_document():
    """
    Delete one or multiple documents from a collection.
    
    Request body (JSON):
    {
        "database": "Hotel",
        "collection": "resena",
        "query": {"_id": "65abc123..."},  // Filter
        "delete_many": false,  // Optional - false for deleteOne, true for deleteMany
        "username": "custom_user",  // Optional
        "password": "custom_pass"  // Optional
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required."}), 400
    
    database_name = data.get('database')
    collection_name = data.get('collection')
    query = data.get('query')
    delete_many = data.get('delete_many', False)
    username = data.get('username')
    password = data.get('password')
    
    if not all([database_name, collection_name, query]):
        return jsonify({"error": "'database', 'collection', and 'query' are required."}), 400
    
    print(f"\n🗑️  [DELETE]")
    print(f"   Database: {database_name}")
    print(f"   Collection: {collection_name}")
    print(f"   Query: {query}")
    print(f"   Delete Many: {delete_many}")
    
    try:
        if username and password:
            password_encoded = quote_plus(password)
            custom_uri = f"mongodb+srv://{username}:{password_encoded}@{CLUSTER}/?retryWrites=true&w=majority&appName={APPNAME}"
            custom_client = MongoClient(custom_uri)
            db = custom_client[database_name]
        else:
            db = client[database_name]
        
        collection = db[collection_name]
        
        if delete_many:
            result = collection.delete_many(query)
            print(f"✅ {result.deleted_count} documents deleted")
        else:
            result = collection.delete_one(query)
            print(f"✅ Document deleted")
        
        response = {
            "success": True,
            "deleted_count": result.deleted_count
        }
        
        if username and password:
            custom_client.close()
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500
