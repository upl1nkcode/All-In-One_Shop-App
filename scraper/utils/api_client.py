"""API client for pushing scraped data to the AllInOne Shop backend."""
import logging
import requests
from scrapers.base import ScrapedProduct

logger = logging.getLogger(__name__)


class ApiClient:
    """HTTP client for backend API communication."""

    def __init__(self, base_url: str, api_key: str = ""):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        if api_key:
            self.session.headers["X-API-Key"] = api_key
        self.session.headers["Content-Type"] = "application/json"

    def upsert_product(self, product: ScrapedProduct) -> dict:
        """
        Push a scraped product to the backend.
        The backend handles deduplication by matching product name + brand.
        """
        payload = {
            "name": product.name,
            "description": product.description,
            "brand": product.brand,
            "category": product.category,
            "imageUrl": product.image_url,
            "sizes": product.sizes,
            "colors": product.colors,
            "additionalImages": product.additional_images,
            "price": {
                "storeName": product.store_name,
                "price": product.price,
                "originalPrice": product.original_price,
                "currency": product.currency,
                "productUrl": product.product_url,
                "inStock": product.in_stock,
            },
        }

        response = self.session.post(
            f"{self.base_url}/admin/ingest",
            json=payload,
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
