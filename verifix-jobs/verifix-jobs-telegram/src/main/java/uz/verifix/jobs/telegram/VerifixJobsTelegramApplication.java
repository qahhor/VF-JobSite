package uz.verifix.jobs.telegram;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "uz.verifix.jobs")
@EntityScan(basePackages = "uz.verifix.jobs.domain.entity")
@EnableJpaRepositories(basePackages = "uz.verifix.jobs.domain.repository")
@EnableAsync
public class VerifixJobsTelegramApplication {

    public static void main(String[] args) {
        SpringApplication.run(VerifixJobsTelegramApplication.class, args);
    }
}
