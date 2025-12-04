'use client';

import { useState, useMemo, type FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ROLES, UNASSIGNED_ROLE, type Role } from '@/lib/roles';
import {
  Users,
  Swords,
  Shuffle,
  Plus,
  Trash2,
  Skull,
  Heart,
  RotateCcw,
  Sun,
  Moon,
  Gavel,
  EyeOff,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';


type Player = {
  id: number;
  name: string;
  role: Role;
  isAlive: boolean;
  votes: number;
};

const PlayerCard: FC<{
  player: Player;
  onUpdateRole: (playerId: number, roleId: string) => void;
  onToggleStatus: (playerId: number) => void;
  onVote: (playerId: number) => void;
  canVote: boolean;
  isRevealed: boolean;
  onToggleReveal: (playerId: number) => void;
}> = ({ player, onUpdateRole, onToggleStatus, onVote, canVote, isRevealed, onToggleReveal }) => {
  const RoleIcon = isRevealed ? player.role.icon : EyeOff;
  const roleName = isRevealed ? player.role.name : 'Ruolo Nascosto';
  const roleDescription = isRevealed ? player.role.description : 'Clicca "Mostra Ruolo" per rivelarlo.';

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300',
        !player.isAlive && 'bg-destructive/10 border-destructive/50'
      )}
    >
      <CardHeader className="relative pb-4">
        <CardTitle className={cn('pr-12', !player.isAlive && 'line-through')}>
          {player.name}
        </CardTitle>
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant={!player.isAlive ? 'destructive' : 'secondary'}>
                {player.isAlive ? 'Vivo' : 'Eliminato'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-4">
          <RoleIcon className="w-10 h-10 text-primary" />
          <div>
            <p className="font-bold">{roleName}</p>
            <p className="text-sm text-muted-foreground">{roleDescription}</p>
          </div>
        </div>
        {canVote && player.isAlive && (
            <div className="flex items-center justify-between bg-black/10 p-3 rounded-md">
                <span className="font-bold text-lg">Voti: {player.votes}</span>
                <Button size="sm" onClick={() => onVote(player.id)} disabled={!canVote}>
                    <Gavel className="mr-2 h-4 w-4" /> Vota
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 bg-black/10 p-4 rounded-b-lg">
        <Button variant="outline" className="w-full" onClick={() => onToggleReveal(player.id)}>
          {isRevealed ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
          {isRevealed ? 'Nascondi Ruolo' : 'Mostra Ruolo'}
        </Button>
        <Select
          value={player.role.id}
          onValueChange={(roleId) => onUpdateRole(player.id, roleId)}
          disabled={!player.isAlive}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Assegna ruolo" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onToggleStatus(player.id)}
        >
          {player.isAlive ? <Skull className="mr-2" /> : <Heart className="mr-2" />}
          {player.isAlive ? 'Elimina' : 'Ripristina'}
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function LupusManagerPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<'Giorno' | 'Notte'>('Giorno');
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>(
    ROLES.reduce((acc, role) => ({ ...acc, [role.id]: 0 }), {})
  );
  const [revealedPlayerIds, setRevealedPlayerIds] = useState<Set<number>>(new Set());

  const livingPlayersCount = useMemo(() => players.filter(p => p.isAlive).length, [players]);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([
        ...players,
        {
          id: Date.now(),
          name: newPlayerName.trim(),
          role: UNASSIGNED_ROLE,
          isAlive: true,
          votes: 0,
        },
      ]);
      setNewPlayerName('');
    }
  };
  
  const handleRemovePlayer = (id: number) => {
    setPlayers(players.filter((p) => p.id !== id));
  };
  
  const canStartGame = useMemo(() => players.length >= 3, [players.length]);

  const handleStartGame = () => {
    if (canStartGame) {
      setGameStarted(true);
      toast({
        title: "Partita Iniziata!",
        description: "Assegna i ruoli ai giocatori, manualmente o casualmente.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Pochi giocatori",
        description: "Sono necessari almeno 3 giocatori per iniziare.",
      })
    }
  };

  const handleUpdateRole = (playerId: number, roleId: string) => {
    setPlayers(players.map(p => p.id === playerId ? {...p, role: ROLES.find(r => r.id === roleId) || UNASSIGNED_ROLE} : p));
  };

  const handleToggleStatus = (playerId: number) => {
    setPlayers(players.map(p => {
        if (p.id === playerId) {
            const isNowAlive = !p.isAlive;
            toast({
                title: isNowAlive ? 'Giocatore Ripristinato' : 'Giocatore Eliminato',
                description: `${p.name} è stato ${isNowAlive ? 'riportato in vita' : 'eliminato dal gioco'}.`,
                variant: isNowAlive ? 'default' : 'destructive'
            });
            return {...p, isAlive: isNowAlive};
        }
        return p;
    }));
  };

  const handleRoleCountChange = (roleId: string, count: number) => {
    setRoleCounts(prev => ({...prev, [roleId]: Math.max(0, count)}));
  }

  const totalRolesSelected = useMemo(() => Object.values(roleCounts).reduce((sum, count) => sum + count, 0), [roleCounts]);
  
  const handleRandomizeRoles = () => {
    if (players.length === 0) {
        toast({ variant: 'destructive', title: 'Nessun giocatore', description: 'Aggiungi dei giocatori prima di assegnare i ruoli.' });
        return;
    }
    if (totalRolesSelected !== players.length) {
        toast({ variant: 'destructive', title: 'Conteggio ruoli non valido', description: `Il numero di ruoli selezionati (${totalRolesSelected}) deve corrispondere al numero di giocatori (${players.length}).` });
        return;
    }

    const rolesToAssign: Role[] = [];
    for (const roleId in roleCounts) {
        const role = ROLES.find(r => r.id === roleId);
        if (role) {
            for (let i = 0; i < roleCounts[roleId]; i++) {
                rolesToAssign.push(role);
            }
        }
    }
    
    // Shuffle the roles array
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
    }

    setPlayers(players.map((player, index) => ({
      ...player,
      role: rolesToAssign[index] || UNASSIGNED_ROLE,
    })));
    setRevealedPlayerIds(new Set()); // Hide all roles after randomizing

    toast({
        title: "Ruoli Assegnati Casualmente!",
        description: "I ruoli segreti sono stati distribuiti secondo le tue specifiche.",
      })
  };
  
  const handleResetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setNewPlayerName('');
    setTurn(1);
    setPhase('Giorno');
    setRoleCounts(ROLES.reduce((acc, role) => ({ ...acc, [role.id]: 0 }), {}));
    setRevealedPlayerIds(new Set());
  };

  const handleNextPhase = () => {
    if (phase === 'Giorno') {
      setPhase('Notte');
      toast({ title: "È calata la notte...", description: `Inizia la fase notturna del turno ${turn}.`});
    } else {
      setPhase('Giorno');
      setTurn(turn + 1);
      toast({ title: "Il sole sorge!", description: `Inizia la fase diurna del turno ${turn + 1}.`});
    }
    // Reset votes and hide all roles at the start of each phase
    setPlayers(players.map(p => ({ ...p, votes: 0 })));
    setRevealedPlayerIds(new Set());
  };

  const handleVote = (playerId: number) => {
    setPlayers(players.map(p => p.id === playerId ? {...p, votes: p.votes + 1} : p));
  }

  const handleToggleReveal = (playerId: number) => {
    setRevealedPlayerIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(playerId)) {
            newSet.delete(playerId);
        } else {
            newSet.add(playerId);
        }
        return newSet;
    });
  }

  const handleHideAllRoles = () => {
    setRevealedPlayerIds(new Set());
  }

  const playerWithMostVotes = useMemo(() => {
    if (phase !== 'Giorno') return null;
    const livingPlayers = players.filter(p => p.isAlive);
    if (livingPlayers.length === 0) return null;

    const maxVotes = Math.max(...livingPlayers.map(p => p.votes));
    if (maxVotes === 0) return null;

    const playersWithMaxVotes = livingPlayers.filter(p => p.votes === maxVotes);

    // If there is a tie, no one is eliminated yet
    if (playersWithMaxVotes.length !== 1) {
      return null;
    }

    return playersWithMaxVotes[0];
  }, [players, phase]);


  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <Swords className="w-10 h-10" /> Lupus Manager
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Lo strumento per il Game Master per gestire le tue partite di Lupus dal vivo.
            </p>
        </header>

        <main>
          {!gameStarted ? (
            <div className="max-w-2xl mx-auto grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-6 h-6" /> Crea una Nuova Partita</CardTitle>
                        <CardDescription>Aggiungi i nomi dei giocatori per iniziare.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }} className="flex gap-2">
                            <Input 
                                placeholder="Nome del giocatore"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                            />
                            <Button type="submit"><Plus className="w-4 h-4 mr-2" /> Aggiungi</Button>
                        </form>
                    </CardContent>
                    {players.length > 0 && (
                        <>
                            <Separator />
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-2">Giocatori ({players.length})</h3>
                                <ul className="space-y-2">
                                    {players.map(player => (
                                        <li key={player.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                            <span>{player.name}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(player.id)}>
                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </>
                    )}
                    <CardFooter>
                        <Button className="w-full" size="lg" disabled={!canStartGame} onClick={handleStartGame}>
                            <Swords className="mr-2 h-4 w-4"/> Inizia e Assegna Ruoli
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          ) : (
            <div>
              <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Stato Partita</span>
                        <Badge variant="secondary" className="text-base">
                            {phase === 'Giorno' ? <Sun className="mr-2"/> : <Moon className="mr-2" />}
                            Turno {turn} - {phase}
                        </Badge>
                    </CardTitle>
                    <CardDescription>Giocatori vivi: {livingPlayersCount} / {players.length}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleNextPhase}>
                        {phase === 'Giorno' ? <Moon className="mr-2" /> : <Sun className="mr-2" />}
                        {phase === 'Giorno' ? 'Termina Giorno' : 'Termina Notte'}
                    </Button>
                    <Button variant="outline" onClick={handleResetGame}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Nuova Partita
                    </Button>
                </CardContent>
                {playerWithMostVotes && (
                    <CardFooter className="flex-col gap-2 pt-4 border-t">
                        <p className="text-center font-bold">
                            {playerWithMostVotes.name} ha ricevuto il maggior numero di voti.
                        </p>
                        <Button variant="destructive" onClick={() => handleToggleStatus(playerWithMostVotes.id)}>
                            <Skull className="mr-2" /> Elimina {playerWithMostVotes.name}
                        </Button>
                    </CardFooter>
                )}
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Assegnazione Ruoli Casuale</CardTitle>
                  <CardDescription>
                    Specifica quanti giocatori per ogni ruolo. Il totale deve corrispondere al numero di giocatori ({players.length}).
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ROLES.map(role => {
                    const RoleIcon = role.icon;
                    return (
                      <div key={role.id} className="space-y-2">
                        <Label htmlFor={`role-${role.id}`} className="flex items-center gap-2">
                          <RoleIcon className="w-4 h-4" />
                          {role.name}
                        </Label>
                        <Input
                          id={`role-${role.id}`}
                          type="number"
                          min="0"
                          value={roleCounts[role.id] ?? 0}
                          onChange={(e) => handleRoleCountChange(role.id, parseInt(e.target.value, 10) || 0)}
                          className="w-full"
                        />
                      </div>
                    )
                  })}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <div className={cn(
                        'w-full text-center p-2 rounded-md',
                        totalRolesSelected === players.length ? 'bg-green-500/20 text-green-300' : 'bg-destructive/20 text-destructive-foreground'
                    )}>
                        {totalRolesSelected} / {players.length} ruoli selezionati
                    </div>
                  <Button onClick={handleRandomizeRoles} className="w-full" disabled={totalRolesSelected !== players.length}>
                      <Shuffle className="mr-2 h-4 w-4" /> Assegna Casualmente ({totalRolesSelected})
                  </Button>
                </CardFooter>
              </Card>

              <div className="mb-4 text-right">
                  <Button variant="secondary" onClick={handleHideAllRoles}>
                      <EyeOff className="mr-2" /> Nascondi Tutti i Ruoli
                  </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {players.map(player => (
                  <PlayerCard key={player.id} player={player} onUpdateRole={handleUpdateRole} onToggleStatus={handleToggleStatus} onVote={handleVote} canVote={phase === 'Giorno'} isRevealed={revealedPlayerIds.has(player.id)} onToggleReveal={handleToggleReveal} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
