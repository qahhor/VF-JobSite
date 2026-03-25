package uz.verifix.jobs.service.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Chatbot conversation memory — stores recent messages per user in Redis.
 * Enables multi-turn conversations for AI job search.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotMemoryService {

    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "chatbot:memory:";
    private static final int MAX_MESSAGES = 10;
    private static final Duration TTL = Duration.ofHours(24);

    public void addMessage(Long telegramId, String role, String content) {
        String key = PREFIX + telegramId;
        String entry = role + ":" + content;
        redisTemplate.opsForList().rightPush(key, entry);
        redisTemplate.opsForList().trim(key, -MAX_MESSAGES, -1);
        redisTemplate.expire(key, TTL);
    }

    public List<String> getHistory(Long telegramId) {
        String key = PREFIX + telegramId;
        List<String> messages = redisTemplate.opsForList().range(key, 0, -1);
        return messages != null ? messages : List.of();
    }

    public String getHistoryAsContext(Long telegramId) {
        List<String> history = getHistory(telegramId);
        if (history.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("Oldingi suhbat:\n");
        for (String msg : history) {
            int sep = msg.indexOf(':');
            if (sep > 0) {
                String role = msg.substring(0, sep);
                String text = msg.substring(sep + 1);
                sb.append(role.equals("user") ? "Foydalanuvchi: " : "Bot: ").append(text).append("\n");
            }
        }
        return sb.toString();
    }

    public void clearHistory(Long telegramId) {
        redisTemplate.delete(PREFIX + telegramId);
    }
}
