package uz.verifix.jobs.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "uz.verifix.jobs")
@EntityScan(basePackages = "uz.verifix.jobs.domain.entity")
@EnableJpaRepositories(basePackages = "uz.verifix.jobs.domain.repository")
@EnableScheduling
@EnableAsync
public class VerifixJobsApplication {

    public static void main(String[] args) {
        SpringApplication.run(VerifixJobsApplication.class, args);
    }
}
