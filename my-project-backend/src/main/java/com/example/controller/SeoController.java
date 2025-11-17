package com.example.controller;

import com.example.entity.RestBean;
import com.example.entity.vo.KeywordQueryVO;
import com.example.service.KeywordQueryService;
import com.example.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/seo")
@Tag(name = "SEO 管理相关", description = "网站关键字查询 域名管理等操作")
public class SeoController {

    @Resource
    private KeywordQueryService keywordQueryService;

    @Resource
    private SecurityUtils securityUtils;

    @GetMapping("/keyword/query")
    @Operation(summary = "查询网站的标题和 meta 描述")
    public RestBean<KeywordQueryVO> queryKeyword(
            @RequestParam("url") @NotBlank(message = "url 参数不能为空") String url) {
        // 1. 获取当前登录用户 ID
        Integer userId = securityUtils.getCurrentUserId();

        // 2. 调业务层
        KeywordQueryVO result = keywordQueryService.queryKeyword(url, userId);

        // 3. 成功统一用 RestBean.success 包一层
        return RestBean.success(result);
    }
}
