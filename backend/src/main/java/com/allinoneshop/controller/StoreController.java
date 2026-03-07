package com.allinoneshop.controller;

import com.allinoneshop.dto.*;
import com.allinoneshop.repository.StoreRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@Tag(name = "Stores", description = "Store information endpoints")
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping
    @Operation(summary = "Get all stores")
    public ResponseEntity<ApiResponse<List<StoreDTO>>> getAllStores() {
        List<StoreDTO> stores = storeRepository.findAll().stream()
                .map(store -> StoreDTO.builder()
                        .id(store.getId())
                        .name(store.getName())
                        .website(store.getWebsite())
                        .logoUrl(store.getLogoUrl())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get store by ID")
    public ResponseEntity<ApiResponse<StoreDTO>> getStoreById(@PathVariable UUID id) {
        return storeRepository.findById(id)
                .map(store -> ResponseEntity.ok(ApiResponse.success(
                        StoreDTO.builder()
                                .id(store.getId())
                                .name(store.getName())
                                .website(store.getWebsite())
                                .logoUrl(store.getLogoUrl())
                                .build())))
                .orElse(ResponseEntity.notFound().build());
    }
}
