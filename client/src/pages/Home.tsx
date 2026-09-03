import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad2, LockKeyhole, LogIn, LogOut, ShoppingCart, Sparkles, Timer, CheckCircle2, UserRound, CreditCard, ArrowLeft, Maximize2, Minimize2, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { advanceFreeTimer, recoverTimerAfterPersistenceError } from "@shared/planRules";
import { BASE_FLASH, originalGames } from "@/data/originalGames";
import { relaySessionToEmbeddedFrame, startLogin } from "@/const";

const plans = [
  { id: "free" as const, name: "Gratuito", price: "R$ 0", detail: "1 hora por dia", accent: "from-fuchsia-500 to-violet-500" },
  { id: "monthly" as const, name: "Mensal", price: "R$ 19,90", detail: "Acesso ilimitado", accent: "from-pink-500 to-purple-600" },
  { id: "annual" as const, name: "Anual", price: "R$ 149,90", detail: "Economize 37%", accent: "from-rose-400 to-fuchsia-600" },
];
const thumbnails: Record<string, string> = {
  "Subway Surfers": "/manus-storage/pixel-jogos-subway-surfers-real_639bcc43.webp",
  "Age of War": "/manus-storage/pixel-jogos-age-of-war-real_91d544ea.jpg",
  "Henry Stickmin": "/manus-storage/pixel-jogos-henry-stickmin-real_889081af.jpg",
  "Super Mario 63": "/manus-storage/pixel-jogos-super-mario-63-real_dacb6df2.jpg",
  "Super Smash Flash": "/manus-storage/pixel-jogos-super-smash-flash-real_751a8673.jpg",
  "Sonic Flash": "/manus-storage/pixel-jogos-sonic-flash-real_40669d14.jpg",
  "Portal: Flash Version": "/manus-storage/pixel-jogos-portal-real_2a78fd71.jpg",
  "Bloons TD": "/manus-storage/pixel-jogos-bloons-td-real_c4ad891a.jpg",
  "Bloons TD 2": "/manus-storage/pixel-jogos-bloons-td-2-specific_5513cc20.svg",
  "Bloons TD 3": "/manus-storage/pixel-jogos-bloons-td-3-specific_fe2bc9ba.svg",
  "Storm the House": "/manus-storage/pixel-jogos-storm-the-house-real_317ca1d5.jpg",
  "Storm the House 2": "/manus-storage/pixel-jogos-storm-the-house-2-specific_2fb7b738.svg",
  "Dad N Me": "/manus-storage/pixel-jogos-dad-n-me-real_963f4a6a.jpg",
  "Commando": "/manus-storage/pixel-jogos-commando-real_c855f273.jpg",
  "Commando 2": "/manus-storage/pixel-jogos-commando-2-specific_b72905cf.svg",
  "Doom": "/manus-storage/pixel-jogos-doom-real_a37fe7b4.jpg",
  "Duck Life": "/manus-storage/pixel-jogos-duck-life-real_e28d36da.png",
  "Duck Life 2": "/manus-storage/pixel-jogos-duck-life-2-real_ef54475d.jpg",
  "Duck Life 3": "/manus-storage/pixel-jogos-duck-life-3-real_720d188e.jpg",
  "Duck Life 4": "/manus-storage/pixel-jogos-duck-life-4-real_08863968.jpg",
  "Learn to Fly": "/manus-storage/pixel-jogos-learn-to-fly-real_108f446b.jpg",
  "Motherload": "/manus-storage/pixel-jogos-motherload-real_568876ac.webp",
  "Bloxorz": "/manus-storage/pixel-jogos-bloxorz-real_899af4e8.jpg",
  "The Impossible Quiz": "/manus-storage/pixel-jogos-the-impossible-quiz-real_da01c6cd.jpg",
  "World's Hardest Game": "/manus-storage/pixel-jogos-worlds-hardest-game-real_a289ba4f.png",
  "Riddle School": "/manus-storage/pixel-jogos-riddle-school-real_9f7f5701.jpg",
  "Riddle School 3": "/manus-storage/pixel-jogos-riddle-school-3-specific_1fda7de1.svg",
  "Riddle School 4": "/manus-storage/pixel-jogos-riddle-school-4-specific_595d952b.svg",
  "Riddle School Transfer": "/manus-storage/pixel-jogos-riddle-school-transfer-specific_591d66b6.svg",
  "Shopping Cart Hero": "/manus-storage/pixel-jogos-shopping-cart-hero-real_a7e8ac99.png",
  "Interactive Buddy": "/manus-storage/pixel-jogos-interactive-buddy-real_aac78fcb.jpg",
  "N": "/manus-storage/pixel-jogos-n-specific_3d23a3f2.svg",
  "Tetris": "/manus-storage/pixel-jogos-tetris-real_0a83db4d.jpg",
  "Pac-Man": "/manus-storage/pixel-jogos-pac-man-real_a8a38012.jpg",
  "Fancy Pants": "/manus-storage/pixel-jogos-fancy-pants-real_657d76dd.jpg",
  "Fancy Pants 2": "/manus-storage/pixel-jogos-fancy-pants-2-specific_8048a916.svg",
  "Papa's Pizzeria": "/manus-storage/pixel-jogos-papa-s-pizzeria-specific_7e140bd8.svg",
  "Penguin Diner": "/manus-storage/pixel-jogos-penguin-diner-specific_712a1a57.svg",
  "Penguin Diner 2": "/manus-storage/pixel-jogos-penguin-diner-2-specific_10fef494.svg",
  "Rollercoaster Creator": "/manus-storage/pixel-jogos-rollercoaster-creator-specific_7de3c1be.svg",
  "Sugar Sugar": "/manus-storage/pixel-jogos-sugar-sugar-specific_dcc307c5.svg",
  "Fireboy and Watergirl": "/manus-storage/pixel-jogos-fireboy-and-watergirl_a28a2ea9.svg",
  "Vex": "/manus-storage/pixel-jogos-vex_282fb94b.svg",
  "Swords and Sandals": "/manus-storage/pixel-jogos-swords-and-sandals_86c41b07.svg",
  "Raft Wars": "/manus-storage/pixel-jogos-raft-wars_8f7efb4c.svg",
  "Red Ball": "/manus-storage/pixel-jogos-red-ball_03187b16.svg",
  "Action Turnip": "/manus-storage/pixel-jogos-action-turnip_3d11bf3a.svg",
  "Strike Force Heroes": "/manus-storage/pixel-jogos-strike-force-heroes_110edf6c.svg",
  "The Fancy Pants Adventures 2": "/manus-storage/pixel-jogos-fancy-pants-adventures-2_b9be3bf7.svg",
  "Third World Farmer": "/manus-storage/pixel-jogos-third-world-farmer_5afa78cc.svg",
  "Electricman 2": "/manus-storage/pixel-jogos-electricman-2_d2011672.svg",
};

