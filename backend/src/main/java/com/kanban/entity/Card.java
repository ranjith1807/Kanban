package com.kanban.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double position;

    // Many cards belong to one list.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "list_id", nullable = false)
    @JsonBackReference // Prevents infinite recursion during JSON conversion
    private BoardList list;
}