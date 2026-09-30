import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { UserGuide } from "@/features/guide/components/UserGuide/UserGuide";

const mockUseAuth = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("UserGuide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders member guide by default for MEMBER role", () => {
    mockUseAuth.mockReturnValue({
      viewer: {
        userId: "member-1",
        role: "MEMBER",
        status: "ACTIVE",
        scope: { type: "MEMBER", teamId: "team-1" },
      },
    });

    render(<UserGuide />);

    expect(screen.getByText("Operix Member User Guide")).toBeInTheDocument();
    expect(screen.getByText("MEMBER")).toBeInTheDocument();
  });

  it("renders admin guide for ADMIN role and supports role preview switching", () => {
    mockUseAuth.mockReturnValue({
      viewer: {
        userId: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
        scope: { type: "ADMIN", teamIds: ["team-1"] },
      },
    });

    render(<UserGuide />);

    expect(screen.getByText("Operix Admin User Guide")).toBeInTheDocument();
    expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);

    // Switch preview to MEMBER
    const memberOption = screen.getByRole("radio", { name: "MEMBER" });
    fireEvent.click(memberOption);

    expect(screen.getByText("Operix Member User Guide")).toBeInTheDocument();
  });

  it("switches language between English and Bangla", () => {
    mockUseAuth.mockReturnValue({
      viewer: {
        userId: "superadmin-1",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        scope: { type: "GLOBAL" },
      },
    });

    render(<UserGuide />);

    expect(screen.getByText("Operix Super Admin User Guide")).toBeInTheDocument();

    // Toggle to Bangla
    const banglaBtn = screen.getByRole("radio", { name: "বাংলা" });
    fireEvent.click(banglaBtn);

    expect(
      screen.getByText("অপারেক্স সুপার অ্যাডমিন ব্যবহারকারী নির্দেশিকা"),
    ).toBeInTheDocument();

    // Toggle back to English
    const englishBtn = screen.getByRole("radio", { name: "English" });
    fireEvent.click(englishBtn);

    expect(screen.getByText("Operix Super Admin User Guide")).toBeInTheDocument();
  });
});
