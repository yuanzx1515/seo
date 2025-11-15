package com.example.utils;

import com.example.entity.dto.Account;
import com.example.service.AccountService;
import jakarta.annotation.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    @Resource
    private AccountService accountService;

    public Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal()==null) {
            throw new RuntimeException("未登录，无法获取用户信息");
        }
        Object principal = authentication.getPrincipal();
        if(!(principal instanceof User springUser)){
            throw new RuntimeException("无法获取用户信息");
        }
        String username = springUser.getUsername();
        Account account = accountService.findAccountByNameOrEmail(username);
        if(account == null){
            throw new RuntimeException("用户不存在");
        }
        return account.getId();
    }
}
