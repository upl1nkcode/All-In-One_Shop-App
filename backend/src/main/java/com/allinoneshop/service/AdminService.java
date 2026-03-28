package com.allinoneshop.service;

import com.allinoneshop.dto.BrandDTO;
import com.allinoneshop.dto.CategoryDTO;
import com.allinoneshop.dto.ProductDTO;
import com.allinoneshop.entity.Brand;
import com.allinoneshop.entity.Category;
import com.allinoneshop.entity.Product;
import com.allinoneshop.entity.ProductPrice;
import com.allinoneshop.entity.Store;
import com.allinoneshop.entity.enums.Gender;
import com.allinoneshop.repository.BrandRepository;
import com.allinoneshop.repository.CategoryRepository;
import com.allinoneshop.repository.ProductPriceRepository;
import com.allinoneshop.repository.ProductRepository;
import com.allinoneshop.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductPriceRepository priceRepository;
    private final MeilisearchService meilisearchService;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.count());
        stats.put("activeStores", storeRepository.count());
        stats.put("totalBrands", brandRepository.count());
        stats.put("totalPrices", priceRepository.count());
        stats.put("avgPrice", 0);
        stats.put("topPriceProduct", "N/A");
        return stats;
    }

    @Transactional
    public ProductDTO ingestProduct(Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String brandName = (String) payload.get("brand");
        String categoryName = (String) payload.get("category");
        
        // Find or create Brand
        Brand brand = null;
        if (brandName != null && !brandName.isEmpty()) {
            brand = brandRepository.findByName(brandName)
                    .orElseGet(() -> brandRepository.save(Brand.builder().name(brandName).build()));
        }

        // Find or create Category
        Category category = null;
        if (categoryName != null && !categoryName.isEmpty()) {
            category = categoryRepository.findByName(categoryName)
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(categoryName)
                            .slug(categoryName.toLowerCase().replace(" ", "-"))
                            .build()));
        }

        // Deduplication: look for product by name and brand
        Product product = null;
        if (brand != null) {
            List<Product> existing = productRepository.findByBrandName(brand.getName());
            product = existing.stream().filter(p -> p.getName().equalsIgnoreCase(name)).findFirst().orElse(null);
        }

        if (product == null) {
            product = new Product();
            product.setName(name);
            product.setBrand(brand);
            product.setCategory(category);
            product.setPrices(new ArrayList<>());
        }

        product.setDescription((String) payload.get("description"));
        product.setImageUrl((String) payload.get("imageUrl"));
        
        if (payload.get("sizes") instanceof List) {
            List<?> sizes = (List<?>) payload.get("sizes");
            product.setSizes(sizes.stream().map(Object::toString).toArray(String[]::new));
        }
        
        if (payload.get("colors") instanceof List) {
            List<?> colors = (List<?>) payload.get("colors");
            product.setColors(colors.stream().map(Object::toString).toArray(String[]::new));
        }
        
        if (payload.get("gender") != null) {
            try {
                product.setGender(Gender.valueOf(((String) payload.get("gender")).toUpperCase()));
            } catch (Exception e) {
                product.setGender(Gender.UNISEX);
            }
        } else {
            product.setGender(Gender.UNISEX);
        }

        product = productRepository.save(product);

        // Handle price entry
        @SuppressWarnings("unchecked")
        Map<String, Object> priceData = (Map<String, Object>) payload.get("price");
        if (priceData != null) {
            String storeName = (String) priceData.get("storeName");
            Store store = storeRepository.findByName(storeName)
                    .orElseGet(() -> storeRepository.save(Store.builder()
                            .name(storeName)
                            .website("https://" + storeName.toLowerCase() + ".com")
                            .isActive(true)
                            .build()));

            final Product fProduct = product;
            if (product.getPrices() == null) {
                product.setPrices(new ArrayList<>());
            }
            ProductPrice price = product.getPrices().stream()
                    .filter(p -> p.getStore().getId().equals(store.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        ProductPrice pp = new ProductPrice();
                        pp.setProduct(fProduct);
                        pp.setStore(store);
                        return pp;
                    });

            price.setPrice(new BigDecimal(priceData.get("price").toString()));
            if (priceData.get("originalPrice") != null) {
                price.setOriginalPrice(new BigDecimal(priceData.get("originalPrice").toString()));
            }
            price.setCurrency((String) priceData.get("currency"));
            price.setProductUrl((String) priceData.get("productUrl"));
            price.setInStock((Boolean) priceData.getOrDefault("inStock", true));

            priceRepository.save(price);
            
            // Add to product prices list if not already there to ensure the DTO gets the full mapping
            if (!product.getPrices().contains(price)) {
                product.getPrices().add(price);
            }
        }

        // Create full DTO to sync mapping
        ProductDTO dto = convertProductToDTO(product);

        meilisearchService.indexProduct(dto);

        return dto;
    }

    private List<Map<String, Object>> buildSeedProducts() {
        List<Map<String, Object>> products = new ArrayList<>();

        // ── Hoodies ──────────────────────────────────────────
        products.add(product("Classic Black Hoodie", "Nike", "Hoodies",
                "Comfortable cotton blend hoodie with adjustable drawstring hood and kangaroo pocket.",
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black"}, "UNISEX",
                price("Zalando", 54.00, 65.00, "https://www.zalando.com/nike-hoodie"),
                price("ASOS", 58.00, 65.00, "https://www.asos.com/nike-hoodie"),
                price("Nike", 65.00, null, "https://www.nike.com/hoodie")));

        products.add(product("Essentials Oversized Hoodie", "Adidas", "Hoodies",
                "Soft French terry oversized hoodie with ribbed cuffs and dropped shoulders.",
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
                new String[]{"S","M","L","XL","XXL"}, new String[]{"Grey","Black","Navy"}, "UNISEX",
                price("Zalando", 49.99, 60.00, "https://www.zalando.com/adidas-hoodie"),
                price("AboutYou", 52.00, 60.00, "https://www.aboutyou.com/adidas-hoodie")));

        products.add(product("Tech Fleece Pullover Hoodie", "Nike", "Hoodies",
                "Lightweight warmth with Nike Tech Fleece fabric. Modern slim fit.",
                "https://images.unsplash.com/photo-1578768079470-e6014a9b9bca?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Dark Grey","Black"}, "MEN",
                price("Nike", 109.99, null, "https://www.nike.com/tech-fleece"),
                price("Zalando", 99.99, 109.99, "https://www.zalando.com/nike-tech-fleece"),
                price("ASOS", 104.00, 109.99, "https://www.asos.com/nike-tech-fleece")));

        products.add(product("Trefoil Warm-Up Hoodie", "Adidas", "Hoodies",
                "Retro-inspired hoodie with bold trefoil logo across the chest.",
                "https://images.unsplash.com/photo-1614495039893-b0c30f702204?w=800&q=80",
                new String[]{"XS","S","M","L","XL"}, new String[]{"White","Green"}, "UNISEX",
                price("Adidas", 55.00, null, "https://www.adidas.com/trefoil-hoodie"),
                price("Zalando", 49.99, 55.00, "https://www.zalando.com/adidas-trefoil")));

        // ── Jackets ──────────────────────────────────────────
        products.add(product("Premium Leather Jacket", "Zara", "Jackets",
                "Genuine leather jacket with asymmetric zip closure and snap collar.",
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black","Brown"}, "MEN",
                price("Zalando", 189.00, 220.00, "https://www.zalando.com/zara-leather"),
                price("Zara", 220.00, null, "https://www.zara.com/leather-jacket"),
                price("ASOS", 195.00, 220.00, "https://www.asos.com/zara-leather")));

        products.add(product("Windrunner Jacket", "Nike", "Jackets",
                "Lightweight wind-resistant jacket with hood. Chevron design at the chest.",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black/White","Navy/Red"}, "UNISEX",
                price("Nike", 89.99, null, "https://www.nike.com/windrunner"),
                price("Zalando", 79.99, 89.99, "https://www.zalando.com/nike-windrunner"),
                price("ASOS", 82.00, 89.99, "https://www.asos.com/nike-windrunner")));

        products.add(product("Puffer Jacket", "The North Face", "Jackets",
                "700-fill down insulation puffer jacket. Packable and ultra-warm.",
                "https://images.unsplash.com/photo-1544923246-77307dd270b1?w=800&q=80",
                new String[]{"S","M","L","XL","XXL"}, new String[]{"Black","Red","Blue"}, "UNISEX",
                price("Zalando", 229.00, 280.00, "https://www.zalando.com/tnf-puffer"),
                price("AboutYou", 245.00, 280.00, "https://www.aboutyou.com/tnf-puffer")));

        products.add(product("Denim Trucker Jacket", "Levi's", "Jackets",
                "The original denim trucker jacket. Timeless style in rigid indigo wash.",
                "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Indigo","Light Wash"}, "UNISEX",
                price("Zalando", 79.99, 99.00, "https://www.zalando.com/levis-trucker"),
                price("ASOS", 85.00, 99.00, "https://www.asos.com/levis-trucker"),
                price("H&M", 89.99, 99.00, "https://www.hm.com/levis-trucker")));

        // ── Sneakers ─────────────────────────────────────────
        products.add(product("Air Max 270 React", "Nike", "Sneakers",
                "Lifestyle sneaker combining Air Max 270 cushioning with React foam.",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
                new String[]{"40","41","42","43","44","45"}, new String[]{"White/Black","Triple Black"}, "MEN",
                price("Nike", 159.99, null, "https://www.nike.com/air-max-270"),
                price("Zalando", 139.99, 159.99, "https://www.zalando.com/nike-air-max-270"),
                price("ASOS", 145.00, 159.99, "https://www.asos.com/nike-air-max-270")));

        products.add(product("Stan Smith", "Adidas", "Sneakers",
                "The iconic Stan Smith tennis shoe. Clean white leather with green accents.",
                "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80",
                new String[]{"38","39","40","41","42","43","44"}, new String[]{"White/Green","White/Navy"}, "UNISEX",
                price("Adidas", 99.99, null, "https://www.adidas.com/stan-smith"),
                price("Zalando", 84.99, 99.99, "https://www.zalando.com/adidas-stan-smith"),
                price("AboutYou", 89.00, 99.99, "https://www.aboutyou.com/adidas-stan-smith")));

        products.add(product("Old Skool", "Vans", "Sneakers",
                "Classic Vans Old Skool skate shoe with signature side stripe.",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
                new String[]{"38","39","40","41","42","43","44","45"}, new String[]{"Black/White"}, "UNISEX",
                price("Zalando", 69.99, 79.99, "https://www.zalando.com/vans-old-skool"),
                price("ASOS", 72.00, 79.99, "https://www.asos.com/vans-old-skool")));

        products.add(product("Ultraboost 22", "Adidas", "Sneakers",
                "Premium running shoe with responsive Boost midsole and Primeknit upper.",
                "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
                new String[]{"40","41","42","43","44","45"}, new String[]{"Core Black","Cloud White"}, "MEN",
                price("Adidas", 189.99, null, "https://www.adidas.com/ultraboost"),
                price("Zalando", 159.99, 189.99, "https://www.zalando.com/adidas-ultraboost"),
                price("Nike", 179.00, 189.99, "https://www.nike.com/adidas-ultraboost")));

        products.add(product("Air Jordan 1 Mid", "Nike", "Sneakers",
                "The Air Jordan 1 Mid brings full-leather build and classic AJ1 lines.",
                "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80",
                new String[]{"40","41","42","43","44","45"}, new String[]{"Black/Red","White/University Blue"}, "MEN",
                price("Nike", 129.99, null, "https://www.nike.com/air-jordan-1-mid"),
                price("Zalando", 119.99, 129.99, "https://www.zalando.com/jordan-1-mid"),
                price("ASOS", 124.00, 129.99, "https://www.asos.com/jordan-1-mid")));

        // ── T-Shirts ─────────────────────────────────────────
        products.add(product("Essential Cotton Tee", "H&M", "T-Shirts",
                "Soft organic cotton t-shirt with a relaxed fit and crew neck.",
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
                new String[]{"XS","S","M","L","XL","XXL"}, new String[]{"White","Black","Grey","Navy"}, "UNISEX",
                price("H&M", 9.99, null, "https://www.hm.com/essential-tee"),
                price("Zalando", 9.99, 12.99, "https://www.zalando.com/hm-tee"),
                price("ASOS", 11.00, 12.99, "https://www.asos.com/hm-tee")));

        products.add(product("Swoosh Logo Tee", "Nike", "T-Shirts",
                "Classic Nike t-shirt with embroidered Swoosh logo on the chest.",
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"White","Black","Red"}, "MEN",
                price("Nike", 29.99, null, "https://www.nike.com/swoosh-tee"),
                price("Zalando", 24.99, 29.99, "https://www.zalando.com/nike-swoosh-tee"),
                price("ASOS", 26.00, 29.99, "https://www.asos.com/nike-swoosh-tee")));

        products.add(product("Graphic Oversized Tee", "Zara", "T-Shirts",
                "Oversized fit tee with bold front graphic print.",
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black","White"}, "UNISEX",
                price("Zara", 25.99, null, "https://www.zara.com/graphic-tee"),
                price("Zalando", 22.99, 25.99, "https://www.zalando.com/zara-graphic-tee")));

        products.add(product("3-Stripe Tee", "Adidas", "T-Shirts",
                "Comfortable cotton tee featuring the iconic 3-stripe design on the sleeves.",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
                new String[]{"S","M","L","XL","XXL"}, new String[]{"White","Black","Navy"}, "UNISEX",
                price("Adidas", 34.99, null, "https://www.adidas.com/3-stripe-tee"),
                price("Zalando", 29.99, 34.99, "https://www.zalando.com/adidas-3-stripe-tee"),
                price("AboutYou", 31.00, 34.99, "https://www.aboutyou.com/adidas-3-stripe")));

        // ── Pants ────────────────────────────────────────────
        products.add(product("Tech Fleece Joggers", "Nike", "Pants",
                "Slim-fit joggers in Nike Tech Fleece for lightweight warmth.",
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black","Dark Grey"}, "MEN",
                price("Nike", 99.99, null, "https://www.nike.com/tech-fleece-joggers"),
                price("Zalando", 89.99, 99.99, "https://www.zalando.com/nike-tech-joggers"),
                price("ASOS", 94.00, 99.99, "https://www.asos.com/nike-tech-joggers")));

        products.add(product("Tiro Track Pants", "Adidas", "Pants",
                "Iconic training pants with tapered fit and 3-stripe design.",
                "https://images.unsplash.com/photo-1580906853149-2f04e0c0f3d8?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black/White","Navy/White"}, "UNISEX",
                price("Adidas", 49.99, null, "https://www.adidas.com/tiro-pants"),
                price("Zalando", 39.99, 49.99, "https://www.zalando.com/adidas-tiro"),
                price("ASOS", 42.00, 49.99, "https://www.asos.com/adidas-tiro")));

        products.add(product("Cargo Jogger Pants", "Zara", "Pants",
                "Relaxed cargo pants with elastic waist and multiple utility pockets.",
                "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Khaki","Black","Olive"}, "MEN",
                price("Zara", 39.99, null, "https://www.zara.com/cargo-joggers"),
                price("Zalando", 35.99, 39.99, "https://www.zalando.com/zara-cargo")));

        // ── Jeans ────────────────────────────────────────────
        products.add(product("501 Original Fit Jeans", "Levi's", "Jeans",
                "The original straight-leg jean. Button fly and iconic fit since 1873.",
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
                new String[]{"28","30","32","34","36"}, new String[]{"Medium Wash","Dark Indigo"}, "MEN",
                price("Zalando", 79.99, 99.00, "https://www.zalando.com/levis-501"),
                price("ASOS", 85.00, 99.00, "https://www.asos.com/levis-501"),
                price("H&M", 89.99, 99.00, "https://www.hm.com/levis-501")));

        products.add(product("Skinny Fit Jeans", "H&M", "Jeans",
                "Stretchy skinny jeans in dark wash denim with a comfortable fit.",
                "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80",
                new String[]{"28","30","32","34","36"}, new String[]{"Dark Blue","Black"}, "MEN",
                price("H&M", 24.99, null, "https://www.hm.com/skinny-jeans"),
                price("Zalando", 22.99, 24.99, "https://www.zalando.com/hm-skinny-jeans")));

        products.add(product("Wide Leg Jeans", "Zara", "Jeans",
                "Trendy wide-leg silhouette in rigid non-stretch denim.",
                "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
                new String[]{"XS","S","M","L"}, new String[]{"Light Blue","Ecru"}, "WOMEN",
                price("Zara", 45.99, null, "https://www.zara.com/wide-leg-jeans"),
                price("Zalando", 39.99, 45.99, "https://www.zalando.com/zara-wide-leg"),
                price("ASOS", 42.00, 45.99, "https://www.asos.com/zara-wide-leg")));

        // ── Women's items ────────────────────────────────────
        products.add(product("Fleece Crop Hoodie", "Nike", "Hoodies",
                "Cropped hoodie with oversized fit and brushed-back fleece.",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
                new String[]{"XS","S","M","L"}, new String[]{"Pink","Black","White"}, "WOMEN",
                price("Nike", 59.99, null, "https://www.nike.com/crop-hoodie"),
                price("Zalando", 49.99, 59.99, "https://www.zalando.com/nike-crop-hoodie"),
                price("ASOS", 54.00, 59.99, "https://www.asos.com/nike-crop-hoodie")));

        products.add(product("High Waist Leggings", "Nike", "Pants",
                "Dri-FIT high-waist leggings with mesh panels for ventilation.",
                "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
                new String[]{"XS","S","M","L","XL"}, new String[]{"Black","Navy","Dusty Rose"}, "WOMEN",
                price("Nike", 54.99, null, "https://www.nike.com/leggings"),
                price("Zalando", 44.99, 54.99, "https://www.zalando.com/nike-leggings"),
                price("AboutYou", 48.00, 54.99, "https://www.aboutyou.com/nike-leggings")));

        products.add(product("Satin Bomber Jacket", "Zara", "Jackets",
                "Lightweight satin bomber with ribbed collar and contrast lining.",
                "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
                new String[]{"XS","S","M","L"}, new String[]{"Olive","Black"}, "WOMEN",
                price("Zara", 69.99, null, "https://www.zara.com/satin-bomber"),
                price("Zalando", 59.99, 69.99, "https://www.zalando.com/zara-bomber"),
                price("ASOS", 62.00, 69.99, "https://www.asos.com/zara-bomber")));

        products.add(product("Platform Canvas Sneakers", "Vans", "Sneakers",
                "Old Skool platform with stacked sole for added height.",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
                new String[]{"36","37","38","39","40","41"}, new String[]{"Black/White","Checkerboard"}, "WOMEN",
                price("Zalando", 79.99, 89.99, "https://www.zalando.com/vans-platform"),
                price("ASOS", 82.00, 89.99, "https://www.asos.com/vans-platform")));

        // ── More variety ─────────────────────────────────────
        products.add(product("Classic Polo Shirt", "Ralph Lauren", "T-Shirts",
                "Signature mesh polo shirt with embroidered pony logo.",
                "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
                new String[]{"S","M","L","XL","XXL"}, new String[]{"White","Navy","Red","Green"}, "MEN",
                price("Zalando", 79.99, 99.00, "https://www.zalando.com/ralph-polo"),
                price("AboutYou", 85.00, 99.00, "https://www.aboutyou.com/ralph-polo")));

        products.add(product("Rain Jacket", "The North Face", "Jackets",
                "Waterproof DryVent shell with adjustable hood for all-weather protection.",
                "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80",
                new String[]{"S","M","L","XL"}, new String[]{"Black","Blue","Yellow"}, "UNISEX",
                price("Zalando", 119.99, 149.00, "https://www.zalando.com/tnf-rain"),
                price("AboutYou", 129.00, 149.00, "https://www.aboutyou.com/tnf-rain"),
                price("ASOS", 125.00, 149.00, "https://www.asos.com/tnf-rain")));

        products.add(product("Relaxed Fit Chinos", "H&M", "Pants",
                "Relaxed-fit chino pants in twill cotton with a comfortable stretch.",
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
                new String[]{"28","30","32","34","36"}, new String[]{"Beige","Black","Olive"}, "MEN",
                price("H&M", 29.99, null, "https://www.hm.com/relaxed-chinos"),
                price("Zalando", 27.99, 29.99, "https://www.zalando.com/hm-chinos")));

        return products;
    }

    private Map<String, Object> product(String name, String brand, String category,
                                         String description, String imageUrl,
                                         String[] sizes, String[] colors, String gender,
                                         Map<String, Object>... priceEntries) {
        Map<String, Object> p = new HashMap<>();
        p.put("name", name);
        p.put("brand", brand);
        p.put("category", category);
        p.put("description", description);
        p.put("imageUrl", imageUrl);
        p.put("sizes", List.of(sizes));
        p.put("colors", List.of(colors));
        p.put("gender", gender);
        // Ingest one price at a time — call ingestProduct per store
        // Store first price directly
        if (priceEntries.length > 0) {
            p.put("price", priceEntries[0]);
        }
        p.put("_additionalPrices", priceEntries.length > 1 ?
                java.util.Arrays.copyOfRange(priceEntries, 1, priceEntries.length) : new Map[0]);
        return p;
    }

    private Map<String, Object> price(String storeName, double priceVal, Double originalPrice, String url) {
        Map<String, Object> m = new HashMap<>();
        m.put("storeName", storeName);
        m.put("price", priceVal);
        if (originalPrice != null) m.put("originalPrice", originalPrice);
        m.put("currency", "EUR");
        m.put("productUrl", url);
        m.put("inStock", true);
        return m;
    }

    @Transactional
    public Map<String, Object> runScraper() {
        List<Map<String, Object>> seedProducts = buildSeedProducts();
        int ingested = 0;

        for (Map<String, Object> productData : seedProducts) {
            try {
                // Ingest with first price
                ingestProduct(productData);
                ingested++;

                // Ingest additional prices (other stores)
                @SuppressWarnings("unchecked")
                Map<String, Object>[] additional = (Map<String, Object>[]) productData.get("_additionalPrices");
                if (additional != null) {
                    for (Map<String, Object> extraPrice : additional) {
                        Map<String, Object> copy = new HashMap<>(productData);
                        copy.put("price", extraPrice);
                        copy.remove("_additionalPrices");
                        ingestProduct(copy);
                    }
                }
            } catch (Exception e) {
                // continue on error
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalProducts", seedProducts.size());
        result.put("totalIngested", ingested);
        result.put("totalStores", storeRepository.count());
        result.put("totalPrices", priceRepository.count());
        return result;
    }

    private ProductDTO convertProductToDTO(Product product) {
        BigDecimal lowestPrice = null;
        BigDecimal highestPrice = null;

        if (product.getPrices() != null && !product.getPrices().isEmpty()) {
            lowestPrice = product.getPrices().stream()
                    .map(ProductPrice::getPrice)
                    .min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            highestPrice = product.getPrices().stream()
                    .map(ProductPrice::getPrice)
                    .max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        }

        BrandDTO brandDTO = product.getBrand() != null ?
                BrandDTO.builder().id(product.getBrand().getId()).name(product.getBrand().getName()).build() : null;
        CategoryDTO categoryDTO = product.getCategory() != null ?
                CategoryDTO.builder().id(product.getCategory().getId()).name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug()).build() : null;

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .brand(brandDTO)
                .category(categoryDTO)
                .sizes(product.getSizes())
                .colors(product.getColors())
                .lowestPrice(lowestPrice)
                .highestPrice(highestPrice)
                .storeCount(product.getPrices() != null ? product.getPrices().size() : 0)
                .isActive(product.getIsActive())
                .gender(product.getGender() != null ? product.getGender().name() : null)
                .build();
    }
}
