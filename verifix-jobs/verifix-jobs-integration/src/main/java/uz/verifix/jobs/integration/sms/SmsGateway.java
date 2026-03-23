package uz.verifix.jobs.integration.sms;

public interface SmsGateway {

    SmsResult send(String phone, String message);

    String getProviderName();
}
