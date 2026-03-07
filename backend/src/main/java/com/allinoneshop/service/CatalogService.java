package com.allinoneshop.service;

import com.allinoneshop.dto.*;
import com.allinoneshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final StoreRepository storeRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .build())
                .collect(Collectors.toList());
    }

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(b -> BrandDTO.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .logoUrl(b.getLogoUrl())
                        .build())
                .collect(Collectors.toList());
    }

    public List<StoreDTO> getAllStores() {
        return storeRepository.findAll().stream()
                .map(s -> StoreDTO.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .website(s.getWebsite())
                        .logoUrl(s.getLogoUrl())
                        .build())
                .collect(Collectors.toList());
    }
}