const games = originalGames.map(game => ({
  ...game,
  title: game.name,
  label: game.type === "flash" ? "Flash" : "HTML5",
  source: game.source.startsWith("FLASH::") ? `${BASE_FLASH}${game.source.replace("FLASH::", "")}` : game.source.startsWith("DIRECT_FLASH::") ? game.source.replace("DIRECT_FLASH::", "") : game.source,
  color: `from-[${game.color}]/80 to-slate-950`,
  thumbnail: thumbnails[game.name],
}));

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const profileQuery = trpc.account.profile.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const updateProfile = trpc.account.updateProfile.useMutation({ onSuccess: async () => { await Promise.all([profileQuery.refetch(), utils.auth.me.invalidate()]); toast.success("Perfil atualizado com sucesso."); }, onError: () => toast.error("Não foi possível atualizar o perfil.") });
  const activatePlan = trpc.account.activatePlan.useMutation({ onSuccess: () => { profileQuery.refetch(); toast.success("Plano confirmado e catálogo liberado."); setStep("catalog"); }, onError: () => toast.error("Não foi possível ativar o plano. Tente novamente.") });
  const addUsage = trpc.account.addUsage.useMutation({ onError: async () => { toast.error("A sessão do temporizador não pôde ser salva; o contador foi pausado."); secondsRef.current = await recoverTimerAfterPersistenceError(profileQuery.refetch); setSeconds(secondsRef.current); } });
  const [step, setStep] = useState<"plans" | "cart" | "payment" | "confirmed" | "catalog">("catalog");
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[number] | null>(null);
  const [payment, setPayment] = useState("pix");
  const [seconds, setSeconds] = useState(0);
  const [selectedGame, setSelectedGame] = useState<typeof games[number] | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [profilePhotoBroken, setProfilePhotoBroken] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const playerShellRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef(0);
  const profile = profileQuery.data;
  const isGoogleSitesLogin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("login") === "1" && new URLSearchParams(window.location.search).get("returnTo") === "google-sites";
  const userWithPhoto = user as (typeof user & { avatarUrl?: string; picture?: string; avatar?: string }) | null;
  const profilePhoto = profile?.avatarUrl || userWithPhoto?.avatarUrl || userWithPhoto?.picture || userWithPhoto?.avatar;
  const usableProfilePhoto = profilePhoto && !profilePhotoBroken ? profilePhoto : null;
  const profileInitials = (profile?.name || user?.name || user?.email || "P").split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
  const activePlan = profile?.plan ?? "none";
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async user => {
      if (isGoogleSitesLogin) {
        const sent = await relaySessionToEmbeddedFrame();
        if (sent) {
          window.close();
          return;
        }
      }
      utils.auth.me.setData(undefined, user);
      await utils.auth.me.invalidate();
      setAuthOpen(false);
      setAuthPassword("");
      toast.success(`Bem-vindo${user.name ? `, ${user.name}` : ""}!`);
    },
    onError: error => toast.error(error.message || "E-mail ou senha incorretos."),
  });
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async user => {
      if (isGoogleSitesLogin) {
        const sent = await relaySessionToEmbeddedFrame();
        if (sent) {
          window.close();
          return;
        }
      }
      utils.auth.me.setData(undefined, user);
      await utils.auth.me.invalidate();
      setAuthOpen(false);
      setAuthPassword("");
      toast.success("Conta criada com sucesso!");
    },
    onError: error => toast.error(error.message || "Não foi possível criar a conta."),
  });
  const openAuth = (mode: "login" | "register" = "login") => {
    if (typeof window !== "undefined" && window.top !== window.self) {
      void startLogin();
      return;
    }
    setAuthMode(mode);
    setAuthOpen(true);
  };
  useEffect(() => {
    if (!isGoogleSitesLogin) return;
    setAuthMode("login");
    setAuthOpen(true);
  }, [isGoogleSitesLogin]);

  const submitAuth = (event: React.FormEvent) => {
    event.preventDefault();
    if (authMode === "login") {
      loginMutation.mutate({ email: authEmail, password: authPassword });
    } else {
      registerMutation.mutate({ name: authName, email: authEmail, password: authPassword });
    }
  };
  const authPending = loginMutation.isPending || registerMutation.isPending;

  useEffect(() => {
    const onFullscreenChange = () => {
      const native = document.fullscreenElement === playerShellRef.current;
      setIsNativeFullscreen(native);
      if (!document.fullscreenElement) setIsFullscreen(false);
      else setIsFullscreen(native);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const shell = playerShellRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }) | null;
    if (!shell) return;
    if (isFullscreen && !isNativeFullscreen) {
      setIsFullscreen(false);
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }
    try {
      if (shell.requestFullscreen) await shell.requestFullscreen();
      else if (shell.webkitRequestFullscreen) await shell.webkitRequestFullscreen();
      else throw new Error("Fullscreen API indisponível");
      setIsNativeFullscreen(true);
      setIsFullscreen(true);
    } catch {
      setIsNativeFullscreen(false);
      setIsFullscreen(true);
      toast.info("O navegador bloqueou a tela cheia nativa. Ativamos o modo expandido do player.");
    }
  };

  useEffect(() => {
    if (!profileOpen) return;
    setEditName(profile?.name || user?.name || "");
    setEditAvatarUrl(profile?.avatarUrl || profilePhoto || "");
    setProfilePhotoBroken(false);
  }, [profileOpen, profile?.name, profile?.avatarUrl, user?.name, profilePhoto]);
  const persistedUsage = profile?.dailyUsageSeconds ?? 0;
  const remaining = Math.max(0, 3600 - persistedUsage - seconds);
  const timerLabel = `${String(Math.floor(remaining / 60)).padStart(2, "0")}m ${String(remaining % 60).padStart(2, "0")}s`;

  useEffect(() => {
    secondsRef.current = 0;
    setSeconds(0);
  }, [activePlan, profile?.dailyUsageDate, profile?.dailyUsageSeconds]);

  useEffect(() => {
    if (activePlan !== "free" || step !== "catalog" || remaining <= 0 || addUsage.isError) return;
    const id = window.setInterval(() => {
      const transition = advanceFreeTimer(persistedUsage, secondsRef.current, 1);
      secondsRef.current = transition.nextLocalUsageSeconds;
      setSeconds(secondsRef.current);
      addUsage.mutate({ seconds: 1 });
      if (transition.shouldStop) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [activePlan, step, addUsage.isError, persistedUsage]);

  useEffect(() => {
    if (!selectedGame || selectedGame.type !== "flash" || !gameContainerRef.current) return;
    const container = gameContainerRef.current;
    const loadFlash = async () => {
      const win = window as any;
      if (!win.RufflePlayer) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/@ruffle-rs/ruffle";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Ruffle não carregou"));
          document.head.appendChild(script);
        });
      }
      const ruffle = win.RufflePlayer?.newest?.();
      const player = ruffle?.createPlayer?.();
      if (!player) return;
      container.replaceChildren(player);
      player.style.width = "100%";
      player.style.height = "100%";
      await player.load(selectedGame.source);
    };
    loadFlash().catch(() => toast.error("Não foi possível carregar este jogo Flash."));
    return () => container.replaceChildren();
  }, [selectedGame]);

  const currentPlanName = useMemo(() => plans.find(p => p.id === activePlan)?.name ?? "Sem plano", [activePlan]);

  const openPlans = () => {
    setStep("plans");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToCatalog = () => {
    setStep("catalog");
    setSelectedPlan(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlay = (game: typeof games[number]) => {
    if (!isAuthenticated) {
      toast.info("Entre com seu e-mail para jogar.");
      openAuth("login");
      return;
    }
    if (activePlan === "none") {
      toast.info("Escolha um plano para liberar este jogo.");
      setStep("plans");
      return;
    }
    if (activePlan === "free" && remaining <= 0) {
      toast.info("Seu limite gratuito diário terminou. Escolha um plano ilimitado.");
      setStep("plans");
      return;
    }
    setSelectedGame(game);
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#08070d] text-white"><Sparkles className="animate-pulse text-fuchsia-400" /></div>;

  return <main className="min-h-screen bg-[#08070d] text-white"><div className="mx-auto max-w-7xl px-5 py-6 md:px-10"><header className="flex items-center justify-between border-b border-white/10 pb-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-600"><Gamepad2 className="h-5 w-5" /></div><div><p className="font-semibold tracking-wide">PIXEL JOGOS</p><p className="text-xs text-slate-500">PLAY BEYOND LIMITS</p></div></div><div className="flex items-center gap-2 sm:gap-3">{isAuthenticated ? <><Badge className="bg-white/10 text-fuchsia-200">{currentPlanName}</Badge><Button size="sm" variant="outline" onClick={() => { setProfileOpen(true); setProfileEditing(false); }} className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-fuchsia-500/20 hover:text-white" aria-label="Abrir perfil">{usableProfilePhoto ? <img src={usableProfilePhoto} alt="" onError={() => setProfilePhotoBroken(true)} className="mr-1.5 h-5 w-5 rounded-full object-cover" /> : <span className="mr-1.5 grid h-5 w-5 place-items-center rounded-full bg-fuchsia-500/30 text-[10px] font-semibold text-fuchsia-100">{profileInitials}</span>}<span className="hidden sm:inline">Perfil</span></Button><Button size="sm" variant="outline" onClick={openPlans} className="border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/20 hover:text-white" aria-label="Ver planos"><CreditCard className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Planos</span></Button></> : <><Button size="sm" variant="outline" onClick={openPlans} className="border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/20 hover:text-white" aria-label="Ver planos"><CreditCard className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Planos</span></Button><Button size="sm" onClick={() => openAuth("login")} className="bg-gradient-to-r from-pink-500 to-violet-600"><LogIn className="mr-2 h-4 w-4" />Entrar</Button></>}</div></header>

<section className="py-12 md:py-16"><div className="max-w-3xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">Acesso exclusivo</p><h1 className="text-4xl font-semibold leading-tight md:text-6xl">Escolha seu próximo <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">universo.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">Uma experiência curada para quem quer jogar com estilo. Escolha um plano, confirme seu acesso e entre em uma biblioteca que cresce com você.</p></div></section>

{step === "plans" && <section><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold">Planos de acesso</h2><p className="mt-1 text-slate-500">Sem cobrança real nesta versão demonstrativa.</p></div><Button variant="outline" onClick={backToCatalog} className="border-white/10 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos jogos</Button></div><div className="grid gap-5 md:grid-cols-3">{plans.map(plan => <Card key={plan.id} className={`relative overflow-hidden border-white/10 bg-white/[0.045] text-white transition hover:-translate-y-1 hover:border-fuchsia-400/50`}><div className={`h-1 bg-gradient-to-r ${plan.accent}`} /><CardHeader><CardTitle className="flex items-center justify-between">{plan.name}{plan.id === "annual" && <Badge className="bg-fuchsia-500/20 text-fuchsia-200">Mais escolhido</Badge>}</CardTitle><CardDescription className="text-slate-400">{plan.detail}</CardDescription></CardHeader><CardContent><div className="mb-6 text-3xl font-semibold">{plan.price}<span className="text-sm font-normal text-slate-500">{plan.id !== "free" && "/ período"}</span></div><Button className="w-full bg-gradient-to-r from-pink-500 to-violet-600" onClick={() => { setSelectedPlan(plan); setStep("cart"); }}>Escolher plano</Button></CardContent></Card>)}</div></section>}

{step === "cart" && selectedPlan && <section className="mx-auto max-w-2xl"><Card className="border-white/10 bg-white/[0.05] text-white"><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="text-fuchsia-400" />Seu carrinho</CardTitle><CardDescription className="text-slate-400">Revise o acesso antes de continuar.</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-5"><div><p className="font-semibold">Plano {selectedPlan.name}</p><p className="text-sm text-slate-500">{selectedPlan.detail}</p></div><strong>{selectedPlan.price}</strong></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button variant="outline" className="flex-1 border-white/10 bg-transparent text-white" onClick={() => setStep("plans")}>Voltar</Button><Button variant="outline" className="flex-1 border-white/10 bg-transparent text-white" onClick={backToCatalog}><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos jogos</Button><Button className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600" onClick={() => setStep("payment")}>Continuar</Button></div></CardContent></Card></section>}

{step === "payment" && selectedPlan && <section className="mx-auto max-w-2xl"><Card className="border-white/10 bg-white/[0.05] text-white"><CardHeader><CardTitle>Pagamento demonstrativo</CardTitle><CardDescription className="text-slate-400">Nenhuma transação será realizada.</CardDescription></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3">{[["pix", "Pix"], ["card", "Cartão"], ["boleto", "Boleto"]].map(([id, label]) => <button key={id} type="button" aria-pressed={payment === id} onClick={() => setPayment(id)} className={`rounded-xl border p-4 text-left transition ${payment === id ? "border-fuchsia-400 bg-fuchsia-500/10" : "border-white/10 bg-black/20"}`}><p className="font-medium">{label}</p><p className="mt-1 text-xs text-slate-500">Selecionar</p></button>)}</div><div className="mt-6 rounded-xl bg-black/20 p-4 text-sm text-slate-400">Forma selecionada: <strong className="text-white">{payment === "pix" ? "Pix" : payment === "card" ? "Cartão" : "Boleto"}</strong></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button variant="outline" className="flex-1 border-white/10 bg-transparent text-white" onClick={backToCatalog}><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos jogos</Button><Button className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600" disabled={activatePlan.isPending} onClick={() => activatePlan.mutate({ plan: selectedPlan.id })}>Confirmar pagamento fictício</Button></div></CardContent></Card></section>}

{step === "confirmed" && selectedPlan && <section className="mx-auto max-w-xl text-center"><Card className="border-fuchsia-400/20 bg-white/[0.05] text-white"><CardContent className="p-10"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" /><h2 className="mt-5 text-3xl font-semibold">Plano confirmado</h2><p className="mt-3 text-slate-400">Seu acesso demonstrativo está pronto. Ao confirmar, o plano será associado à sua conta e o catálogo será liberado automaticamente.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button variant="outline" className="border-white/10 bg-transparent text-white" onClick={backToCatalog}><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos jogos</Button><Button className="bg-gradient-to-r from-pink-500 to-violet-600" onClick={() => activatePlan.mutate({ plan: selectedPlan.id })}>Ativar acesso</Button></div></CardContent></Card></section>}

{step === "catalog" && <section>
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div><h2 className="text-2xl font-semibold">Biblioteca Pixel</h2><p className="mt-1 text-slate-500">{games.length} jogos originais do seu catálogo anterior.</p></div>
    <div className="flex flex-wrap items-center gap-3">
      {!isAuthenticated && <p className="text-sm text-slate-500">Explore livremente. Para jogar, inicie sua sessão.</p>}
      {isAuthenticated && activePlan === "free" && <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${remaining ? "border-fuchsia-400/30 text-fuchsia-200" : "border-red-400/30 text-red-300"}`}><Timer className="h-4 w-4" />{remaining ? `Tempo restante: ${timerLabel}` : "Limite diário atingido"}</div>}
      {isAuthenticated && activePlan === "none" && <Button size="sm" onClick={() => setStep("plans")} className="bg-gradient-to-r from-pink-500 to-violet-600">Ver planos</Button>}
    </div>
  </div>
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{games.map(game => <Card key={game.title} className="group overflow-hidden border-white/10 bg-white/[0.045] text-white"><div className="relative h-44 overflow-hidden bg-slate-950" style={{ background: `linear-gradient(135deg, ${game.color}, #09090f)` }}><img src={game.thumbnail} alt={`Imagem de ${game.title}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={event => { event.currentTarget.style.display = "none"; }} /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" /></div><CardContent className="p-5"><Badge className="bg-white/10 text-slate-300">{game.label}</Badge><h3 className="mt-3 min-h-12 font-semibold">{game.title}</h3><Button className="mt-4 w-full bg-white/10 hover:bg-fuchsia-500/30" onClick={() => handlePlay(game)} aria-label={`Jogar ${game.title}`}>Jogar agora</Button></CardContent></Card>)}</div>
</section>}
<Dialog open={authOpen} onOpenChange={open => { setAuthOpen(open); if (!open) setAuthPassword(""); }}>
  <DialogContent className="border-white/10 bg-[#11101a] text-white sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-fuchsia-400" />{authMode === "login" ? "Entrar na Pixel Jogos" : "Criar sua conta"}</DialogTitle>
      <DialogDescription className="text-slate-400">Use seu e-mail e senha. Este login não depende mais do Manus AI.</DialogDescription>
    </DialogHeader>
    <form onSubmit={submitAuth} className="space-y-4">
      {authMode === "register" && <div><label htmlFor="auth-name" className="text-xs uppercase tracking-wider text-slate-500">Nome</label><Input id="auth-name" autoComplete="name" value={authName} onChange={event => setAuthName(event.target.value)} className="mt-2 border-white/10 bg-black/20 text-white" placeholder="Seu nome" required minLength={2} maxLength={80} /></div>}
      <div><label htmlFor="auth-email" className="text-xs uppercase tracking-wider text-slate-500">E-mail</label><Input id="auth-email" type="email" autoComplete="email" value={authEmail} onChange={event => setAuthEmail(event.target.value)} className="mt-2 border-white/10 bg-black/20 text-white" placeholder="voce@email.com" required /></div>
      <div><label htmlFor="auth-password" className="text-xs uppercase tracking-wider text-slate-500">Senha</label><div className="relative mt-2"><Input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={event => setAuthPassword(event.target.value)} className="border-white/10 bg-black/20 pr-11 text-white" placeholder={authMode === "register" ? "Mínimo de 8 caracteres" : "Sua senha"} required minLength={authMode === "register" ? 8 : 1} maxLength={128} /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
      <Button type="submit" disabled={authPending} className="w-full bg-gradient-to-r from-pink-500 to-violet-600">{authPending ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar conta"}</Button>
      <button type="button" onClick={() => setAuthMode(mode => mode === "login" ? "register" : "login")} className="w-full text-sm text-slate-400 hover:text-fuchsia-300">{authMode === "login" ? "Ainda não tenho uma conta — criar agora" : "Já tenho uma conta — entrar"}</button>
    </form>
  </DialogContent>
</Dialog>
{profileOpen && isAuthenticated && <Dialog open={profileOpen} onOpenChange={open => { setProfileOpen(open); if (!open) setProfileEditing(false); }}><DialogContent className="border-white/10 bg-[#11101a] text-white"><DialogHeader><DialogTitle className="flex items-center gap-3">{usableProfilePhoto ? <img src={usableProfilePhoto} alt="Foto de perfil" onError={() => setProfilePhotoBroken(true)} className="h-12 w-12 rounded-full object-cover ring-2 ring-fuchsia-400/40" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-sm font-bold">{profileInitials}</span>}<span className="flex items-center gap-2"><UserRound className="h-5 w-5 text-fuchsia-400" />Meu perfil</span></DialogTitle><DialogDescription className="text-slate-400">Informações da sua conta Pixel Jogos.</DialogDescription></DialogHeader>{profileEditing ? <div className="space-y-4"><div><label htmlFor="profile-name" className="text-xs uppercase tracking-wider text-slate-500">Nome</label><Input id="profile-name" value={editName} onChange={event => setEditName(event.target.value)} maxLength={80} className="mt-2 border-white/10 bg-black/20 text-white" placeholder="Seu nome" /></div><div><p className="text-xs uppercase tracking-wider text-slate-500">E-mail</p><p className="mt-2 break-words rounded-xl border border-white/10 bg-black/20 p-3 font-medium text-white">{user?.email || "Não informado"}</p></div><div><label htmlFor="profile-avatar" className="text-xs uppercase tracking-wider text-slate-500">Imagem de perfil</label><Input id="profile-avatar" type="url" value={editAvatarUrl} onChange={event => { setEditAvatarUrl(event.target.value); setProfilePhotoBroken(false); }} className="mt-2 border-white/10 bg-black/20 text-white" placeholder="Cole o link da imagem" /><p className="mt-1 text-xs text-slate-500">Use um link público de imagem (JPG, PNG ou WEBP).</p></div><div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4"><p className="text-xs uppercase tracking-wider text-fuchsia-200">Plano atual</p><p className="mt-1 font-semibold text-white">{currentPlanName}</p></div><div className="flex flex-col gap-3 pt-2 sm:flex-row"><Button className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600" disabled={updateProfile.isPending || !editName.trim()} onClick={() => updateProfile.mutate({ name: editName.trim(), avatarUrl: editAvatarUrl.trim() || null })}>Salvar alterações</Button><Button variant="outline" className="flex-1 border-red-400/30 bg-transparent text-red-200 hover:bg-red-500/10 hover:text-red-100" onClick={async () => { await logout(); setProfileOpen(false); }}><LogOut className="mr-2 h-4 w-4" />Sair da conta</Button></div></div> : <div className="space-y-4"><div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-transparent p-5 text-center"><div className="mx-auto mb-3 grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-xl font-bold shadow-lg shadow-fuchsia-950/40">{usableProfilePhoto ? <img src={usableProfilePhoto} alt="Foto de perfil" onError={() => setProfilePhotoBroken(true)} className="h-full w-full object-cover" /> : profileInitials}</div><h3 className="text-xl font-semibold">{profile?.name || user?.name || "Usuário Pixel"}</h3><p className="mt-1 break-words text-sm text-slate-400">{user?.email || "E-mail não informado"}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Plano atual</p><p className="mt-1 font-semibold text-white">{currentPlanName}</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Acesso</p><p className="mt-1 font-semibold text-fuchsia-200">{activePlan === "none" ? "Escolha um plano" : "Ativo"}</p></div></div><div className="flex flex-col gap-3 sm:flex-row"><Button className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600" onClick={() => setProfileEditing(true)}><UserRound className="mr-2 h-4 w-4" />Alterar perfil</Button>{user?.role === "admin" && <Button variant="outline" className="flex-1 border-fuchsia-400/30 bg-transparent text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white" onClick={() => { setProfileOpen(false); window.location.href = "/admin"; }}><ShieldCheck className="mr-2 h-4 w-4" />Painel admin</Button>}</div><Button variant="outline" className="w-full border-red-400/30 bg-transparent text-red-200 hover:bg-red-500/10 hover:text-red-100" onClick={async () => { await logout(); setProfileOpen(false); }}><LogOut className="mr-2 h-4 w-4" />Sair da conta</Button></div>}</DialogContent></Dialog>}
  {selectedGame && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label={`Player de ${selectedGame.title}`}><div ref={playerShellRef} className={`${isFullscreen ? "fixed inset-0 z-[60] h-screen w-screen max-w-none rounded-none border-0" : "flex h-[min(760px,92vh)] w-full max-w-5xl rounded-2xl border border-fuchsia-400/30"} flex flex-col overflow-hidden bg-[#0e0b17] shadow-2xl shadow-fuchsia-950/50`}><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="font-semibold text-white">{selectedGame.title}</h2><p className="text-xs text-slate-500">{selectedGame.label} · catálogo original Pixel Jogos</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="border-white/10 bg-transparent text-slate-300 hover:bg-fuchsia-500/20 hover:text-white" onClick={toggleFullscreen} aria-label={isFullscreen ? "Sair da tela cheia" : "Abrir tela cheia"} title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}>{isFullscreen ? <Minimize2 className="h-4 w-4 sm:mr-1.5" /> : <Maximize2 className="h-4 w-4 sm:mr-1.5" />}<span className="hidden sm:inline">{isFullscreen ? "Sair da tela cheia" : "Tela cheia"}</span></Button><Button variant="ghost" className="text-slate-400 hover:text-white" onClick={async () => { if (document.fullscreenElement) await document.exitFullscreen(); setIsFullscreen(false); setIsNativeFullscreen(false); setSelectedGame(null); }}>Fechar</Button></div></div><div className="min-h-0 flex-1 bg-black p-3">{selectedGame.type === "html5" ? <iframe title={selectedGame.title} src={selectedGame.source} className="h-full w-full rounded-xl border border-white/10" allow="fullscreen; autoplay; gamepad" allowFullScreen /> : <div ref={gameContainerRef} className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950" />}</div></div></div>}
<footer className="mt-16 border-t border-white/10 py-8 text-center"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">DESENVOLVIDO POR JULIANO MASCARENHAS</p><p className="mt-2 text-xs text-slate-600">Pixel Jogos · experiência independente</p></footer></div></main>;
}
