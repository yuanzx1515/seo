package com.example.controller;

import com.example.entity.RestBean;
import com.example.entity.dto.DomainBatchCreateDTO;
import com.example.entity.dto.SeoDomain;
import com.example.service.SeoDomainService;
import com.example.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seo/domain")
@Tag(name = "域名管理", description = "批量添加 + 域名分组 + 注册商 + 到期时间")
@RequiredArgsConstructor
public class DomainController {

    private final SeoDomainService seoDomainService;
    private final SecurityUtils securityUtils;

    @PostMapping("/batch-create")
    @Operation(summary = "批量添加域名并自动解析")
    public RestBean<List<SeoDomain>> batchCreate(@RequestBody @Valid DomainBatchCreateDTO dto) {
        Integer userId = securityUtils.getCurrentUserId();
        List<SeoDomain> list = seoDomainService.batchCreateAndResolve(userId, dto.getItems());
        return RestBean.success(list);
    }

    @GetMapping("/list")
    @Operation(summary = "按分组查询我的域名列表")
    public RestBean<List<SeoDomain>> list(
            @RequestParam(value = "groupName", required = false) String groupName) {
        Integer userId = securityUtils.getCurrentUserId();
        List<SeoDomain> list = seoDomainService.listByGroup(userId, groupName);
        return RestBean.success(list);
    }
}
