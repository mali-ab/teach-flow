package main

import (
	"fmt"
	"log"
	"teachflow/internal/config"
	"teachflow/internal/database"
	"teachflow/internal/server"
)

func main() {

	cfg := config.Load()

	db, err := database.NewPostgres(cfg)
	if err != nil {
		log.Fatal("database connection failed: ", err)
	}
	defer db.Close()

	srv := server.New(
		db,
		cfg.JWTSecret,
		cfg.JitsiURL,
	)

	addr := fmt.Sprintf("%s:%s", cfg.ServerHost, cfg.ServerPort)

	log.Println("Server started on", addr)

	if err := srv.Run(addr); err != nil {
		log.Fatal(err)
	}

}
