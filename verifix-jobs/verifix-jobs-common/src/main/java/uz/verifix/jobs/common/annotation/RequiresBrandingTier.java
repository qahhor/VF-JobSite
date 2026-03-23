package uz.verifix.jobs.common.annotation;

import uz.verifix.jobs.domain.enums.BrandingTier;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresBrandingTier {
    BrandingTier value();
}
