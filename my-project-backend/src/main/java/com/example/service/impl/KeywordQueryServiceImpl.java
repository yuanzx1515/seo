package com.example.service.impl;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.entity.dto.KeywordQuery;
import com.example.entity.vo.KeywordQueryVO;
import com.example.mapper.KeywordQueryMapper;
import com.example.service.KeywordQueryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class KeywordQueryServiceImpl extends ServiceImpl<KeywordQueryMapper, KeywordQuery> implements KeywordQueryService {

    private final RestTemplate restTemplate = new RestTemplate();

    //代理


    //提取 tiele
    private static final Pattern TITLE_PATTERN = Pattern.compile("<title[^>]*>([^<]+)</title>", Pattern.CASE_INSENSITIVE);

    // 提取meta description的正则表达式
    private static final Pattern META_DESCRIPTION_PATTERN = Pattern.compile(
            "<meta[^>]*name=[\"']description[\"'][^>]*content=[\"']([^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public KeywordQueryVO queryKeyword(String url, Integer userId) {
        String normalizedUrl = normalizeUrl(url);
        KeywordQueryVO result = new KeywordQueryVO();
        result.setUrl(normalizedUrl);
        try {
            String html= fetchWebsiteContent(normalizedUrl);

            String title = extractTitle(html);
            String metaDescription = extractMetaDescription(html);

            result.setTitle(title.isEmpty() ? "未找到标题" : title);
            result.setMetaDescription(metaDescription.isEmpty() ? "未找到描述":metaDescription);

            saveQueryRecord(normalizedUrl,title,metaDescription,userId,"success",null,200);
        } catch (Exception e) {
            log.error("查询网站关键词失败",e.getMessage(),e);
            result.setTitle("");
            result.setMetaDescription("");

            saveQueryRecord(normalizedUrl,"","",userId,"failed",e.getMessage(),null);
            throw new RuntimeException("无法访问网站"+e.getMessage());
        }
        return result;
    }

    private String normalizeUrl(String url) {
        if(url == null || url.trim().isEmpty()){
            throw new IllegalArgumentException("url不能为空");
        }
        String normalize = url.trim();
        if(!normalize.startsWith("http://") && !normalize.startsWith("https://")){
            normalize = "http://" + normalize;
        }
        return normalize;
    }

    /**
     * 通过 cors 代理获取完整内容
     * @param url
     * @return
     */
    private String fetchWebsiteContent(String url) {
        try {
            ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("HTTP 状态码: " + responseEntity.getStatusCodeValue());
            }

            String content = responseEntity.getBody();
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("网站内容为空");
            }
            return content;
        } catch (Exception e) {
            log.error("获取网站内容失败, url={}, msg={}", url, e.getMessage(), e);
            throw new RuntimeException("获取网站内容失败: " + e.getMessage());
        }
    }


    private String extractTitle(String html){
       if(html == null || html.trim().isEmpty()){
           return "";
       }
       Matcher matcher = TITLE_PATTERN.matcher(html);
       if(matcher.find()){
           return matcher.group(1).trim();
       }
       return "";
    }

    private String extractMetaDescription(String html){
        if(html == null || html.trim().isEmpty()){
            return "";
        }
        Matcher matcher = META_DESCRIPTION_PATTERN.matcher(html);
        if(matcher.find()){
            return matcher.group(1).trim();
        }
        return "";
    }

    private void saveQueryRecord(String url,String title,String metaDescription,
                                 Integer userId,String status,String errorMessage,
                                 Integer httpStatusCode){
        try{
            KeywordQuery keywordQuery = new KeywordQuery();
            keywordQuery.setUrl(url);
            keywordQuery.setTitle(title);
            keywordQuery.setMetaDescription(metaDescription);
            keywordQuery.setUserId(userId);
            keywordQuery.setQueryTime(new Date());
            keywordQuery.setStatus(status);
            keywordQuery.setErrorMessage(errorMessage);
            keywordQuery.setHttpStatusCode(httpStatusCode);

            this.save(keywordQuery);
        } catch (Exception e){
            log.error("保存查询记录失败"+e.getMessage(),e);
        }
    }

}
