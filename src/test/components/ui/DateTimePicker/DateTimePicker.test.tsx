import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";

describe("DateTimePicker Component", () => {
  it("renders trigger button with placeholder when empty", () => {
    render(<DateTimePicker value="" placeholder="Select due date and time" />);

    expect(screen.getByText("Select due date and time")).toBeInTheDocument();
  });

  it("renders formatted date and time when value is provided", () => {
    render(<DateTimePicker value="2026-09-05T17:00" />);

    expect(screen.getByText("5 Sep 2026, 05:00 PM")).toBeInTheDocument();
  });

  it("opens popover dialog on trigger click", () => {
    render(<DateTimePicker value="2026-09-05T17:00" />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(TASK_CREATE_STRINGS.fields.dueAtAriaLabel, "i"),
    });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("dialog", {
        name: TASK_CREATE_STRINGS.dateTimePicker.dialogAriaLabel,
      }),
    ).toBeInTheDocument();
  });

  it("allows selecting a day from the calendar", () => {
    const handleChange = vi.fn();
    render(<DateTimePicker value="2026-09-05T17:00" onChange={handleChange} />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(TASK_CREATE_STRINGS.fields.dueAtAriaLabel, "i"),
    });
    fireEvent.click(trigger);

    const day10Btn = screen.getByRole("button", { name: "2026-09-10" });
    fireEvent.click(day10Btn);

    expect(handleChange).toHaveBeenCalledWith("2026-09-10T17:00");
  });

  it("allows changing hour and period (AM/PM)", () => {
    const handleChange = vi.fn();
    render(<DateTimePicker value="2026-09-05T17:00" onChange={handleChange} />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(TASK_CREATE_STRINGS.fields.dueAtAriaLabel, "i"),
    });
    fireEvent.click(trigger);

    // Click hour '09'
    const hour9Btn = screen.getByRole("button", { name: "09" });
    fireEvent.click(hour9Btn);
    expect(handleChange).toHaveBeenCalledWith("2026-09-05T21:00");

    // Click AM button
    const amBtn = screen.getByRole("button", { name: "AM" });
    fireEvent.click(amBtn);
    expect(handleChange).toHaveBeenCalledWith("2026-09-05T09:00");
  });

  it("applies quick schedule preset on click", () => {
    const handleChange = vi.fn();
    render(<DateTimePicker value="2026-09-05T17:00" onChange={handleChange} />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(TASK_CREATE_STRINGS.fields.dueAtAriaLabel, "i"),
    });
    fireEvent.click(trigger);

    const todayEodBtn = screen.getByRole("button", {
      name: TASK_CREATE_STRINGS.dateTimePicker.presets.todayEod,
    });
    fireEvent.click(todayEodBtn);

    expect(handleChange).toHaveBeenCalled();
  });

  it("clears value when clear button is clicked", () => {
    const handleChange = vi.fn();
    render(<DateTimePicker value="2026-09-05T17:00" onChange={handleChange} />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(TASK_CREATE_STRINGS.fields.dueAtAriaLabel, "i"),
    });
    fireEvent.click(trigger);

    const clearBtn = screen.getByRole("button", {
      name: "Clear date and time",
    });
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith("");
    expect(
      screen.queryByRole("dialog", {
        name: TASK_CREATE_STRINGS.dateTimePicker.dialogAriaLabel,
      }),
    ).not.toBeInTheDocument();
  });

  it("closes popover on Escape key press", () => {
    render(<DateTimePicker value="2026-09-05T17:00" />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(TASK_CREATE_STRINGS.fields.dueAtAriaLabel, "i"),
    });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("dialog", {
        name: TASK_CREATE_STRINGS.dateTimePicker.dialogAriaLabel,
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", {
        name: TASK_CREATE_STRINGS.dateTimePicker.dialogAriaLabel,
      }),
    ).not.toBeInTheDocument();
  });
});
