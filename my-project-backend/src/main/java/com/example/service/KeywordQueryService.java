package com.example.service;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.entity.dto.KeywordQuery;
import com.example.entity.vo.KeywordQueryVO;

public interface KeywordQueryService extends IService<KeywordQuery> {

    /**
     *
     * @param url   网站 url
     * @param userId 用户 id
     * @return 查询结果
     */
    KeywordQueryVO queryKeyword(String url,Integer userId);
}
