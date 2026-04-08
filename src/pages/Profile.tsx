import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogOut, Save, User } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (data?.display_name) setDisplayName(data.display_name);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);
      if (error) toast.error("Failed to save profile");
      else toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-8">Profile</h1>

      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} disabled className="opacity-60" />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button variant="outline" onClick={handleLogout} className="w-full text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
