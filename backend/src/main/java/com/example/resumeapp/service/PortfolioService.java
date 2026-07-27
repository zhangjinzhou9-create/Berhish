package com.example.resumeapp.service;

import com.example.resumeapp.service.AccountService.UserAccount;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class PortfolioService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "PHOTOGRAPHY", "DRAWING", "DESIGN", "PROJECT", "OTHER"
    );
    private static final Set<String> ALLOWED_LAYOUTS = Set.of("STANDARD", "WIDE", "TALL");
    private static final Set<String> ALLOWED_FITS = Set.of("COVER", "CONTAIN");

    private final JdbcTemplate jdbcTemplate;
    private final AccountService accountService;
    private final PortfolioMediaStorage mediaStorage;

    public PortfolioService(
            JdbcTemplate jdbcTemplate,
            AccountService accountService,
            PortfolioMediaStorage mediaStorage
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.accountService = accountService;
        this.mediaStorage = mediaStorage;
    }

    public Map<String, Object> list(Optional<UserAccount> currentAccount) {
        Optional<UserAccount> subject = currentAccount.isPresent()
                ? currentAccount
                : accountService.featuredUser();
        if (subject.isEmpty()) {
            return Map.of(
                    "items", guestPortfolio(),
                    "editable", false,
                    "ownerName", "シュフシン",
                    "preset", true
            );
        }
        boolean owner = currentAccount.isPresent() && currentAccount.get().id() == subject.get().id();
        String sql = """
                SELECT id, item_type, title, description, image_url, external_url,
                       media_kind, media_content_type, media_original_name, media_size,
                       layout_size, media_fit, display_order, is_public
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
                    item.put("mediaKind", rs.getString("media_kind"));
                    item.put("contentType", rs.getString("media_content_type"));
                    item.put("originalName", rs.getString("media_original_name"));
                    item.put("mediaSize", rs.getObject("media_size"));
                    item.put("layoutSize", rs.getString("layout_size"));
                    item.put("mediaFit", rs.getString("media_fit"));
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

    private List<Map<String, Object>> guestPortfolio() {
        return List.of(
                Map.of(
                        "id", -1,
                        "type", "PHOTOGRAPHY",
                        "imageUrl", "assets/campus-photo-01.jpg",
                        "presetKey", "guestWork01",
                        "public", true
                ),
                Map.of(
                        "id", -2,
                        "type", "PHOTOGRAPHY",
                        "imageUrl", "assets/campus-photo-05.jpg",
                        "presetKey", "guestWork02",
                        "public", true
                ),
                Map.of(
                        "id", -3,
                        "type", "PHOTOGRAPHY",
                        "imageUrl", "assets/campus-photo-08.jpg",
                        "presetKey", "guestWork03",
                        "public", true
                ),
                Map.of(
                        "id", -4,
                        "type", "PHOTOGRAPHY",
                        "imageUrl", "assets/campus-extra-pond.jpg",
                        "presetKey", "guestWork04",
                        "public", true
                )
        );
    }

    public Map<String, Object> create(UserAccount owner, Map<String, Object> body) {
        String type = normalizeType(body.get("type"));
        String title = required(body.get("title"), "title");
        String description = limited(body.get("description"), "", "description", 4000);
        String imageUrl = safeUrl(body.get("imageUrl"), "");
        if (imageUrl.isBlank()) {
            throw new IllegalArgumentException("Choose and upload a local file before creating a work.");
        }
        String externalUrl = safeUrl(body.get("externalUrl"), "");
        String layoutSize = normalizeLayout(body.get("layoutSize"));
        String mediaFit = normalizeFit(body.get("mediaFit"));
        int order = integer(body.get("displayOrder"), 100);
        boolean isPublic = bool(body.get("public"), true);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO portfolio_items
                        (user_id, item_type, title, description, image_url, external_url,
                         layout_size, media_fit, display_order, is_public)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    new String[]{"id"}
            );
            statement.setLong(1, owner.id());
            statement.setString(2, type);
            statement.setString(3, title);
            statement.setString(4, description);
            statement.setString(5, imageUrl);
            statement.setString(6, externalUrl);
            statement.setString(7, layoutSize);
            statement.setString(8, mediaFit);
            statement.setInt(9, order);
            statement.setBoolean(10, isPublic);
            return statement;
        }, keyHolder);
        Number id = keyHolder.getKey();
        return Map.of("created", true, "id", id == null ? -1 : id.longValue());
    }

    public Map<String, Object> createUploaded(
            UserAccount owner,
            String type,
            String title,
            String description,
            String requestedMediaKind,
            String requestedLayoutSize,
            String requestedMediaFit,
            int displayOrder,
            boolean isPublic,
            MultipartFile file
    ) {
        String normalizedType = normalizeType(type);
        String normalizedTitle = required(title, "title");
        String normalizedDescription = limited(description, "", "description", 4000);
        String normalizedLayoutSize = normalizeLayout(requestedLayoutSize);
        String normalizedMediaFit = normalizeFit(requestedMediaFit);

        PortfolioMediaStorage.StoredFile stored = mediaStorage.store(file, requestedMediaKind);
        try {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(
                        """
                        INSERT INTO portfolio_items
                            (user_id, item_type, title, description, image_url, external_url,
                             media_kind, media_content_type, media_original_name, media_stored_name,
                             media_size, layout_size, media_fit, display_order, is_public)
                        VALUES (?, ?, ?, ?, '', '', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        new String[]{"id"}
                );
                statement.setLong(1, owner.id());
                statement.setString(2, normalizedType);
                statement.setString(3, normalizedTitle);
                statement.setString(4, normalizedDescription);
                statement.setString(5, stored.kind());
                statement.setString(6, stored.contentType());
                statement.setString(7, stored.originalName());
                statement.setString(8, stored.storedName());
                statement.setLong(9, stored.size());
                statement.setString(10, normalizedLayoutSize);
                statement.setString(11, normalizedMediaFit);
                statement.setInt(12, Math.max(0, displayOrder));
                statement.setBoolean(13, isPublic);
                return statement;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key == null) {
                throw new IllegalStateException("The portfolio item could not be created.");
            }
            long itemId = key.longValue();
            String mediaUrl = "/api/portfolio/" + itemId + "/media";
            jdbcTemplate.update(
                    "UPDATE portfolio_items SET image_url = ? WHERE id = ? AND user_id = ?",
                    mediaUrl,
                    itemId,
                    owner.id()
            );
            return Map.of(
                    "created", true,
                    "id", itemId,
                    "mediaKind", stored.kind(),
                    "mediaUrl", mediaUrl
            );
        } catch (RuntimeException e) {
            mediaStorage.deleteQuietly(stored.storedName());
            throw e;
        }
    }

    public MediaFile loadMedia(Optional<UserAccount> requester, long itemId) {
        List<MediaFileRow> rows = jdbcTemplate.query(
                """
                SELECT user_id, is_public, media_stored_name, media_original_name,
                       media_content_type, media_size
                FROM portfolio_items
                WHERE id = ? AND media_stored_name IS NOT NULL
                """,
                (rs, rowNum) -> new MediaFileRow(
                        rs.getLong("user_id"),
                        rs.getBoolean("is_public"),
                        rs.getString("media_stored_name"),
                        rs.getString("media_original_name"),
                        rs.getString("media_content_type"),
                        rs.getLong("media_size")
                ),
                itemId
        );
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file not found.");
        }
        MediaFileRow row = rows.get(0);
        boolean owner = requester.isPresent() && requester.get().id() == row.ownerId();
        if (!row.isPublic() && !owner) {
            throw new PortfolioAccessException("This uploaded file is private.");
        }
        return new MediaFile(
                mediaStorage.load(row.storedName()),
                row.originalName(),
                row.contentType(),
                row.size()
        );
    }

    public Map<String, Object> update(UserAccount owner, long itemId, Map<String, Object> body) {
        requireOwnership(owner, itemId);
        PortfolioReference existing = jdbcTemplate.queryForObject(
                """
                SELECT image_url, media_stored_name
                FROM portfolio_items
                WHERE id = ? AND user_id = ?
                """,
                (rs, rowNum) -> new PortfolioReference(
                        rs.getString("image_url"),
                        rs.getString("media_stored_name")
                ),
                itemId,
                owner.id()
        );
        String type = normalizeType(body.get("type"));
        String title = required(body.get("title"), "title");
        String description = limited(body.get("description"), "", "description", 4000);
        String imageUrl = existing != null && existing.storedName() != null
                ? existing.imageUrl()
                : safeUrl(body.get("imageUrl"), "");
        String externalUrl = safeUrl(body.get("externalUrl"), "");
        String layoutSize = normalizeLayout(body.get("layoutSize"));
        String mediaFit = normalizeFit(body.get("mediaFit"));
        int order = integer(body.get("displayOrder"), 100);
        boolean isPublic = bool(body.get("public"), true);
        jdbcTemplate.update(
                """
                UPDATE portfolio_items
                SET item_type = ?, title = ?, description = ?, image_url = ?, external_url = ?,
                    layout_size = ?, media_fit = ?, display_order = ?, is_public = ?
                WHERE id = ? AND user_id = ?
                """,
                type, title, description, imageUrl, externalUrl,
                layoutSize, mediaFit, order, isPublic, itemId, owner.id()
        );
        return Map.of("updated", true, "id", itemId);
    }

    public Map<String, Object> delete(UserAccount owner, long itemId) {
        requireOwnership(owner, itemId);
        List<String> storedNames = jdbcTemplate.query(
                "SELECT media_stored_name FROM portfolio_items WHERE id = ? AND user_id = ?",
                (rs, rowNum) -> rs.getString("media_stored_name"),
                itemId,
                owner.id()
        );
        jdbcTemplate.update(
                "DELETE FROM portfolio_items WHERE id = ? AND user_id = ?",
                itemId,
                owner.id()
        );
        storedNames.forEach(mediaStorage::deleteQuietly);
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

    private String limited(Object value, String fallback, String field, int maximum) {
        String result = text(value, fallback).trim();
        if (result.length() > maximum) {
            throw new IllegalArgumentException(field + " must be at most " + maximum + " characters");
        }
        return result;
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

    private String normalizeLayout(Object value) {
        String layout = text(value, "STANDARD").trim().toUpperCase();
        return ALLOWED_LAYOUTS.contains(layout) ? layout : "STANDARD";
    }

    private String normalizeFit(Object value) {
        String fit = text(value, "COVER").trim().toUpperCase();
        return ALLOWED_FITS.contains(fit) ? fit : "COVER";
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

    private record MediaFileRow(
            long ownerId,
            boolean isPublic,
            String storedName,
            String originalName,
            String contentType,
            long size
    ) {
    }

    private record PortfolioReference(String imageUrl, String storedName) {
    }

    public record MediaFile(
            org.springframework.core.io.Resource resource,
            String originalName,
            String contentType,
            long size
    ) {
    }

    public static class PortfolioAccessException extends RuntimeException {
        public PortfolioAccessException(String message) {
            super(message);
        }
    }
}
