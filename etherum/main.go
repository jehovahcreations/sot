package main

import (
	"crypto/ecdsa"
	"fmt"
	"log"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/tyler-smith/go-bip32"
	"github.com/tyler-smith/go-bip39"
)

func main() {
	entropy, _ := bip39.NewEntropy(128)
    mnemonic, _ := bip39.NewMnemonic(entropy)
    fmt.Println("Mnemonic (gen): ", mnemonic)
    seed := bip39.NewSeed(mnemonic, "")
    masterPrivateKey, _ := bip32.NewMasterKey(seed)
    purposeKey, err := masterPrivateKey.NewChildKey(bip32.FirstHardenedChild + 44)
	fmt.Println(purposeKey)
    if err != nil {
        log.Fatal(err)
    }
    coinTypeKey, err := purposeKey.NewChildKey(bip32.FirstHardenedChild + 60)
    if err != nil {
        log.Fatal(err)
    }
    accountKey, err := coinTypeKey.NewChildKey(bip32.FirstHardenedChild)
    if err != nil {
        log.Fatal(err)
    }
    changeKey, err := accountKey.NewChildKey(0)
    if err != nil {
        log.Fatal(err)
    }
    addressKey, err := changeKey.NewChildKey(0)
    if err != nil {
        log.Fatal(err)
    }

    ecdaPrivateKey := crypto.ToECDSAUnsafe(addressKey.Key)
    ecdaPublicKey := ecdaPrivateKey.Public().(*ecdsa.PublicKey)

    address := crypto.PubkeyToAddress(*ecdaPublicKey)
    fmt.Println("address：", address.Hex())
	fmt.Println(string(seed))
}