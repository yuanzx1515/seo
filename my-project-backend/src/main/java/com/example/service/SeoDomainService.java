package com.example.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.entity.dto.DomainBatchCreateDTO;
import com.example.entity.dto.DomainCreateItemDTO;
import com.example.entity.dto.SeoDomain;

import java.util.List;


public interface SeoDomainService extends IService<SeoDomain> {


    //批量新增 +自动解析
    List<SeoDomain> batchCreateAndResolve(Integer userId,List<DomainCreateItemDTO> items);

    //查询当前用户按分组的表
    List<SeoDomain> listByGroup(Integer userId,String groupName);
}
