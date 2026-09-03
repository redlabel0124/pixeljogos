import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowLeft, LogOut, Users, Gamepad2, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return <main className="min-h-screen bg-[#090711] p-6 text-slate-300">Carregando painel...</main>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090711] p-6 text-white">
        <Card className="w-full max-w-md border-white/10 bg-[#11101a] text-white">
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
            <CardDescription className="text-slate-400">Esta área está disponível somente para administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-600" onClick={() => setLocation("/")}>Voltar ao site</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <main className="min-h-screen bg-[#090711] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" className="mb-3 px-0 text-slate-400 hover:bg-transparent hover:text-white" onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao catálogo
            </Button>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-lg shadow-fuchsia-950/40">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300">Pixel Jogos</p>
                <h1 className="text-3xl font-bold tracking-tight">Painel administrativo</h1>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-red-400/30 bg-transparent text-red-200 hover:bg-red-500/10 hover:text-red-100" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair da conta
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-fuchsia-400/20 bg-fuchsia-500/10 text-white">
            <CardHeader className="pb-3"><CardDescription className="text-fuchsia-200">Status da conta</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><Badge className="bg-emerald-500/20 text-emerald-200">ADMIN</Badge></CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300">Você tem acesso administrativo a esta aplicação.</CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] text-white"><CardHeader className="pb-3"><CardDescription className="text-slate-400">Usuários</CardDescription><CardTitle className="flex items-center gap-3 text-2xl"><Users className="h-6 w-6 text-fuchsia-400" /> Gerenciamento</CardTitle></CardHeader><CardContent className="text-sm text-slate-400">Área preparada para gerenciar contas e permissões.</CardContent></Card>
          <Card className="border-white/10 bg-white/[0.04] text-white"><CardHeader className="pb-3"><CardDescription className="text-slate-400">Catálogo</CardDescription><CardTitle className="flex items-center gap-3 text-2xl"><Gamepad2 className="h-6 w-6 text-violet-400" /> Jogos</CardTitle></CardHeader><CardContent className="text-sm text-slate-400">Área preparada para organizar os jogos publicados.</CardContent></Card>
        </section>

        <Card className="border-white/10 bg-[#11101a] text-white">
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-fuchsia-400" /> Configurações administrativas</CardTitle><CardDescription className="text-slate-400">Resumo da sessão atual.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Administrador</p><p className="mt-2 break-words font-medium text-white">{user.email || user.name || "Conta Pixel Jogos"}</p></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Permissão</p><p className="mt-2 font-medium text-fuchsia-200">role = admin</p></div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
