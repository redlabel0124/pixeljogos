import { describe, expect, it } from "vitest";
import { originalGames } from "./originalGames";

describe("original Pixel Jogos catalog", () => {
  it("keeps the 51 games in the Pixel Jogos catalog", () => {
    expect(originalGames).toHaveLength(51);
    expect(originalGames.map(game => game.name)).toContain("Age of War");
    expect(originalGames.map(game => game.name)).toContain("Super Smash Flash");
    expect(originalGames.map(game => game.name)).toContain("Fireboy and Watergirl");
    expect(originalGames.map(game => game.name)).toContain("Third World Farmer");
    expect(originalGames.filter(game => game.type === "flash")).toHaveLength(49);
    const newGames = ["Fireboy and Watergirl", "Vex", "Swords and Sandals", "Raft Wars", "Red Ball", "Action Turnip", "Strike Force Heroes", "The Fancy Pants Adventures 2", "Third World Farmer", "Electricman 2"];
    expect(newGames.every(name => originalGames.some(game => game.name === name))).toBe(true);
    expect(originalGames.filter(game => newGames.includes(game.name) && game.type === "flash").every(game => game.source.startsWith("FLASH::") || game.source.startsWith("DIRECT_FLASH::"))).toBe(true);
    expect(originalGames.find(game => game.name === "Third World Farmer")?.type).toBe("html5");
    expect(originalGames.find(game => game.name === "Portal: Flash Version")?.source).toBe("FLASH::portal-flash.swf");
  });
});
