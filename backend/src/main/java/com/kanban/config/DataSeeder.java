package com.kanban.config;

import com.kanban.entity.BoardList;
import com.kanban.repository.BoardListRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(BoardListRepository boardListRepository) {
        return args -> {
            // Only seed data if the table is completely empty
            if (boardListRepository.count() == 0) {
                boardListRepository.save(new BoardList(null, "To Do", 1000.0, new ArrayList<>()));
                boardListRepository.save(new BoardList(null, "In Progress", 2000.0, new ArrayList<>()));
                boardListRepository.save(new BoardList(null, "Done", 3000.0, new ArrayList<>()));
                System.out.println("Default Kanban columns seeded into the database.");
            }
        };
    }
}