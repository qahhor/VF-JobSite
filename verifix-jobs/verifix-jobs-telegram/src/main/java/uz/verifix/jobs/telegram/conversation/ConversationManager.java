package uz.verifix.jobs.telegram.conversation;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class ConversationManager {

    private static final String PREFIX = "tg:conv:";
    private static final Duration TTL = Duration.ofHours(1);

    private final RedisTemplate<String, Object> redisTemplate;

    public void save(Long chatId, ConversationState state) {
        redisTemplate.opsForValue().set(PREFIX + chatId, state, TTL);
    }

    public ConversationState get(Long chatId) {
        Object state = redisTemplate.opsForValue().get(PREFIX + chatId);
        return state instanceof ConversationState cs ? cs : null;
    }

    public void delete(Long chatId) {
        redisTemplate.delete(PREFIX + chatId);
    }

    public boolean hasActiveConversation(Long chatId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + chatId));
    }
}
