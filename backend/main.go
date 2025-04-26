package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func fetchData(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	data, err := os.ReadFile("data.txt")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}


	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusInternalServerError)
		return
	}


	w.Header().Set("Content-Type", "application/json")
	

	json.NewEncoder(w).Encode(jsonData)
}

func main() {
	http.HandleFunc("/readingSuggestion", fetchData)

	fmt.Println("Server running at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
