// Gestion des comptes de l'espace de travail, sans email.
//
//   node --env-file=.env.local scripts/compte.mjs creer <email> "<Prénom Nom>"
//   node --env-file=.env.local scripts/compte.mjs reinitialiser <email>
//
// `creer` pose une invitation « consultant » puis crée le compte, déjà confirmé : le trigger
// handle_new_user lit l'invitation et donne le rôle. `reinitialiser` remplace le mot de passe.
// Dans les deux cas le mot de passe provisoire s'affiche une seule fois ; la personne le change
// ensuite depuis « Mon compte ». La clé service_role ne quitte jamais cette machine.
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !cle) {
  console.error("Variables manquantes : lancer avec --env-file=.env.local");
  process.exit(1);
}
const admin = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });

// Sans caractères ambigus (0/O, 1/l/I) : il se recopie sur un iPad sans erreur.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const motDePasseProvisoire = () =>
  Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")).join("-");

const trouverUtilisateur = async (email) => {
  for (let page = 1; page < 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
};

const [commande, emailBrut, nom] = process.argv.slice(2);
const email = emailBrut?.trim().toLowerCase();
if (!commande || !email) {
  console.error("Usage : creer <email> \"<Prénom Nom>\" | reinitialiser <email>");
  process.exit(1);
}

if (commande === "creer") {
  if (!nom) {
    console.error("Le nom complet est obligatoire : il apparaît dans l'en-tête et sur le rapport.");
    process.exit(1);
  }
  if (await trouverUtilisateur(email)) {
    console.error(`Un compte existe déjà pour ${email}. Utiliser « reinitialiser ».`);
    process.exit(1);
  }
  const { error: errInv } = await admin
    .from("invitations")
    .insert({ email, role: "consultant", full_name: nom });
  if (errInv) throw errInv;

  const motDePasse = motDePasseProvisoire();
  const { data, error } = await admin.auth.admin.createUser({ email, password: motDePasse, email_confirm: true });
  if (error) throw error;

  const { data: profil } = await admin.from("profiles").select("role, full_name").eq("id", data.user.id).single();
  console.log(`Compte créé : ${email} — rôle ${profil?.role}, nom « ${profil?.full_name} »`);
  console.log(`Mot de passe provisoire : ${motDePasse}`);
} else if (commande === "reinitialiser") {
  const u = await trouverUtilisateur(email);
  if (!u) {
    console.error(`Aucun compte pour ${email}.`);
    process.exit(1);
  }
  const motDePasse = motDePasseProvisoire();
  const { error } = await admin.auth.admin.updateUserById(u.id, { password: motDePasse });
  if (error) throw error;
  console.log(`Nouveau mot de passe provisoire pour ${email} : ${motDePasse}`);
} else {
  console.error(`Commande inconnue : ${commande}`);
  process.exit(1);
}
