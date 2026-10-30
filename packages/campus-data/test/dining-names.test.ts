import { describe, expect, it } from "vitest";
import { tidyItemName } from "../src/dining.ts";

// UMD Dining's menu names come with stray spacing and the odd all-caps entry.
describe("tidyItemName", () => {
  it("fixes spacing around commas", () => {
    expect(tidyItemName("Peach, Carmelized Onion Flatbread with Watercress,VeganFeta")).toBe(
      "Peach, Carmelized Onion Flatbread with Watercress, VeganFeta",
    );
    expect(tidyItemName("Chicken , Prosciutto with Wine Cream Sauce")).toBe("Chicken, Prosciutto with Wine Cream Sauce");
  });
  it("collapses runs of spaces", () => {
    expect(tidyItemName("  Turkey   Taco Meat ")).toBe("Turkey Taco Meat");
  });
  it("title-cases all-caps names, keeping short acronyms and lowercasing small words", () => {
    expect(tidyItemName("BLT WITH LEMON HERB AIOLI")).toBe("BLT with Lemon Herb Aioli");
    expect(tidyItemName("BBQ PULLED PORK AND SLAW")).toBe("BBQ Pulled Pork and Slaw");
  });
  it("leaves mixed-case names alone", () => {
    expect(tidyItemName("Tomato Mozz on Sourdough with Fresh Basil")).toBe("Tomato Mozz on Sourdough with Fresh Basil");
    expect(tidyItemName("BLT Sandwich")).toBe("BLT Sandwich");
    expect(tidyItemName("1,000 Island Dressing")).toBe("1,000 Island Dressing");
  });
});
