package com.example.resumeapp.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class PortfolioMediaStorage {

    private static final long MAX_IMAGE_BYTES = 15L * 1024 * 1024;
    private static final long MAX_AUDIO_BYTES = 25L * 1024 * 1024;
    private static final long MAX_TEXT_BYTES = 5L * 1024 * 1024;

    private static final Map<String, Set<String>> EXTENSIONS = Map.of(
            "IMAGE", Set.of("jpg", "jpeg", "png", "gif", "webp"),
            "AUDIO", Set.of("mp3", "wav", "ogg", "m4a"),
            "TEXT", Set.of("txt", "md", "csv", "json")
    );

    private final Path root;

    public PortfolioMediaStorage(
            @Value("${app.upload-dir:${user.home}/.campusflow/uploads}") String uploadDir
    ) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void initialize() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize portfolio upload storage", e);
        }
    }

    public StoredFile store(MultipartFile file, String requestedKind) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose a file before uploading.");
        }

        String kind = normalizeKind(requestedKind);
        String originalName = safeOriginalName(file.getOriginalFilename());
        String extension = extensionOf(originalName);
        if (!EXTENSIONS.get(kind).contains(extension)) {
            throw new IllegalArgumentException("This file extension is not allowed for " + kind.toLowerCase(Locale.ROOT) + " uploads.");
        }

        long size = file.getSize();
        long maximum = maximumBytes(kind);
        if (size <= 0 || size > maximum) {
            throw new IllegalArgumentException(kind.toLowerCase(Locale.ROOT)
                    + " files must be smaller than " + (maximum / 1024 / 1024) + " MB.");
        }

        String contentType = normalizeContentType(file.getContentType(), kind, extension);
        validateSignature(file, kind, extension);

        String storedName = UUID.randomUUID() + "." + extension;
        Path destination = resolveStoredPath(storedName);
        Path temporary = resolveStoredPath(storedName + ".part");
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, temporary, StandardCopyOption.REPLACE_EXISTING);
            try {
                Files.move(
                        temporary,
                        destination,
                        StandardCopyOption.ATOMIC_MOVE,
                        StandardCopyOption.REPLACE_EXISTING
                );
            } catch (AtomicMoveNotSupportedException ignored) {
                Files.move(temporary, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredFile(storedName, originalName, contentType, size, kind);
        } catch (IOException e) {
            deleteQuietly(storedName);
            deletePathQuietly(temporary);
            throw new IllegalStateException("The uploaded file could not be saved.", e);
        }
    }

    public Resource load(String storedName) {
        try {
            Path file = resolveStoredPath(storedName);
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable() || !Files.isRegularFile(file)) {
                throw new IllegalArgumentException("Uploaded file not found.");
            }
            return resource;
        } catch (IOException e) {
            throw new IllegalArgumentException("Uploaded file not found.", e);
        }
    }

    public void deleteQuietly(String storedName) {
        if (storedName == null || storedName.isBlank()) {
            return;
        }
        deletePathQuietly(resolveStoredPath(storedName));
    }

    private void validateSignature(MultipartFile file, String kind, String extension) {
        byte[] header = new byte[16];
        int read;
        try (InputStream input = file.getInputStream()) {
            read = input.read(header);
        } catch (IOException e) {
            throw new IllegalArgumentException("The selected file could not be read.", e);
        }
        if (read <= 0) {
            throw new IllegalArgumentException("The selected file is empty.");
        }

        boolean valid = switch (kind) {
            case "IMAGE" -> imageSignature(header, read, extension);
            case "AUDIO" -> audioSignature(header, read, extension);
            case "TEXT" -> textSignature(header, read);
            default -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException("The file contents do not match the selected media type.");
        }
    }

    private boolean imageSignature(byte[] bytes, int length, String extension) {
        return switch (extension) {
            case "jpg", "jpeg" -> length >= 3
                    && unsigned(bytes[0]) == 0xff && unsigned(bytes[1]) == 0xd8 && unsigned(bytes[2]) == 0xff;
            case "png" -> length >= 8
                    && unsigned(bytes[0]) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G';
            case "gif" -> length >= 6
                    && new String(bytes, 0, 6, StandardCharsets.US_ASCII).startsWith("GIF8");
            case "webp" -> length >= 12
                    && ascii(bytes, 0, 4).equals("RIFF") && ascii(bytes, 8, 4).equals("WEBP");
            default -> false;
        };
    }

    private boolean audioSignature(byte[] bytes, int length, String extension) {
        return switch (extension) {
            case "mp3" -> length >= 3 && (ascii(bytes, 0, 3).equals("ID3")
                    || (unsigned(bytes[0]) == 0xff && (unsigned(bytes[1]) & 0xe0) == 0xe0));
            case "wav" -> length >= 12
                    && ascii(bytes, 0, 4).equals("RIFF") && ascii(bytes, 8, 4).equals("WAVE");
            case "ogg" -> length >= 4 && ascii(bytes, 0, 4).equals("OggS");
            case "m4a" -> length >= 12 && ascii(bytes, 4, 4).equals("ftyp");
            default -> false;
        };
    }

    private boolean textSignature(byte[] bytes, int length) {
        for (int i = 0; i < length; i++) {
            if (bytes[i] == 0) {
                return false;
            }
        }
        return true;
    }

    private String normalizeKind(String value) {
        String kind = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!EXTENSIONS.containsKey(kind)) {
            throw new IllegalArgumentException("Media type must be IMAGE, AUDIO, or TEXT.");
        }
        return kind;
    }

    private String normalizeContentType(String supplied, String kind, String extension) {
        String contentType = supplied == null ? "" : supplied.trim().toLowerCase(Locale.ROOT);
        if (contentType.isBlank() || contentType.equals("application/octet-stream")) {
            contentType = inferredContentType(extension);
        }
        boolean accepted = switch (kind) {
            case "IMAGE" -> contentType.startsWith("image/");
            case "AUDIO" -> contentType.startsWith("audio/") || ("m4a".equals(extension) && "video/mp4".equals(contentType));
            case "TEXT" -> contentType.startsWith("text/")
                    || "application/json".equals(contentType);
            default -> false;
        };
        if (!accepted) {
            throw new IllegalArgumentException("The browser reported an unsupported content type.");
        }
        return contentType;
    }

    private String inferredContentType(String extension) {
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "m4a" -> "audio/mp4";
            case "json" -> "application/json";
            case "csv" -> "text/csv";
            case "md" -> "text/markdown";
            default -> "text/plain";
        };
    }

    private long maximumBytes(String kind) {
        return switch (kind) {
            case "IMAGE" -> MAX_IMAGE_BYTES;
            case "AUDIO" -> MAX_AUDIO_BYTES;
            case "TEXT" -> MAX_TEXT_BYTES;
            default -> 0;
        };
    }

    private String safeOriginalName(String supplied) {
        String normalized = supplied == null ? "" : supplied.replace('\\', '/');
        int separator = normalized.lastIndexOf('/');
        String name = normalized.substring(separator + 1).trim();
        if (name.isEmpty() || name.length() > 255 || name.contains("\0")) {
            throw new IllegalArgumentException("The selected filename is invalid.");
        }
        return name;
    }

    private String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 1 || dot == name.length() - 1) {
            throw new IllegalArgumentException("The selected file must include a supported extension.");
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private Path resolveStoredPath(String storedName) {
        if (storedName == null || !storedName.matches("[A-Za-z0-9._-]{1,300}")) {
            throw new IllegalArgumentException("Invalid stored filename.");
        }
        Path path = root.resolve(storedName).normalize();
        if (!path.startsWith(root)) {
            throw new IllegalArgumentException("Invalid stored filename.");
        }
        return path;
    }

    private void deletePathQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // A stale file can be cleaned later without breaking the user request.
        }
    }

    private String ascii(byte[] bytes, int offset, int length) {
        return new String(bytes, offset, length, StandardCharsets.US_ASCII);
    }

    private int unsigned(byte value) {
        return value & 0xff;
    }

    public record StoredFile(
            String storedName,
            String originalName,
            String contentType,
            long size,
            String kind
    ) {
    }
}
