import { render, screen } from "@testing-library/react";
import { NoteStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { DashboardStats } from "./dashboard-stats";

describe("DashboardStats", () => {
  it("links each status chip to the notes status filter", () => {
    render(
      <DashboardStats
        stats={{
          total: 8,
          needsReview: 2,
          overdue: 1,
          explainable: 2,
          statusCounts: [
            { status: NoteStatus.DRAFT, count: 2 },
            { status: NoteStatus.REVIEWING, count: 3 },
            { status: NoteStatus.EXPLAINABLE, count: 2 },
            { status: NoteStatus.ARCHIVED, count: 1 },
          ],
          topTags: [],
          weeklyThemes: [],
        }}
        reviewQueue={[]}
        overdueNotes={[]}
      />,
    );

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/notes?status=DRAFT");
    expect(hrefs).toContain("/notes?status=REVIEWING");
    expect(hrefs).toContain("/notes?status=EXPLAINABLE");
    expect(hrefs).toContain("/notes?status=ARCHIVED");
  });
});
