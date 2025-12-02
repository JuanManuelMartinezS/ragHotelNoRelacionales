from pymongo import MongoClient
from bson import ObjectId

# ================= CONFIG =================
MONGODB_URI = "mongodb+srv://juanyaca2006_db_user:juanmanuel07@cluster0.563va5d.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "Hotel"
COLL_RESENA = "resena"

# ================= CONEXIÓN =================
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
collection = db[COLL_RESENA]

# ================= BUSCAR DUPLICADOS =================
print("=" * 80)
print("🔍 BUSCANDO COMENTARIOS DUPLICADOS")
print("=" * 80)

pipeline = [
    {
        "$group": {
            "_id": "$comentario",
            "count": {"$sum": 1},
            "ids": {"$push": "$_id"}
        }
    },
    {
        "$match": {"count": {"$gt": 1}}
    },
    {
        "$sort": {"count": -1}
    }
]

duplicates = list(collection.aggregate(pipeline))
total_duplicates = len(duplicates)
total_docs_to_delete = sum(dup["count"] - 1 for dup in duplicates)

print(f"\n📊 Estadísticas:")
print(f"   - Comentarios únicos duplicados: {total_duplicates}")
print(f"   - Total de documentos a eliminar: {total_docs_to_delete}")
print(f"   - Documentos que quedarán: {collection.count_documents({}) - total_docs_to_delete}")

if total_duplicates == 0:
    print("\n✅ No hay duplicados. Colección limpia.")
    client.close()
    exit(0)

# Mostrar top 5 duplicados
print(f"\n📋 Top 5 comentarios más duplicados:")
for i, dup in enumerate(duplicates[:5], 1):
    print(f"\n{i}. Repetido {dup['count']} veces:")
    print(f"   '{dup['_id'][:70]}...'")
    print(f"   IDs: {[str(id) for id in dup['ids'][:3]]}{'...' if len(dup['ids']) > 3 else ''}")

# ================= CONFIRMAR ELIMINACIÓN =================
print("\n" + "=" * 80)
print("⚠️  ADVERTENCIA")
print("=" * 80)
print(f"Se eliminarán {total_docs_to_delete} documentos duplicados.")
print("Para cada comentario duplicado, se mantendrá el PRIMER documento encontrado.")
print("=" * 80)

response = input("\n¿Deseas continuar con la eliminación? (yes/no): ")
if response.lower() != 'yes':
    print("❌ Operación cancelada.")
    client.close()
    exit(0)

# ================= ELIMINAR DUPLICADOS =================
print(f"\n🗑️  Eliminando duplicados...")
print("=" * 80)

deleted_count = 0
kept_count = 0

for dup in duplicates:
    comentario = dup["_id"]
    ids = dup["ids"]
    
    # Mantener el primer ID, eliminar el resto
    keep_id = ids[0]
    delete_ids = ids[1:]
    
    # Eliminar documentos duplicados
    result = collection.delete_many({"_id": {"$in": delete_ids}})
    
    deleted_count += result.deleted_count
    kept_count += 1
    
    if kept_count % 10 == 0:
        print(f"✅ Procesados {kept_count}/{total_duplicates} comentarios únicos")

print("\n" + "=" * 80)
print("🏁 LIMPIEZA COMPLETA")
print("=" * 80)
print(f"✅ Documentos eliminados: {deleted_count}")
print(f"✅ Documentos únicos mantenidos: {kept_count}")
print(f"📊 Total documentos en colección: {collection.count_documents({})}")

# ================= VERIFICACIÓN FINAL =================
print(f"\n🔍 Verificando que no queden duplicados...")
remaining_duplicates = list(collection.aggregate(pipeline))

if len(remaining_duplicates) == 0:
    print("✅ ¡Perfecto! No quedan duplicados en la colección.")
else:
    print(f"⚠️  Aún quedan {len(remaining_duplicates)} comentarios duplicados.")
    print("   Esto puede ocurrir si hay comentarios con espacios/caracteres diferentes.")

print("\n" + "=" * 80)
print("💡 SIGUIENTE PASO:")
print("   1. Recrea el índice vectorial en MongoDB Atlas")
print("   2. Espera a que esté en estado 'Active'")
print("   3. Prueba nuevamente tu búsqueda")
print("=" * 80)

client.close()