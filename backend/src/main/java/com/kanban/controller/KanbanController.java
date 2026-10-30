package com.kanban.controller;

import com.kanban.entity.BoardList;
import com.kanban.entity.Card;
import com.kanban.repository.BoardListRepository;
import com.kanban.repository.CardRepository;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class KanbanController {

    private final BoardListRepository listRepo;
    private final CardRepository cardRepo;

    public KanbanController(BoardListRepository listRepo, CardRepository cardRepo) {
        this.listRepo = listRepo;
        this.cardRepo = cardRepo;
    }

    // 1. Fetch the entire board
    @GetMapping("/lists")
    public List<BoardList> getBoard() {
        // Sorts the lists themselves by their position so "To Do" is always first
        return listRepo.findAll(Sort.by(Sort.Direction.ASC, "position"));
    }

    // 2. Add a new card to a specific list
    @PostMapping("/lists/{listId}/cards")
    @Transactional
    public Card createCard(@PathVariable @NonNull Long listId, @RequestBody Card card) {
        BoardList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        card.setList(list);
        return cardRepo.save(card);
    }

    // 3. Move a card (Updates position and/or changes its parent list)
    @PatchMapping("/cards/{cardId}/move")
    @Transactional
    public void moveCard(
            @PathVariable @NonNull Long cardId,
            @RequestParam @NonNull Long targetListId,
            @RequestParam Double newPosition) {
        
        Card card = cardRepo.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        // If the card was moved to a different column, update the list reference
        if (!card.getList().getId().equals(targetListId)) {
            BoardList targetList = listRepo.findById(targetListId)
                    .orElseThrow(() -> new RuntimeException("Target list not found"));
            card.setList(targetList);
        }
        
        // Update the fractional index position
        card.setPosition(newPosition);
        cardRepo.save(card);
    }
}