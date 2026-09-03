import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  profile: { plan: "none", dailyUsageSeconds: 3599, dailyUsageDate: "2026-08-20" },
  refetch: vi.fn().mockResolvedValue(undefined),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
  updateOptions: null as any,
  updateMutation: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  activateOptions: null as any,
  usageOptions: null as any,
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Player", email: "player@example.com", avatarUrl: "https://example.com/player.jpg" }, loading: false, isAuthenticated: true, logout: mocks.logout }) }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError, info: mocks.toastInfo, success: mocks.toastSuccess } }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ auth: { me: { invalidate: vi.fn() } } }), account: {
  profile: { useQuery: () => ({ data: mocks.profile, refetch: mocks.refetch }) },
  updateProfile: { useMutation: (options: any) => { mocks.updateOptions = options; return { mutate: (input: any) => { mocks.updateMutation(input); options.onSuccess?.(); }, isPending: false }; } },
  activatePlan: { useMutation: (options: any) => { mocks.activateOptions = options; return { mutate: () => { mocks.profile.plan = "free"; options.onSuccess?.(); }, isPending: false }; } },
  addUsage: { useMutation: (options: any) => { mocks.usageOptions = options; return { mutate: () => options.onError?.(), isError: false }; } },
} } }));

import Home from "./Home";

describe("Home timer error flow", () => {
  beforeEach(() => { cleanup(); mocks.profile.plan = "none"; mocks.profile.dailyUsageSeconds = 3599; mocks.updateMutation.mockClear(); mocks.logout.mockClear(); vi.useFakeTimers(); mocks.refetch.mockClear(); mocks.toastError.mockClear(); });
  it("opens the profile with photo, name and email on mobile", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir perfil" }));
    expect(screen.getByText("Meu perfil")).toBeTruthy();
    expect(screen.getByText("Player")).toBeTruthy();
    expect(screen.getByText("player@example.com")).toBeTruthy();
    expect(screen.getAllByAltText("Foto de perfil").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Alterar perfil" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Ver planos" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Alterar perfil" }));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Novo Nome" } });
    fireEvent.change(screen.getByLabelText("Imagem de perfil"), { target: { value: "https://example.com/new.jpg" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(mocks.updateMutation).toHaveBeenCalledWith({ name: "Novo Nome", avatarUrl: "https://example.com/new.jpg" });
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    expect(mocks.logout).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Ver planos" })[0]);
    expect(screen.getByText("Planos de acesso")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voltar aos jogos" }));
    expect(screen.getByText("Biblioteca Pixel")).toBeTruthy();
  });

  it("shows and activates the fullscreen control inside the player", () => {
    mocks.profile.plan = "monthly";
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: requestFullscreen });
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null, writable: true });
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Subway Surfers" }));
    const fullscreenButton = screen.getByRole("button", { name: "Abrir tela cheia" });
    expect(fullscreenButton).toBeTruthy();
    fireEvent.click(fullscreenButton);
    expect(requestFullscreen).toHaveBeenCalled();
  });

  it("falls back to an expanded player when native fullscreen is rejected", async () => {
    mocks.profile.plan = "monthly";
    const requestFullscreen = vi.fn().mockRejectedValue(new Error("blocked by iframe"));
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: requestFullscreen });
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null, writable: true });
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Subway Surfers" }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Abrir tela cheia" })); await Promise.resolve(); });
    expect(screen.getByRole("button", { name: "Sair da tela cheia" })).toBeTruthy();
    expect(mocks.toastInfo).toHaveBeenCalledWith("O navegador bloqueou a tela cheia nativa. Ativamos o modo expandido do player.");
    fireEvent.click(screen.getByRole("button", { name: "Sair da tela cheia" }));
    expect(screen.getByRole("button", { name: "Abrir tela cheia" })).toBeTruthy();
  });

  it("opens the corrected Portal game inside the protected player with an active plan", () => {
    mocks.profile.plan = "monthly";
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Portal: Flash Version" }));
    expect(screen.getByRole("dialog", { name: "Player de Portal: Flash Version" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Abrir tela cheia" })).toBeTruthy();
  });

  it("opens the HTML5 game with fullscreen control after plan access", () => {
    mocks.profile.plan = "monthly";
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Third World Farmer" }));
    expect(screen.getByRole("dialog", { name: "Player de Third World Farmer" })).toBeTruthy();
    expect(screen.getByTitle("Third World Farmer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Abrir tela cheia" })).toBeTruthy();
  });

  it("returns to the catalog from cart and payment", () => {
    render(<Home />);
    fireEvent.click(screen.getAllByRole("button", { name: "Ver planos" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Escolher plano" })[1]);
    expect(screen.getByText("Seu carrinho")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voltar aos jogos" }));
    expect(screen.getByText("Biblioteca Pixel")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Ver planos" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Escolher plano" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Pagamento demonstrativo")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voltar aos jogos" }));
    expect(screen.getByText("Biblioteca Pixel")).toBeTruthy();
  });

  it("resets the real Home timer and refetches after addUsage fails", async () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Subway Surfers" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Escolher plano" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pagamento fictício" }));
    expect(screen.getByText("Biblioteca Pixel")).toBeTruthy();
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(mocks.toastError).toHaveBeenCalled();
    expect(mocks.refetch).toHaveBeenCalled();
  });
});
