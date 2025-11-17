package com.example.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DomainCreateItemDTO {

    @NotBlank
    private String domain;

    private String groupName;

    private String registrar;

    private LocalDate expireDate;

    private String remark;
}
