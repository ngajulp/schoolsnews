import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login({ email, password });
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Échec de la connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-database text-primary-600 text-2xl"></i>
                <h1 className="text-2xl font-bold">SchoolAPI</h1>
              </div>
            </div>
            <CardTitle className="text-xl text-center">Connexion à l'administration</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@ecole.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a href="#" className="text-xs text-primary-600 hover:text-primary-800">
                    Mot de passe oublié?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Connexion...</>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-gray-500">
              API de gestion scolaire - Version 1.0.0
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
