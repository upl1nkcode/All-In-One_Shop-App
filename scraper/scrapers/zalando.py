"""
Zalando scraper — Example implementation.
In production, this would use Playwright or requests to scrape real pages.
For this skeleton, it returns mock data to demonstrate the pipeline.
"""
import logging
from .base import BaseScraper, ScrapedProduct

logger = logging.getLogger(__name__)


class ZalandoScraper(BaseScraper):
    """Scraper for zalando.com"""

    @property
    def store_name(self) -> str:
        return "Zalando"

    @property
    def base_url(self) -> str:
        return "https://www.zalando.com"

    def scrape(self) -> list[ScrapedProduct]:
        """
        Scrape products from Zalando.

        TODO: Replace with real scraping logic using Playwright:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page()
                page.goto(f"{self.base_url}/men/clothing/")
                # ... extract product data from page
                browser.close()
        """
        logger.info(f"Scraping {self.store_name} (mock mode)...")

        # Mock data — demonstrates the expected output format
        return [
            ScrapedProduct(
                name="Classic Black Hoodie",
                description="Comfortable cotton blend hoodie with adjustable drawstring hood.",
                brand="Nike",
                category="Hoodies",
                image_url="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
                price=54.00,
                original_price=65.00,
                currency="EUR",
                product_url="https://www.zalando.com/nike-hoodie",
                store_name="Zalando",
                sizes=["S", "M", "L", "XL"],
                colors=["Black"],
            ),
            ScrapedProduct(
                name="Premium Leather Jacket",
                description="Genuine leather jacket with asymmetric zip closure.",
                brand="Zara",
                category="Jackets",
                image_url="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
                price=189.00,
                original_price=220.00,
                currency="EUR",
                product_url="https://www.zalando.com/zara-leather",
                store_name="Zalando",
                sizes=["S", "M", "L", "XL"],
                colors=["Black", "Brown"],
            ),
        ]
