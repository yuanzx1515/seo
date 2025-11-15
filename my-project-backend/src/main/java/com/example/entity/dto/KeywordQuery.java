package com.example.entity.dto;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.entity.BaseData;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("db_keyword_query")
public class KeywordQuery implements BaseData {
    @TableId(type = IdType.AUTO)
    Integer id;
    String url;
    String title;
    String metaDescription;
    Integer userId;
    Date queryTime;
    String status;
    String errorMessage;
    Integer httpStatusCode;
}
