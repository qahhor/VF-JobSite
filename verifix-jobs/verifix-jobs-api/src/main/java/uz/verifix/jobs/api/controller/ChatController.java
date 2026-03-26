package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.ChatMessage;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.ChatMessageRepository;

import java.util.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatRepo;
    private final CandidateRepository candidateRepo;

    /** List conversations (distinct candidates) for employer */
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        List<UUID> candidateIds = chatRepo.findDistinctCandidateIdsByEmployerId(employerId);
        long unread = chatRepo.countUnreadByEmployer(employerId);

        List<Map<String, Object>> conversations = new ArrayList<>();
        for (UUID cid : candidateIds) {
            Candidate c = candidateRepo.findById(cid).orElse(null);
            if (c == null) continue;

            Page<ChatMessage> lastPage = chatRepo.findByEmployerIdAndCandidateIdOrderByCreatedAtDesc(employerId, cid, PageRequest.of(0, 1));
            ChatMessage last = lastPage.hasContent() ? lastPage.getContent().get(0) : null;

            conversations.add(Map.of(
                    "candidateId", cid.toString(),
                    "candidateName", (c.getFirstName() != null ? c.getFirstName() : "") + " " + (c.getLastName() != null ? c.getLastName() : ""),
                    "lastMessage", last != null ? last.getMessage() : "",
                    "lastMessageAt", last != null && last.getCreatedAt() != null ? last.getCreatedAt().toString() : "",
                    "senderType", last != null ? last.getSenderType() : ""
            ));
        }

        return ResponseEntity.ok(Map.of("conversations", conversations, "unreadCount", unread));
    }

    /** Get messages in a conversation */
    @GetMapping("/messages/{candidateId}")
    @Transactional
    public ResponseEntity<?> getMessages(Authentication auth, @PathVariable UUID candidateId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "50") int size) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        chatRepo.markAsRead(employerId, candidateId);
        Page<ChatMessage> messages = chatRepo.findByEmployerIdAndCandidateIdOrderByCreatedAtDesc(employerId, candidateId, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("messages", messages.getContent(), "totalElements", messages.getTotalElements()));
    }

    /** Send message from employer */
    @PostMapping("/send")
    public ResponseEntity<?> send(Authentication auth, @RequestBody Map<String, String> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        UUID candidateId = UUID.fromString(body.get("candidateId"));
        String message = body.get("message");
        String vacancyId = body.get("vacancyId");

        ChatMessage msg = ChatMessage.builder()
                .employerId(employerId)
                .candidateId(candidateId)
                .vacancyId(vacancyId != null ? UUID.fromString(vacancyId) : null)
                .senderType("EMPLOYER")
                .message(message)
                .build();
        chatRepo.save(msg);

        return ResponseEntity.ok(Map.of("id", msg.getId().toString(), "createdAt", msg.getCreatedAt().toString()));
    }
}
