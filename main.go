package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type ComponentEntry struct {
	CSS string `json:"css"`
	JS  string `json:"js"`
}

type RegistryConfig struct {
	Version  string                    `json:"version"`
	Registry map[string]ComponentEntry `json:"registry"`
}

type AttributeRule struct {
	Type          string   `json:"type"`
	AllowedValues []string `json:"allowed_values,omitempty"`
	MinLength     int      `json:"min_length,omitempty"`
	Min           int      `json:"min,omitempty"`
}

type ReservedAttributesConfig struct {
	ReservedAttributes map[string]AttributeRule `json:"reserved_attributes"`
}

type CustomAttributesConfig struct {
	Components map[string]map[string]AttributeRule `json:"components"`
}

type CachedAsset struct {
	CSS string
	JS  string
}

var memoryCache = make(map[string]CachedAsset)
var reservedAttributes map[string]AttributeRule
var customAttributes map[string]map[string]AttributeRule

func initializeRegistry() error {
	file, err := os.ReadFile("components.json")
	if err != nil {
		return fmt.Errorf("read components.json: %w", err)
	}

	var config RegistryConfig
	if err := json.Unmarshal(file, &config); err != nil {
		return fmt.Errorf("parse components.json: %w", err)
	}

	for tagName, entry := range config.Registry {
		cssBytes, err := os.ReadFile(entry.CSS)
		if err != nil {
			return fmt.Errorf("read CSS for %s: %w", tagName, err)
		}
		jsBytes, err := os.ReadFile(entry.JS)
		if err != nil {
			return fmt.Errorf("read JavaScript for %s: %w", tagName, err)
		}

		memoryCache[tagName] = CachedAsset{
			CSS: string(cssBytes),
			JS:  string(jsBytes),
		}
	}

	reservedFile, err := os.ReadFile("reserved_attributes.json")
	if err != nil {
		return fmt.Errorf("read reserved_attributes.json: %w", err)
	}
	var reservedConfig ReservedAttributesConfig
	if err := json.Unmarshal(reservedFile, &reservedConfig); err != nil {
		return fmt.Errorf("parse reserved_attributes.json: %w", err)
	}
	reservedAttributes = reservedConfig.ReservedAttributes

	customFile, err := os.ReadFile("custom_attributes.json")
	if err != nil {
		return fmt.Errorf("read custom_attributes.json: %w", err)
	}
	var customConfig CustomAttributesConfig
	if err := json.Unmarshal(customFile, &customConfig); err != nil {
		return fmt.Errorf("parse custom_attributes.json: %w", err)
	}
	customAttributes = customConfig.Components

	return nil
}

type ComponentRequest struct {
	Tag        string            `json:"tag"`
	ID         string            `json:"id"`
	Attributes map[string]string `json:"attributes"`
}

type CompilePayload struct {
	Schema              string             `json:"$schema"`
	ClientToken         string             `json:"client_token"`
	SessionID           string             `json:"session_id"`
	RequestedComponents []ComponentRequest `json:"requested_components"`
}

const seoTextAttribute = "seo-text"

func validateAttribute(name, value string, rule AttributeRule) error {
	if rule.MinLength > 0 && len([]rune(strings.TrimSpace(value))) < rule.MinLength {
		return fmt.Errorf("%s must contain at least %d characters", name, rule.MinLength)
	}
	for _, candidate := range rule.AllowedValues {
		if value == candidate {
			return nil
		}
	}
	if len(rule.AllowedValues) > 0 {
		return fmt.Errorf("%s has an unsupported value", name)
	}
	switch rule.Type {
	case "boolean":
		if value != "true" && value != "false" {
			return fmt.Errorf("%s must be true or false", name)
		}
	case "integer":
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < rule.Min {
			return fmt.Errorf("%s must be an integer of at least %d", name, rule.Min)
		}
	}

	return nil
}

func validateAttributes(tag string, attributes map[string]string) error {
	for name, rule := range reservedAttributes {
		if value, exists := attributes[name]; exists {
			if err := validateAttribute(name, value, rule); err != nil {
				return err
			}
		}
	}
	for name, rule := range customAttributes[tag] {
		if value, exists := attributes[name]; exists {
			if err := validateAttribute(name, value, rule); err != nil {
				return err
			}
		}
	}

	return nil
}

func main() {
	if err := initializeRegistry(); err != nil {
		panic(err)
	}

	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	app.Static("/schema.json", "./schema.json")
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ready", "components": len(memoryCache)})
	})

	app.Post("/v1/compile", func(c *fiber.Ctx) error {
		start := time.Now()
		var payload CompilePayload

		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"status":  "error",
				"message": "malformed payload structure",
			})
		}

		var cssBuffer strings.Builder
		var jsBuffer strings.Builder

		for _, comp := range payload.RequestedComponents {
			if err := validateAttributes(comp.Tag, comp.Attributes); err != nil {
				return c.Status(400).JSON(fiber.Map{
					"status":  "error",
					"message": err.Error(),
				})
			}

			if asset, exists := memoryCache[comp.Tag]; exists {
				cssBuffer.WriteString(fmt.Sprintf("%s[id='%s']{%s}", comp.Tag, comp.ID, asset.CSS))
				jsBuffer.WriteString(asset.JS)
			} else {
				cssBuffer.WriteString(fmt.Sprintf("%s[id='%s']{display:block}", comp.Tag, comp.ID))
				jsBuffer.WriteString(fmt.Sprintf("console.warn('Unknown heavy component: %s');", comp.Tag))
			}
		}

		duration := float64(time.Since(start).Microseconds()) / 1000.0

		return c.JSON(fiber.Map{
			"$schema":           "https://jit.api.projecthaat.org/schema.json",
			"status":            "success",
			"execution_time_ms": duration,
			"payload": fiber.Map{
				"css":        cssBuffer.String(),
				"javascript": jsBuffer.String(),
			},
		})
	})

	if err := app.Listen(":8080"); err != nil {
		panic(err)
	}
}
