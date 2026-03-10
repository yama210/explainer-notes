import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilterForm } from "./filter-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("FilterForm", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("resets field values and pushes the default notes URL", async () => {
    const { container } = render(
      <FilterForm
        filters={{
          q: "jwt",
          status: "REVIEWING",
          tag: "auth",
          sort: "title_asc",
          review: "due_soon",
        }}
        availableTags={[
          { tag: "auth", count: 2 },
          { tag: "nextjs", count: 1 },
        ]}
      />,
    );

    const keywordInput = container.querySelector<HTMLInputElement>('input[name="q"]');
    const statusSelect = container.querySelector<HTMLSelectElement>('select[name="status"]');
    const tagSelect = container.querySelector<HTMLSelectElement>('select[name="tag"]');
    const reviewSelect = container.querySelector<HTMLSelectElement>('select[name="review"]');
    const sortSelect = container.querySelector<HTMLSelectElement>('select[name="sort"]');

    expect(keywordInput).not.toBeNull();
    expect(statusSelect).not.toBeNull();
    expect(tagSelect).not.toBeNull();
    expect(reviewSelect).not.toBeNull();
    expect(sortSelect).not.toBeNull();

    fireEvent.change(keywordInput!, { target: { value: "docker" } });
    fireEvent.change(statusSelect!, { target: { value: "EXPLAINABLE" } });
    fireEvent.change(tagSelect!, { target: { value: "nextjs" } });
    fireEvent.change(reviewSelect!, { target: { value: "needs_review" } });
    fireEvent.change(sortSelect!, { target: { value: "created_desc" } });

    fireEvent.click(container.querySelector('button[type="button"]')!);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/notes");
    });

    expect(keywordInput).toHaveValue("");
    expect(statusSelect).toHaveValue("ALL");
    expect(tagSelect).toHaveValue("");
    expect(reviewSelect).toHaveValue("all");
    expect(sortSelect).toHaveValue("updated_desc");
  });
});
