package com.example.service.impl;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.entity.dto.DomainBatchCreateDTO;
import com.example.entity.dto.DomainCreateItemDTO;
import com.example.entity.dto.SeoDomain;
import com.example.mapper.SeoDomainMapper;
import com.example.service.SeoDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeoDomainServiceImpl extends ServiceImpl<SeoDomainMapper, SeoDomain> implements SeoDomainService {


    @Override
    public List<SeoDomain> batchCreateAndResolve(Integer userId, List<DomainCreateItemDTO> items) {
        List<SeoDomain> seoDomains = new ArrayList<>();
        for (DomainCreateItemDTO item : items) {
            SeoDomain d = new SeoDomain();
            d.setUserId(userId);
            d.setDomain(item.getDomain().trim());
            d.setGroupName(item.getGroupName());
            d.setRegistrar(item.getRegistrar());
            d.setExpireDate(item.getExpireDate());
            d.setRemark(item.getRemark());
            d.setStatus("UNKNOWN");
            this.save(d);

            doResolveAndUpdate(d);
            seoDomains.add(d);
        }
        return seoDomains;
    }

    @Override
    public List<SeoDomain> listByGroup(Integer userId, String groupName) {
        return lambdaQuery()
                .eq(SeoDomain::getUserId,userId)
                .eq(groupName != null && !groupName.isBlank(),SeoDomain::getGroupName,groupName)
                .orderByDesc(SeoDomain::getUpdateTime)
                .list();
    }


    private void doResolveAndUpdate(SeoDomain d) {
        String domain = d.getDomain();
        String resolved = null;
        String status;

        try {
            // 如果设置了到期时间且已经过期，直接标记 EXPIRED
            if (d.getExpireDate() != null && d.getExpireDate().isBefore(LocalDate.now())) {
                status = "EXPIRED";
            } else {
                InetAddress[] addresses = InetAddress.getAllByName(domain);
                if (addresses.length == 0) {
                    status = "UNRESOLVED";
                } else {
                    resolved = addresses[0].getHostAddress();
                    status = "NORMAL";
                }
            }
        } catch (Exception e) {
            log.error("解析域名失败 domain={}, msg={}", domain, e.getMessage(), e);
            status = "ERROR";
        }

        d.setLastResolved(resolved);
        d.setStatus(status);
        updateById(d);
    }
}
