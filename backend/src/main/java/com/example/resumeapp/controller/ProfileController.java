package com.example.resumeapp.controller;

import com.example.resumeapp.service.AccountService;
import com.example.resumeapp.service.AccountService.UserAccount;
import com.example.resumeapp.service.HomeService;
import com.example.resumeapp.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;
    private final HomeService homeService;
    private final AccountService accountService;

    public ProfileController(
            ProfileService profileService,
            HomeService homeService,
            AccountService accountService
    ) {
        this.profileService = profileService;
        this.homeService = homeService;
        this.accountService = accountService;
    }

    @GetMapping("/profile")
    public Map<String, Object> getProfile(
            HttpServletRequest request,
            Authentication authentication
    ) {
        Optional<UserAccount> account = accountService.resolve(request, authentication);
        return profileService.getProfileFor(account);
    }

    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request,
            Authentication authentication
    ) {
        Optional<UserAccount> account = accountService.resolve(request, authentication);
        if (account.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Sign in before changing profile data."));
        }
        try {
            return ResponseEntity.ok(profileService.updateProfile(account.get().id(), body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/home")
    public Map<String, Object> getHome(
            @RequestParam(name = "country", required = false) String country,
            @RequestParam(name = "city", required = false) String city
    ) {
        return homeService.getHome(country, city);
    }
}
