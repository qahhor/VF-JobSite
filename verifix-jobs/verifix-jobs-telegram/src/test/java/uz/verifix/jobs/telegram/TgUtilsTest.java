package uz.verifix.jobs.telegram;

import org.junit.jupiter.api.Test;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.telegram.util.TgUtils;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

class TgUtilsTest {

    @Test
    void htmlCreatesSendMessage() {
        SendMessage msg = TgUtils.html(123L, "Hello <b>World</b>");
        assertThat(msg.getChatId()).isEqualTo("123");
        assertThat(msg.getText()).isEqualTo("Hello <b>World</b>");
        assertThat(msg.getParseMode()).isEqualTo("HTML");
    }

    @Test
    void btnCreatesInlineButton() {
        InlineKeyboardButton btn = TgUtils.btn("Click me", "callback_data");
        assertThat(btn.getText()).isEqualTo("Click me");
        assertThat(btn.getCallbackData()).isEqualTo("callback_data");
    }

    @Test
    void escapeHtmlHandlesSpecialChars() {
        assertThat(TgUtils.escapeHtml("<script>alert('xss')</script>"))
                .isEqualTo("&lt;script&gt;alert('xss')&lt;/script&gt;");
        assertThat(TgUtils.escapeHtml("Tom & Jerry")).isEqualTo("Tom &amp; Jerry");
        assertThat(TgUtils.escapeHtml(null)).isEqualTo("");
    }

    @Test
    void formatSalary() {
        assertThat(TgUtils.formatSalary(new BigDecimal("5000000"))).isEqualTo("5.0M");
        assertThat(TgUtils.formatSalary(new BigDecimal("3500000"))).isEqualTo("3.5M");
        assertThat(TgUtils.formatSalary(new BigDecimal("500000"))).isEqualTo("500K");
        assertThat(TgUtils.formatSalary(new BigDecimal("999"))).isEqualTo("999");
        assertThat(TgUtils.formatSalary(null)).isEqualTo("0");
    }

    @Test
    void formatSalaryRange() {
        assertThat(TgUtils.formatSalaryRange(new BigDecimal("3000000"), new BigDecimal("5000000")))
                .isEqualTo("3.0M – 5.0M UZS");
        assertThat(TgUtils.formatSalaryRange(new BigDecimal("3000000"), null))
                .isEqualTo("3.0M+ UZS");
        assertThat(TgUtils.formatSalaryRange(null, null))
                .isEqualTo("Kelishiladi");
    }

    @Test
    void callbackConstants() {
        assertThat(TgUtils.CB_VACANCY).isEqualTo("v:");
        assertThat(TgUtils.CB_APPLY).isEqualTo("a:");
        assertThat(TgUtils.CB_FAVORITE).isEqualTo("f:");
        assertThat(TgUtils.CB_SEARCH_PAGE).isEqualTo("sp:");
    }
}
