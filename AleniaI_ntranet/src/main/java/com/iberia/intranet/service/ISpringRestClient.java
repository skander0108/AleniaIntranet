package com.iberia.intranet.service;

import com.iberia.intranet.dto.ispring.ISpringLearnerResult;
import com.iberia.intranet.dto.ispring.ISpringUserProfile;
import java.util.List;

public interface ISpringRestClient {
    List<ISpringLearnerResult> getAllLearnerProgress();

    ISpringUserProfile getUserProfile(String userId);
}
