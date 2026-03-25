package uz.verifix.jobs.common.util;

import java.io.ByteArrayOutputStream;

public final class Base32Utils {

    private static final char[] ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();

    private Base32Utils() {}

    public static String encode(byte[] data) {
        StringBuilder out = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;
        for (byte value : data) {
            buffer <<= 8;
            buffer |= value & 0xFF;
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                out.append(ALPHABET[(buffer >> (bitsLeft - 5)) & 0x1F]);
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            out.append(ALPHABET[(buffer << (5 - bitsLeft)) & 0x1F]);
        }
        return out.toString();
    }

    public static byte[] decode(String value) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int buffer = 0;
        int bitsLeft = 0;
        for (char c : value.replace("=", "").toUpperCase().toCharArray()) {
            int idx = alphabetIndex(c);
            if (idx < 0) {
                continue;
            }
            buffer <<= 5;
            buffer |= idx;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                out.write((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return out.toByteArray();
    }

    private static int alphabetIndex(char c) {
        if (c >= 'A' && c <= 'Z') {
            return c - 'A';
        }
        if (c >= '2' && c <= '7') {
            return c - '2' + 26;
        }
        return -1;
    }
}
