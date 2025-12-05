import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'usuario_normal' | 'colaborador' | 'admin';
}

export function AdminUserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Função para buscar a lista de todos os perfis
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    // Nota: Em um app de produção, usar uma Edge Function seria mais seguro
    // para buscar todos os emails (já que o RLS pode restringir a view).
    const { data: profiles, error } = await supabase
      .from('profiles') // Altere 'profiles' se o nome da sua tabela for diferente
      .select('id, email, full_name, role'); 

    if (error) {
      toast({ title: "Erro ao buscar usuários", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    // Supondo que a tabela 'profiles' tenha 'email' e 'full_name'
    setUsers(profiles as UserProfile[]);
    setLoading(false);
  }, [toast]);

  // Função para atualizar a função (role) do usuário
  const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
    setSavingId(userId);
    const { error } = await supabase
      .from('profiles') // Sua tabela de perfis
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: `Função de usuário ID ${userId} atualizada para ${newRole}.` });
      // Atualiza o estado local para refletir a mudança
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setSavingId(null);
  };

  // Função para enviar o e-mail de recuperação de senha
  const handlePasswordReset = async (email: string) => {
    // Supabase envia o link de recuperação para o e-mail
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true` // Para onde o usuário volta
    });

    if (error) {
        toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "E-mail enviado", description: `Um link de reset de senha foi enviado para ${email}.` });
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> Carregando usuários...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Gerenciar Usuários e Permissões</h2>
      <Table>
        <TableCaption>Lista completa de usuários cadastrados ({users.length}).</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-[150px]">Função (Role)</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.full_name || "Não informado"}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole: UserProfile['role']) => handleRoleChange(user.id, newRole)}
                  disabled={savingId !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="usuario_normal">Usuário Normal</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={savingId !== null}
                    onClick={() => handlePasswordReset(user.email)}
                >
                    <KeyRound className="w-4 h-4 mr-2" /> Resetar Senha
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
