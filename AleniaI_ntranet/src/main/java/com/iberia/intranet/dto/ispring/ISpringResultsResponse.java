package com.iberia.intranet.dto.ispring;

import lombok.Data;
import java.util.List;

@Data
public class ISpringResultsResponse {
    private List<ISpringLearnerResult> results;
    private int count;
}
