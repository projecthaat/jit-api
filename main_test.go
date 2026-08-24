package main

import "testing"

func TestValidateAttributesAllowsMatchingSeoText(t *testing.T) {
	reservedAttributes = map[string]AttributeRule{seoTextAttribute: {Type: "string", MinLength: 1}}
	if err := validateAttributes("slider", map[string]string{seoTextAttribute: "Accessible component content"}); err != nil {
		t.Fatalf("expected seo-text to be accepted: %v", err)
	}
}

func TestValidateAttributesRejectsBlankSeoText(t *testing.T) {
	reservedAttributes = map[string]AttributeRule{seoTextAttribute: {Type: "string", MinLength: 1}}
	if err := validateAttributes("slider", map[string]string{seoTextAttribute: "  "}); err == nil {
		t.Fatal("expected blank seo-text to be rejected")
	}
}

func TestValidateAttributesAllowsComponentAttributes(t *testing.T) {
	reservedAttributes = nil
	customAttributes = map[string]map[string]AttributeRule{"slider": {"autoplay": {Type: "boolean"}}}
	if err := validateAttributes("slider", map[string]string{"autoplay": "true"}); err != nil {
		t.Fatalf("expected component attributes to be accepted: %v", err)
	}
}
