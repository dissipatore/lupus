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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"


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
}> = ({ player, onUpdateRole, onToggleStatus, onVote, canVote }) => {
  const RoleIcon = player.role.icon;

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
            <p className="font-bold">{player.role.name}</p>
            <p className="text-sm text-muted-foreground">{player.role.description}</p>
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
      <CardFooter className="flex flex-col sm:flex-row gap-2 bg-black/10 p-4 rounded-b-lg">
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
          {player.isAlive ? <Skull className="mr-2 h-4 w-4" /> : <Heart className="mr-2 h-4 w-4" />}
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
  
  const handleRandomizeRoles = () => {
    if (players.length === 0) return;
    
    const availableRoles = [...ROLES];
    const shuffledRoles: Role[] = [];

    // Simple randomization, may not be balanced for a real game
    // but good for a tool. For a real game, you'd want role counts.
    // For now, let's just randomly assign from the available roles.
    for (let i = 0; i < players.length; i++) {
        const randomIndex = Math.floor(Math.random() * availableRoles.length);
        shuffledRoles.push(availableRoles[randomIndex]);
    }


    setPlayers(players.map((player, index) => ({
      ...player,
      role: shuffledRoles[index] || UNASSIGNED_ROLE,
    })));

    toast({
        title: "Ruoli Assegnati Casualmente!",
        description: "I ruoli segreti sono stati distribuiti.",
      })
  };
  
  const handleResetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setNewPlayerName('');
    setTurn(1);
    setPhase('Giorno');
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
    // Reset votes at the start of each phase
    setPlayers(players.map(p => ({ ...p, votes: 0 })));
  };

  const handleVote = (playerId: number) => {
    setPlayers(players.map(p => p.id === playerId ? {...p, votes: p.votes + 1} : p));
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
              <Card className="mb-8">
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
                    <Button onClick={handleRandomizeRoles}>
                        <Shuffle className="mr-2 h-4 w-4" /> Assegna Casualmente
                    </Button>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {players.map(player => (
                  <PlayerCard key={player.id} player={player} onUpdateRole={handleUpdateRole} onToggleStatus={handleToggleStatus} onVote={handleVote} canVote={phase === 'Giorno'} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
