package com.example.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DomainBatchCreateDTO {

    @NotEmpty
    public List<DomainCreateItemDTO> items;
}
