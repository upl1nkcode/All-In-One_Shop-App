package com.allinoneshop.controller;

import com.allinoneshop.dto.*;
import com.allinoneshop.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Catalog", description = "Categories, Brands, and Stores endpoints")
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/categories")
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = catalogService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/brands")
    @Operation(summary = "Get all brands")
    public ResponseEntity<ApiResponse<List<BrandDTO>>> getAllBrands() {
        List<BrandDTO> brands = catalogService.getAllBrands();
        return ResponseEntity.ok(ApiResponse.success(brands));
    }

    @GetMapping("/stores")
    @Operation(summary = "Get all stores")
    public ResponseEntity<ApiResponse<List<StoreDTO>>> getAllStores() {
        List<StoreDTO> stores = catalogService.getAllStores();
        return ResponseEntity.ok(ApiResponse.success(stores));
    }
}
