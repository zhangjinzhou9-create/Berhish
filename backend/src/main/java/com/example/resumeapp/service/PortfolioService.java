package com.example.resumeapp.service;

import com.example.resumeapp.service.AccountService.UserAccount;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PortfolioService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "PHOTOGRAPHY", "DRAWING", "DESIGN", "PROJECT", "OTHER"
    );

    private final JdbcTemplate jdbcTemplate;
    private final AccountService accountService;

    public PortfolioService(JdbcTemplate jdbcTemplate, AccountService accountService) {
        this.jdbcTemplate = jdbcTemplate;
        this.accountService = accountService;
    }

    public Map<String, Object> list(Optional<UserAccount> currentAccount) {
        Optional<UserAccount> subject = currentAccount.isPresent()
                ? currentAccount
                : accountService.featuredUser();
        if (subject.isEmpty()) {
            return Map.of("items", List.of(), "editable", false);
        }
        boolean owner = currentAccount.isPresent() && currentAccount.get().id() == subject.get().id();
        String sql = """
                SELECT id, item_type, title, description, image_url, external_url,
                       display_order, is_public
                FROM portfolio_items
                WHERE user_id = ?
                """ + (owner ? "" : " AND is_public = TRUE ") + " ORDER BY display_order, id";
        List<Map<String, Object>> items = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", rs.getLong("id"));
                    item.put("type", rs.getString("item_type"));
                    item.put("title", rs.getString("title"));
                    item.put("description", rs.getString("description"));
                    item.put("imageUrl", rs.getString("image_url"));
                    item.put("externalUrl", rs.getString("external_url"));
                    item.put("displayOrder", rs.getInt("display_order"));
                    item.put("public", rs.getBoolean("is_public"));
                    return item;
                },
                subject.get().id()
        );
        return Map.of(
                "items", items,
                "editable", owner,
                "ownerName", subject.get().displayName()
        );
    }

    public Map<String, Object> create(UserAccount owner, Map<String, Object> body) {
        String type = normalizeType(body.get("type"));
        String title = required(body.get("title"), "title");
        String description = text(body.get("description"), "");
        String imageUrl = safeUrl(body.get("imageUrl"), "assets/campus-photo-01.jpg");
        String externalUrl = safeUrl(body.get("externalUrl"), "");
        int order = integer(body.get("displayOrder"), 100);
        boolean isPublic = bool(body.get("public"), true);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO portfolio_items
                        (user_id, item_type, title, description, image_url, external_url, display_order, is_public)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    new String[]{"id"}
            );
            statement.setLong(1, owner.id());
            statement.setString(2, type);
            statement.setString(3, title);
            statement.setString(4, description);
            statement.setString(5, imageUrl);
            statement.setString(6, externalUrl);
            statement.setInt(7, order);
            statement.setBoolean(8, isPublic);
            return statement;
        }, keyHolder);
        Number id = keyHolder.getKey();
        return Map.of("created", true, "id", id == null ? -1 : id.longValue());
    }

    public Map<String, Object> update(UserAccount owner, long itemId, Map<String, Object> body) {
        requireOwnership(owner, itemId);
        String type = normalizeType(body.get("type"));
        String title = required(body.get("title"), "title");
        String description = text(body.get("description"), "");
        String imageUrl = safeUrl(body.get("imageUrl"), "");
        String externalUrl = safeUrl(body.get("externalUrl"), "");
        int order = integer(body.get("displayOrder"), 100);
        boolean isPublic = bool(body.get("public"), true);
        jdbcTemplate.update(
                """
                UPDATE portfolio_items
                SET item_type = ?, title = ?, description = ?, image_url = ?, external_url = ?,
                    display_order = ?, is_public = ?
                WHERE id = ? AND user_id = ?
                """,
                type, title, description, imageUrl, externalUrl, order, isPublic, itemId, owner.id()
        );
        return Map.of("updated", true, "id", itemId);
    }

    public Map<String, Object> delete(UserAccount owner, long itemId) {
        requireOwnership(owner, itemId);
        jdbcTemplate.update(
                "DELETE FROM portfolio_items WHERE id = ? AND user_id = ?",
                itemId,
                owner.id()
        );
        return Map.of("deleted", true, "id", itemId);
    }

    private void requireOwnership(UserAccount owner, long itemId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM portfolio_items WHERE id = ? AND user_id = ?",
                Integer.class,
                itemId,
                owner.id()
        );
        if (count == null || count == 0) {
            throw new IllegalArgumentException("portfolio item not found");
        }
    }

    private String normalizeType(Object value) {
        String type = text(value, "OTHER").toUpperCase();
        return ALLOWED_TYPES.contains(type) ? type : "OTHER";
    }

    private String required(Object value, String field) {
        String text = text(value, "").trim();
        if (text.isEmpty() || text.length() > 160) {
            throw new IllegalArgumentException(field + " is required and must be at most 160 characters");
        }
        return text;
    }

    private String safeUrl(Object value, String fallback) {
        String url = text(value, fallback).trim();
        if (url.isEmpty()) {
            return "";
        }
        if (url.startsWith("assets/") || url.startsWith("https://") || url.startsWith("http://")) {
            return url;
        }
        throw new IllegalArgumentException("image and external URLs must use assets/, http://, or https://");
    }

    private String text(Object value, String fallback) {
        return value == null ? fallback : String.valueOf(value);
    }

    private int integer(Object value, int fallback) {
        try {
            return value == null ? fallback : Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private boolean bool(Object value, boolean fallback) {
        return value == null ? fallback : Boolean.parseBoolean(String.valueOf(value));
    }
}
