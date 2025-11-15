package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.entity.dto.KeywordQuery;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface KeywordQueryMapper extends BaseMapper<KeywordQuery> {

}
