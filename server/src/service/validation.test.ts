import { describe, expect, it } from "bun:test"
import { isValidItemId, assertValidItemId, validateCities, MAX_BATCH_IDS } from "./validation"
import { BadRequestError } from "../middleware/customError"

describe("isValidItemId", () => {
    it("accepts well-formed Albion ids", () => {
        expect(isValidItemId("T4_BAG")).toBe(true)
        expect(isValidItemId("T8_MAIN_SWORD@3")).toBe(true)
        expect(isValidItemId("UNIQUE_HIDEOUT")).toBe(true)
    })

    it("rejects junk, empty, and unsafe input", () => {
        expect(isValidItemId("")).toBe(false)
        expect(isValidItemId(undefined)).toBe(false)
        expect(isValidItemId("../../etc/passwd")).toBe(false)
        expect(isValidItemId("T4_BAG?x=1")).toBe(false)
        expect(isValidItemId("a".repeat(65))).toBe(false)
    })
})

describe("assertValidItemId", () => {
    it("returns the id when valid", () => {
        expect(assertValidItemId("T4_BAG")).toBe("T4_BAG")
    })
    it("throws BadRequestError when invalid", () => {
        expect(() => assertValidItemId("bad id")).toThrow(BadRequestError)
    })
})

describe("validateCities", () => {
    it("returns undefined for empty input", () => {
        expect(validateCities(undefined)).toBeUndefined()
        expect(validateCities("")).toBeUndefined()
    })
    it("passes through known cities (case-insensitive), trimmed", () => {
        expect(validateCities("Caerleon, Martlock")).toBe("Caerleon,Martlock")
        expect(validateCities("black market")).toBe("black market")
    })
    it("throws on unknown cities", () => {
        expect(() => validateCities("Atlantis")).toThrow(BadRequestError)
        expect(() => validateCities("Caerleon,Atlantis")).toThrow(BadRequestError)
    })
})

describe("MAX_BATCH_IDS", () => {
    it("is a sane positive bound", () => {
        expect(MAX_BATCH_IDS).toBeGreaterThan(0)
        expect(MAX_BATCH_IDS).toBeLessThanOrEqual(500)
    })
})
