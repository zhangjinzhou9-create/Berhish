package com.example.resumeapp.controller;

import com.example.resumeapp.service.AccountService;
import com.example.resumeapp.service.AccountService.UserAccount;
import com.example.resumeapp.service.PortfolioService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
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

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("mediaKind") String mediaKind,
            @RequestParam("type") String type,
            @RequestParam("title") String title,
            @RequestParam(value = "description", defaultValue = "") String description,
            @RequestParam(value = "layoutSize", defaultValue = "STANDARD") String layoutSize,
            @RequestParam(value = "mediaFit", defaultValue = "COVER") String mediaFit,
            @RequestParam(value = "displayOrder", defaultValue = "100") int displayOrder,
            @RequestParam(value = "public", defaultValue = "true") boolean isPublic,
            HttpServletRequest request,
            Authentication authentication
    ) {
        Optional<UserAccount> account = accountService.resolve(request, authentication);
        if (account.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "sign in before uploading work"));
        }
        try {
            return ResponseEntity.ok(portfolioService.createUploaded(
                    account.get(),
                    type,
                    title,
                    description,
                    mediaKind,
                    layoutSize,
                    mediaFit,
                    displayOrder,
                    isPublic,
                    file
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(507).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{itemId}/media")
    public ResponseEntity<?> media(
            @PathVariable long itemId,
            HttpServletRequest request,
            Authentication authentication
    ) {
        try {
            PortfolioService.MediaFile file = portfolioService.loadMedia(
                    accountService.resolve(request, authentication),
                    itemId
            );
            MediaType mediaType;
            try {
                mediaType = MediaType.parseMediaType(file.contentType());
            } catch (IllegalArgumentException ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .contentLength(file.size())
                    .header("X-Content-Type-Options", "nosniff")
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                            .filename(file.originalName(), StandardCharsets.UTF_8)
                            .build()
                            .toString())
                    .body(file.resource());
        } catch (PortfolioService.PortfolioAccessException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
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
