package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"

	binance_connector "github.com/binance/binance-connector-go"
)

type BinanceError struct {
	Code    int64
	Message string
}
type Item struct {
	Sympol string  `json:"symbol,omitempty"`
	Price  float64 `json:"price,omitempty"`
}

var items []Item
var baseAsset = "BTC"
var baseCurrencey = "USDT"

func main() {
	// Replace with your Testnet API Key and Secret Key
	apiKey := "your_testnet_api_key"
	secretKey := "your_testnet_secret_key"
	baseURL := "https://testnet.binance.vision" // Use Testnet URL for testing

	// Initialize the client
	client := binance_connector.NewClient(apiKey, secretKey, baseURL)

	// Get exchange information
	exchangeInfo, err := client.NewExchangeInfoService().Do(context.Background())
	if err != nil {
		log.Fatalf("Error fetching exchange info: %v", err)
	}

	// Define the base asset you want to filter by

	// Filter symbols by base asset
	var e *BinanceError
	//var q *binance_connector.NewA
	fmt.Printf("Trading pairs with base asset :", baseAsset)
	// var maxval float64 = 0
	// var sympol string = ""
	var wg sync.WaitGroup
	for _, symbol := range exchangeInfo.Symbols {

		wg.Add(1)
		go func() {
			defer wg.Done()
			if symbol.BaseAsset == baseAsset {
				fmt.Println(symbol.Symbol)
				price, err := client.NewAvgPriceService().Symbol(symbol.Symbol).Do(context.Background())
				if err != nil {
					fmt.Println(e)
					log.Fatalf("Error fetching price for %s: %v", symbol.Symbol, err)
				}
				fmt.Println(price)
				if symbol.IsSpotTradingAllowed {
					fmt.Printf("The current price of %s is: %s\n", symbol.Symbol, price.Price)
					// Print the trading pair
					if symbol.QuoteAsset != baseCurrencey {
						quotePrice, err := client.NewAvgPriceService().Symbol(symbol.QuoteAsset + baseCurrencey).Do(context.Background())
						fmt.Println(symbol.QuoteAsset + baseCurrencey)
						if err != nil {
							fmt.Println(e)

							quotePriceRev, err := client.NewAvgPriceService().Symbol(baseCurrencey + symbol.QuoteAsset).Do(context.Background())
							if err != nil {
								fmt.Println(e)
							} else {
								floatQuoteValue, err := strconv.ParseFloat(quotePriceRev.Price, 64)
								if err != nil {
									fmt.Println("Error converting string to float:", err)
									return
								}
								floatPriceValue, err := strconv.ParseFloat(price.Price, 64)
								if err != nil {
									fmt.Println("Error converting string to float:", err)
									return
								}
								newItem := Item{Sympol: symbol.Symbol, Price: (floatPriceValue / floatQuoteValue)}
								items = append(items, newItem)
								updatedJSON, err := json.Marshal(items)
								if err != nil {
									log.Fatalf("Error marshalling JSON: %v", err)
								}
								fmt.Println("Updated JSON:", string(updatedJSON))
							}
						} else {
							floatQuoteValue, err := strconv.ParseFloat(quotePrice.Price, 64)
							if err != nil {
								fmt.Println("Error converting string to float:", err)
								return
							}
							floatPriceValue, err := strconv.ParseFloat(price.Price, 64)
							if err != nil {
								fmt.Println("Error converting string to float:", err)
								return
							}
							newItem := Item{Sympol: symbol.Symbol, Price: (floatPriceValue * floatQuoteValue)}
							items = append(items, newItem)
							updatedJSON, err := json.Marshal(items)
							if err != nil {
								log.Fatalf("Error marshalling JSON: %v", err)
							}
							fmt.Println("Updated JSON:", string(updatedJSON))
						}

					} else {

						floatPriceValue, err := strconv.ParseFloat(price.Price, 64)
						if err != nil {
							fmt.Println("Error converting string to float:", err)
							return
						}
						newItem := Item{Sympol: symbol.Symbol, Price: (floatPriceValue)}
						items = append(items, newItem)
						updatedJSON, err := json.Marshal(items)
						if err != nil {
							log.Fatalf("Error marshalling JSON: %v", err)
						}
						fmt.Println("Updated JSON:", string(updatedJSON))

					}

					// Print the player with the highest PPG
					//fmt.Printf("Player with highest PPG: %s with %.1f points per game\n", maxPlayer.Sympol, maxPlayer.Price)
				}
			}
		}()
		wg.Wait()
	}
	numbers := []float64{}
	var maxIndex int
	var minIndex int
	for j := 0; j < len(items); j++ {
		numbers = append(numbers, items[j].Price)
	}
	fmt.Println(numbers)
	largestNumber := numbers[0]
	smalestNumber := numbers[0] // Assume the first element is the largest
	for index, element := range numbers {
		if element > largestNumber {
			largestNumber = element
			maxIndex = index
			// Update if a larger number is found
		}
	}
	for index, element := range numbers {
		if element < smalestNumber {
			smalestNumber = element
			minIndex = index
			// Update if a larger number is found
		}
	}
	fmt.Println(items[maxIndex])
	fmt.Println(items[minIndex])

	// fmt.Println("The largest number in the array is:", largestNumber)

	// for i := 0; i < len(items); i++ {
	// 	fmt.Println("items|", items)
	// 	if items[i].Price > maxval {
	// 		maxval = items[i].Price
	// 		sympol = items[i].Sympol

	// 	}
	// 	fmt.Println("maxval", maxval)
	// 	fmt.Println("maxval", sympol)
	// 	// Create new order
	// 	newOrder, err := client.NewCreateOrderService().Symbol(baseAsset + baseCurrencey).
	// 		Side("BUY").Type("MARKET").Quantity(100).
	// 		Do(context.Background())
	// 	if err != nil {
	// 		fmt.Println(err)
	// 		return
	// 	}
	// 	fmt.Println(binance_connector.PrettyPrint(newOrder))
	// }
	//fmt.Scanln()
}
