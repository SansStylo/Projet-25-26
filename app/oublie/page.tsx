"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendResetCodeEmail, verifyResetCode, updatePasswordAndCleanUp } from "@/app/actions";

export default function MotDePasseOublie() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  
  // État pour contrôler l'affichage de la pop-up de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Simulation des actions serveurs
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // Appel de Nodemailer
    const resultat = await sendResetCodeEmail(email);
    setIsPending(false);

    if (resultat.success) {
        setStep(2);
    } else {
        alert(resultat.error || "Une erreur est survenue lors de l'envoi.");
    }
  };

  const handleResendEmail = async () => {
    setIsPending(true);
    const resultat = await sendResetCodeEmail(email);
    setIsPending(false);

    if (!resultat.success) {
        alert("Envoi refusé.");
    }
    };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const resultat = await verifyResetCode(email, code);
    setIsPending(false);

    if (resultat.success) {
      setStep(3);
    } else {
      alert(resultat.error || "Code de validation incorrect ou expiré.");
    }
  };

  const handleBackClick = () => {
    if (step === 1 && email === "") {
      router.push("/");
    } else {
      setShowConfirmModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F5] items-center justify-center p-4 text-[#1E2E24] font-sans antialiased relative">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5]">
        
        {/* En-tête fixe */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#12261E]">Junia'lytics</h1>
          <p className="text-sm text-[#53665A] mt-1">Récupération de compte</p>
        </div>

        {/* Barre de progression */}
        <div className="flex items-start justify-between mb-8 w-full relative">
          
          {/* Étape 1 */}
          <div className="flex flex-col items-center flex-1 relative">
            {/* Ligne reliant l'étape 1 à 2 */}
            <div className={`absolute h-[2px] top-4 left-1/2 right-0 z-0 -translate-y-1/2 transition-colors duration-300 ${
              step >= 2 ? 'bg-emerald-700' : 'bg-stone-100'
            }`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors duration-300 ${
              step >= 1 ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20" : "bg-stone-100 text-stone-400"
            }`}>
              1
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 z-10 transition-colors duration-300 ${step === 1 ? "text-emerald-700" : "text-stone-400"}`}>
              Email
            </span>
          </div>

          {/* Étape 2 */}
          <div className="flex flex-col items-center flex-1 relative">
            {/* Lignes associées à l'étape 2 */}
            <div className={`absolute h-[2px] top-4 left-0 right-1/2 z-0 -translate-y-1/2 transition-colors duration-300 ${step >= 2 ? 'bg-emerald-700' : 'bg-stone-100'}`} />
            <div className={`absolute h-[2px] top-4 left-1/2 right-0 z-0 -translate-y-1/2 transition-colors duration-300 ${step >= 3 ? 'bg-emerald-700' : 'bg-stone-100'}`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors duration-300 ${
              step >= 2 ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20" : "bg-stone-100 text-stone-400"
            }`}>
              2
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 z-10 transition-colors duration-300 ${step === 2 ? "text-emerald-700" : "text-stone-400"}`}>
              Validation
            </span>
          </div>

          {/* Étape 3 */}
          <div className="flex flex-col items-center flex-1 relative">
            {/* Ligne arrivant à l'étape 3 */}
            <div className={`absolute h-[2px] top-4 left-0 right-1/2 z-0 -translate-y-1/2 transition-colors duration-300 ${step >= 3 ? 'bg-emerald-700' : 'bg-stone-100'}`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors duration-300 ${
              step >= 3 ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20" : "bg-stone-100 text-stone-400"
            }`}>
              3
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 z-10 transition-colors duration-300 ${step === 3 ? "text-emerald-700" : "text-stone-400"}`}>
              Sécurité
            </span>
          </div>

        </div>

        {/* Affichage des formulaires par étapes */}
        {step === 1 && (
          <EtapeEmail 
            email={email} 
            setEmail={setEmail} 
            onSubmit={handleSendEmail} 
            isPending={isPending} 
          />
        )}
        
        {step === 2 && (
          <EtapeCode 
            email={email} 
            code={code} 
            setCode={setCode} 
            onSubmit={handleVerifyCode} 
            isPending={isPending} 
            onBack={() => setStep(1)} 
            onResend={handleResendEmail}
          />
        )}
        
        {step === 3 && (
          <EtapeNouveauMdp
            email={email} />)}

        {/* Pied de page */}
        <div className="mt-6 text-center border-t border-stone-100 pt-4">
          <button 
            type="button" 
            onClick={handleBackClick}
            className="text-sm font-medium text-[#53665A] hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none w-full justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour à la connexion
          </button>
        </div>

      </div>

      {/* Pop-up de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl border border-stone-100">
            
            <h3 className="text-base font-bold text-[#12261E] mb-2">
              Quitter la récupération ?
            </h3>
            <p className="text-xs text-[#53665A] leading-relaxed mb-6">
              Toute votre progression sera perdue et le code de sécurité envoyé par e-mail ne sera plus valide. Êtes-vous sûr de vouloir retourner à l'écran de connexion ?
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-500 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-xl transition duration-150 cursor-pointer"
              >
                Rester ici
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  router.push("/");
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition duration-150 cursor-pointer"
              >
                Oui, quitter
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ÉTAPE 1 : Saisie de l'Adresse Email
function EtapeEmail({ email, setEmail, onSubmit, isPending }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <p className="text-xs text-[#53665A] leading-relaxed">
        Entrez votre adresse email académique Junia. Un code de vérification temporaire vous sera envoyé pour sécuriser votre demande.
      </p>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-stone-600">Adresse email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="enseignant@junia.com"
          className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 text-stone-800 transition duration-150"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold rounded-xl shadow-md shadow-emerald-700/5 transition duration-150 active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2 animate-[fadeIn_0.2s_ease-out_0.15s_both]">
            <svg className="animate-spin h-4 w-4 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Envoi en cours...
          </span>
        ) : "Recevoir le code secret"}
      </button>
    </form>
  );
}

// ÉTAPE 2 : Saisie du Code Secret
function EtapeCode({ email, code, setCode, onSubmit, isPending, onBack, onResend }: any) {
    const [countdown, setCountdown] = useState(60);
    useEffect(() => {
    // Si le compteur tombe à 0, on arrête le timer
    if (countdown <= 0) return;

    // On crée un intervalle qui retire 1 seconde toutes les 1000ms
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Nettoyage du timer si le composant est démonté (l'utilisateur change de page ou d'étape)
    return () => clearInterval(timer);
    }, [countdown]);

    const handleResendClick = () => {
        if (countdown === 0) {
        onResend();       // Déclenche l'envoi du mail réel
        setCountdown(60); // Relance le compte à rebours pour 60 secondes
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
        <p className="text-xs text-[#53665A] leading-relaxed">
            Un code secret à 6 chiffres a été envoyé à l'adresse soumise. Saisissez-le ci-dessous.
        </p>
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600 text-center">Code de validation</label>
            <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full px-4 py-3.5 text-center text-2xl font-bold tracking-[0.4em] placeholder:tracking-normal bg-[#F4F7F5] border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 text-stone-800 transition duration-150"
            required
            />
        </div>
        <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold rounded-xl shadow-md shadow-emerald-700/5 transition duration-150 active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
            {isPending ? (
            <span className="flex items-center justify-center gap-2 animate-[fadeIn_0.2s_ease-out_0.15s_both]">
                <svg className="animate-spin h-4 w-4 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Vérification...
            </span>
            ) : "Vérifier le code"}
        </button>
        <div className="flex flex-col items-center gap-4 pt-4 text-center border-t border-stone-100/80">
    
            {/* Bouton de renvoi dynamique */}
            <button
                type="button"
                disabled={countdown > 0 || isPending}
                onClick={handleResendClick}
                className={`text-xs font-medium bg-transparent border-none transition-all duration-150 ${
                countdown > 0 
                    ? "text-stone-400 cursor-not-allowed select-none" 
                    : "text-stone-600 hover:text-emerald-700 cursor-pointer group"
                }`}>
                {countdown > 0 ? (
                <span className="flex items-center gap-1.5 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M5 2h14"/><path d="M5 22h14"/><path d="M19 2v4c0 3-2 5-5 7 3 2 5 4 5 7v4"/><path d="M5 2v4c0 3 2 5 5 7-3 2-5 4-5 7v4"/></svg>
                    Renvoyer un code dans <span className="font-bold tabular-nums text-stone-500">{countdown}s</span>
                </span>
                ) : (
                <span>
                    Je n'ai pas reçu le code — <span className="text-emerald-700 font-bold group-hover:underline decoration-1 underline-offset-2">Renvoyer</span>
                </span>
                )}
            </button>

        {/* Bouton de modification de l'e-mail */}
            <button 
                type="button" 
                onClick={onBack} 
                className="text-xs font-medium text-stone-400/90 hover:text-stone-600 transition-colors bg-transparent border-none cursor-pointer hover:underline underline-offset-2"
            >Modifier l'adresse email
            </button>
        </div>
    </form>
    );
}

// ÉTAPE 3 : Choix du Nouveau Mot de passe
function EtapeNouveauMdp({email}: {email: string}) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    const res = await updatePasswordAndCleanUp(email, password);

    if (res.success) {
      setSuccess(true); // Affiche l'écran de succès final
    } else {
      alert(res.error || "Erreur lors du changement de mot de passe.");
    }
  };

  


  if (success) {
    return (
      <div className="text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 className="font-bold text-lg text-[#12261E]">Mot de passe modifié !</h3>
        <p className="text-xs text-[#53665A] leading-relaxed pb-2">
          Votre nouveau mot de passe a été enregistré avec succès. Vous pouvez maintenant vous connecter à votre espace pédagogique.
        </p>
        <Link href="/" className="w-full block py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition duration-150 shadow-md">
          Aller à la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <p className="text-xs text-[#53665A] leading-relaxed">
        Votre identité a été validée. Choisissez un nouveau mot de passe fort pour finaliser la sécurisation de votre compte.
      </p>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-stone-600">Nouveau mot de passe</label>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3.5 pr-12 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 text-stone-800 transition duration-150"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-700 p-1 bg-transparent border-none cursor-pointer flex items-center justify-center transition-colors rounded-md"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8a10.64 10.64 0 0 0 20 0" /><path d="m5 13-1.5 2" /><path d="m20 13 1.5 2" /><path d="m9 16-1 2.5" /><path d="m15 16 1 2.5" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-stone-600">Confirmez le mot de passe</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 text-stone-800 transition duration-150"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full mt-2 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition duration-150 text-sm cursor-pointer"
      >
        Réinitialiser le mot de passe
      </button>
    </form>
  );
}