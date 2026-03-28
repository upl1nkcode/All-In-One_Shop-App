"""
AllInOne Shop — Python Scraper
Collects product data from online stores and pushes to the backend API.
"""
import os
import time
import schedule
import logging
from scrapers.zalando import ZalandoScraper
from utils.api_client import ApiClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

API_URL = os.getenv('SCRAPER_API_URL', 'http://localhost:8080/api')
API_KEY = os.getenv('SCRAPER_API_KEY', '')


def run_scrapers():
    """Run all configured scrapers."""
    logger.info("Starting scrape cycle...")
    client = ApiClient(API_URL, API_KEY)

    scrapers = [
        ZalandoScraper(),
    ]

    for scraper in scrapers:
        try:
            logger.info(f"Running {scraper.store_name} scraper...")
            products = scraper.scrape()
            logger.info(f"Found {len(products)} products from {scraper.store_name}")

            for product in products:
                try:
                    client.upsert_product(product)
                except Exception as e:
                    logger.error(f"Failed to push product: {e}")

            logger.info(f"Completed {scraper.store_name} scraper")
        except Exception as e:
            logger.error(f"Scraper {scraper.store_name} failed: {e}")

    logger.info("Scrape cycle complete.")


if __name__ == '__main__':
    # Run once immediately on startup
    run_scrapers()

    # Schedule to run every 6 hours
    schedule.every(6).hours.do(run_scrapers)

    logger.info("Scraper scheduler started. Running every 6 hours.")
    while True:
        schedule.run_pending()
        time.sleep(60)
