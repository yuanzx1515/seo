package com.example.handler;

import com.example.entity.RestBean;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice   // 扫描所有 @RestController
public class GlobalExceptionHandler {

    /**
     * 处理参数校验异常（比如 @NotBlank 失败）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public RestBean<?> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldError() != null
                ? e.getBindingResult().getFieldError().getDefaultMessage()
                : "参数校验失败";
        return RestBean.failure(400, msg);
    }

    /**
     * 处理 IllegalArgumentException（你 normalizeUrl 里抛的）
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public RestBean<?> handleIllegalArgument(IllegalArgumentException e) {
        return RestBean.failure(400, e.getMessage());
    }

    /**
     * 兜底的 RuntimeException（比如访问网站失败）
     */
    @ExceptionHandler(RuntimeException.class)
    public RestBean<?> handleRuntimeException(RuntimeException e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return RestBean.failure(500, e.getMessage());
    }
}
