package com.example.resumeapp.controller;

import com.example.resumeapp.service.AccountService;
import com.example.resumeapp.service.AccountService.UserAccount;
import com.example.resumeapp.service.PortfolioService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final AccountService accountService;

    public PortfolioController(PortfolioService portfolioService, AccountService accountService) {
        this.portfolioService = portfolioService;
        this.accountService = accountService;
    }

    @GetMapping
    public Map<String, Object> list(HttpServletRequest request, Authentication authentication) {
        return portfolioService.list(accountService.resolve(request, authentication));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request,
            Authentication authentication
    ) {
        Optional<UserAccount> account = accountService.resolve(request, authentication);
        if (account.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "sign in before adding work"));
        }
        try {
            return ResponseEntity.ok(portfolioService.create(account.get(), body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<?> update(
            @PathVariable long itemId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request,
            Authentication authentication
    ) {
        Optional<UserAccount> account = accountService.resolve(request, authentication);
        if (account.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "sign in before changing work"));
        }
        try {
            return ResponseEntity.ok(portfolioService.update(account.get(), itemId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> delete(
            @PathVariable long itemId,
            HttpServletRequest request,
            Authentication authentication
    ) {
        Optional<UserAccount> account = accountService.resolve(request, authentication);
        if (account.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "sign in before deleting work"));
        }
        try {
            return ResponseEntity.ok(portfolioService.delete(account.get(), itemId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
