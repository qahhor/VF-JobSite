package uz.verifix.jobs.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "uz.verifix.jobs")
@EntityScan(basePackages = "uz.verifix.jobs.domain.entity")
@EnableJpaRepositories(basePackages = "uz.verifix.jobs.domain.repository")
public class VerifixJobsApplication {

    public static void main(String[] args) {
        SpringApplication.run(VerifixJobsApplication.class, args);
    }
}
