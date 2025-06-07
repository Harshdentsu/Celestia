from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from supabase import Client
import os
import json

def process_documents(embedding_type: str = "local", supabase_client: Client = None):
    """
    Process documents from Supabase and create a vector store with detailed context
    """
    try:
        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )

        # Get data from Supabase
        products = supabase_client.table('products').select("*").execute()
        inventory = supabase_client.table('inventory').select("*").execute()
        sales = supabase_client.table('sales').select("*").execute()
        claims = supabase_client.table('claims').select("*").execute()
        dealers = supabase_client.table('dealers').select("*").execute()

        documents = []

        # Products
        for product in products.data:
            doc = f"""
            Product:
            - SKU ID: {product.get('sku_id', 'N/A')}
            - Name: {product.get('product_name', 'N/A')}
            - Category: {product.get('category', 'N/A')}
            - Description: {product.get('description', 'N/A')}
            - Unit Price: ₹{product.get('unit_price', 'N/A')}
            - Created At: {product.get('created_at', 'N/A')}
            """
            documents.append(doc)

        # Inventory
        for inv in inventory.data:
            doc = f"""
            Inventory:
            - Inventory ID: {inv.get('inventory_id', 'N/A')}
            - SKU ID: {inv.get('sku_id', 'N/A')}
            - Warehouse Location: {inv.get('warehouse_location', 'N/A')}
            - Zone: {inv.get('zone', 'N/A')}
            - Quantity: {inv.get('quantity', 'N/A')}
            - Last Updated: {inv.get('last_updated', 'N/A')}
            """
            documents.append(doc)

        # Sales
        for sale in sales.data:
            doc = f"""
            Sale:
            - Sale ID: {sale.get('sale_id', 'N/A')}
            - Dealer ID: {sale.get('dealer_id', 'N/A')}
            - SKU ID: {sale.get('sku_id', 'N/A')}
            - Quantity: {sale.get('quantity', 'N/A')}
            - Sale Amount: ₹{sale.get('sale_amount', 'N/A')}
            - Sale Date: {sale.get('sale_date', 'N/A')}
            - Created At: {sale.get('created_at', 'N/A')}
            - Payment Status: {sale.get('payment_status', 'N/A')}
            """
            documents.append(doc)

        # Claims
        for claim in claims.data:
            doc = f"""
            Claim:
            - Claim ID: {claim.get('claim_id', 'N/A')}
            - Dealer ID: {claim.get('dealer_id', 'N/A')}
            - SKU ID: {claim.get('sku_id', 'N/A')}
            - Claim Amount: ₹{claim.get('claim_amount', 'N/A')}
            - Claim Type: {claim.get('claim_type', 'N/A')}
            - Status: {claim.get('status', 'N/A')}
            - Submission Date: {claim.get('submission_date', 'N/A')}
            - Resolution Date: {claim.get('resolution_date', 'N/A')}
            - Description: {claim.get('description', 'N/A')}
            """
            documents.append(doc)

        # Dealers
        for dealer in dealers.data:
            doc = f"""
            Dealer:
            - Dealer ID: {dealer.get('dealer_id', 'N/A')}
            - Name: {dealer.get('dealer_name', 'N/A')}
            - Region: {dealer.get('region', 'N/A')}
            - City: {dealer.get('city', 'N/A')}
            - State: {dealer.get('state', 'N/A')}
            - Contact Person: {dealer.get('contact_person', 'N/A')}
            - Email: {dealer.get('email', 'N/A')}
            - Phone: {dealer.get('phone', 'N/A')}
            - Created At: {dealer.get('created_at', 'N/A')}
            """
            documents.append(doc)

        vector_store = Chroma.from_texts(
            documents,
            embeddings,
            persist_directory="./chroma_db",
            metadatas=[{"source": "database", "type": "structured_data"} for _ in documents]
        )
        return vector_store
    except Exception as e:
        print(f"Error processing documents: {str(e)}")
        return None