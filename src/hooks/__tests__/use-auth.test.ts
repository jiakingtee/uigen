import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import * as actions from "@/actions";
import * as anonWorkTracker from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    test("signIn calls signInAction with credentials and returns result", async () => {
      const expectedResult = { success: true };
      vi.mocked(actions.signIn).mockResolvedValue(expectedResult);
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({ id: "project-id" });

      const { result } = renderHook(() => useAuth());
      const res = await result.current.signIn("test@example.com", "password123");

      expect(actions.signIn).toHaveBeenCalledWith("test@example.com", "password123");
      expect(res).toEqual(expectedResult);
    });

    test("signIn does not redirect when sign in fails", async () => {
      vi.mocked(actions.signIn).mockResolvedValue({ success: false, error: "Invalid" });

      const { result } = renderHook(() => useAuth());
      await result.current.signIn("test@example.com", "wrongpassword");

      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    test("signUp calls signUpAction with credentials and returns result", async () => {
      const expectedResult = { success: true };
      vi.mocked(actions.signUp).mockResolvedValue(expectedResult);
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({ id: "project-id" });

      const { result } = renderHook(() => useAuth());
      const res = await result.current.signUp("test@example.com", "password123");

      expect(actions.signUp).toHaveBeenCalledWith("test@example.com", "password123");
      expect(res).toEqual(expectedResult);
    });

    test("signUp does not redirect when sign up fails", async () => {
      vi.mocked(actions.signUp).mockResolvedValue({ success: false, error: "Email taken" });

      const { result } = renderHook(() => useAuth());
      await result.current.signUp("test@example.com", "password123");

      expect(anonWorkTracker.getAnonWorkData).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
    });
  });

  describe("isLoading state", () => {
    test("isLoading is false initially", () => {
      vi.mocked(actions.signIn).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
    });
  });
});
