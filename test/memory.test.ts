import { jest, expect, describe, it, beforeEach } from "@jest/globals";
import fs from "node:fs";
import * as memory from "../src/memory";

// Mock fs module
jest.mock("node:fs", () => ({
    readFileSync: jest.fn(),
    writeFile: jest.fn()
}));

// Cast the mocked functions to the correct types
const mockedReadFileSync = fs.readFileSync as unknown as jest.Mock;
const mockedWriteFile = fs.writeFile as unknown as jest.Mock;

describe("Memory Module", () => {
    const testMemoryFile = "memory.json";

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("recall function", () => {
        it("should return empty set when memory file does not exist", async () => {
            // Mock readFileSync to throw an error simulating missing file
            mockedReadFileSync.mockImplementation(() => {
                throw new Error("File not found");
            });

            const result = await memory.recall();

            expect(mockedReadFileSync).toHaveBeenCalledWith(testMemoryFile, "utf8");
            expect(result.humanExperimentsSeen).toBeInstanceOf(Set);
            expect(result.humanExperimentsSeen.size).toBe(0);
        });

        it("should migrate from old format with lastHeSeen property", async () => {
            // Mock old format with lastHeSeen: 5
            mockedReadFileSync.mockReturnValue("{\"lastHeSeen\": 5}");

            const result = await memory.recall();

            expect(result.humanExperimentsSeen).toBeInstanceOf(Set);
            expect(result.humanExperimentsSeen.size).toBe(5);
            expect(Array.from(result.humanExperimentsSeen)).toEqual([1, 2, 3, 4, 5]);
        });

        it("should handle old format with lastHeSeen: 0", async () => {
            mockedReadFileSync.mockReturnValue("{\"lastHeSeen\": 0}");

            const result = await memory.recall();

            expect(result.humanExperimentsSeen).toBeInstanceOf(Set);
            expect(result.humanExperimentsSeen.size).toBe(0);
        });

        it("should parse humanExperimentsSeen from new format", async () => {
            mockedReadFileSync.mockReturnValue("{\"humanExperimentsSeen\": [1, 3, 5, 7]}");

            const result = await memory.recall();

            expect(result.humanExperimentsSeen).toBeInstanceOf(Set);
            expect(result.humanExperimentsSeen.size).toBe(4);
            expect(result.humanExperimentsSeen.has(1)).toBeTruthy();
            expect(result.humanExperimentsSeen.has(3)).toBeTruthy();
            expect(result.humanExperimentsSeen.has(5)).toBeTruthy();
            expect(result.humanExperimentsSeen.has(7)).toBeTruthy();
        });
    });

    describe("remember function", () => {
        it("should add a new number to the set and write to file", async () => {
            // Setup initial state
            mockedReadFileSync.mockReturnValue("{\"humanExperimentsSeen\": [1, 2, 3]}");
            
            // Setup writeFile to capture written data
            let writtenData = "";
            mockedWriteFile.mockImplementation((_, data, callback) => {
                writtenData = data.toString();
                if (typeof callback === "function") {
                    callback(null);
                }
            });

            await memory.remember(5);
            
            // Verify the number was added and file was written
            expect(mockedWriteFile).toHaveBeenCalledTimes(1);
            expect(mockedWriteFile.mock.calls[0][0]).toBe(testMemoryFile);
            
            // Parse the written data and check it
            const parsedData = JSON.parse(writtenData);
            expect(parsedData.humanExperimentsSeen).toEqual([1, 2, 3, 5]);
        });

        it("should not duplicate existing numbers", async () => {
            mockedReadFileSync.mockReturnValue("{\"humanExperimentsSeen\": [1, 2, 3]}");
            
            let writtenData = "";
            mockedWriteFile.mockImplementation((_, data, callback) => {
                writtenData = data.toString();
                if (typeof callback === "function") {
                    callback(null);
                }
            });

            await memory.remember(2);  // Already exists in set
            
            const parsedData = JSON.parse(writtenData);
            expect(parsedData.humanExperimentsSeen).toEqual([1, 2, 3]);
        });

        it("should handle errors when writing to file", async () => {
            mockedReadFileSync.mockReturnValue("{\"humanExperimentsSeen\": [1, 2, 3]}");
            
            // Mock console.error to check if it's called
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
            
            // Make writeFile fail
            mockedWriteFile.mockImplementation((_, __, callback) => {
                if (typeof callback === "function") {
                    callback(new Error("Failed to write"));
                }
            });

            await memory.remember(4);
            
            expect(consoleSpy).toHaveBeenCalled();
            expect(consoleSpy.mock.calls[0][0]).toContain("I can't remember that");
            
            consoleSpy.mockRestore();
        });
    });
});
