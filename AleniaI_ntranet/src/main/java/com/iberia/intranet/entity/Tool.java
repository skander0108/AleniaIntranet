package com.iberia.intranet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "tools")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tool {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    private String icon;

    @Column(name = "color_theme")
    private String colorTheme;

    private String description;
}
