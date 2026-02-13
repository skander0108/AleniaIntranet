package com.iberia.intranet.dto;

import com.iberia.intranet.entity.TicketCategory;
import com.iberia.intranet.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItSupportTicketCreateDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Description is required")
    private String description;

    private String preferredContact;
}
