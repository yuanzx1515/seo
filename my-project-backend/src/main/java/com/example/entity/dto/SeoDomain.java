package com.example.entity.dto;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.util.Date;

@TableName("seo_domain")
@Data
public class SeoDomain {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Integer userId;

    // 域名
    private String domain;

    // 分组名，比如“默认分组”、“项目A”
    private String groupName;

    // 注册商：阿里云 / 腾讯云 / GoDaddy ...
    private String registrar;

    // 到期日期
    private LocalDate expireDate;

    // 最近解析到的 IP
    private String lastResolved;

    // NORMAL / UNRESOLVED / ERROR / EXPIRED
    private String status;

    private String remark;

    private Date createTime;
    private Date updateTime;
}
