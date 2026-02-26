package com.iberia.intranet.dto.ispring;

import lombok.Data;
import java.util.List;

@Data
public class ISpringUserProfile {
    private String userId;
    private List<ISpringUserField> fields;

    @Data
    public static class ISpringUserField {
        private String name;
        private String value;
    }
}
