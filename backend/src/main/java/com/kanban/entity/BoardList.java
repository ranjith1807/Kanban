package com.kanban.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board_lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Double position;

    // One list contains many cards. 
    // cascade = ALL means deleting a list deletes all its cards.
    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("position ASC")
    @JsonManagedReference // Handles JSON serialization safely
    private List<Card> cards = new ArrayList<>();
}