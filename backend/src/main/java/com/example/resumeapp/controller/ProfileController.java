package com.example.resumeapp.controller;

import com.example.resumeapp.service.HomeService;
import com.example.resumeapp.service.ProfileService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final ProfileService profileService;
    private final HomeService homeService;

    public ProfileController(ProfileService profileService, HomeService homeService) {
        this.profileService = profileService;
        this.homeService = homeService;
    }

    @GetMapping("/profile")
    public Map<String, Object> getProfile() {
        return profileService.getProfile();
    }

    @PostMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, Object> body) {
        return profileService.updateProfile(body);
    }

    @GetMapping("/home")
    public Map<String, Object> getHome(
            @RequestParam(name = "country", required = false) String country,
            @RequestParam(name = "city", required = false) String city
    ) {
        return homeService.getHome(country, city);
    }
}
