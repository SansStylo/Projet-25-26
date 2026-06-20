"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from "@/app/components/LogoutButton";
import { ProfilButton } from "@/app/components/ProfilButton";
import { getUserNotifications, deleteNotificationAction, getCurrentUserId } from '@/app/actions';

// Définition de la structure l'utilisateur attendu
interface UserProps {
  firstname: string;
  surname: string;
  theme: string;
}

interface AlertType {
  id: string;        
  type: string;
  text: string;
  returns: string | null;
}

export default function AdminClientLayout({ children, user }: { children: React.ReactNode; user: UserProps; }) {
  const pathname = usePathname();
  const [isHovered, setHovered] = useState(false);
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // On force l'état à accepter notre tableau d'Alertes (vide par défaut)
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
  if (user.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", user.theme);
  }, [user.theme]);

  // fermeture de la sidebar sur téléphone quand on arrive sur le site
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setSidebarReduced(true);
        }
      };
      // Vérification initiale
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
  // On charge les vraies notifs de la BDD au montage du composant
  useEffect(() => {
    async function initSessionAndNotifs() {
      // Demande au serveur "Qui est connecté avec ce cookie ?"
      const userId = await getCurrentUserId();
      
      if (userId) {
        setCurrentUserId(userId); // On stocke l'ID réel
        
        // On va chercher ses notifications spécifiques
        const data = await getUserNotifications(userId);
        setAlerts(data);
      }
    }
    initSessionAndNotifs();
  }, []);

  // On change le type de l'id ici en "string"
  const deleteAlert = async (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    await deleteNotificationAction(id);
  };


  const initiales = `${user.firstname[0] || ''}${user.surname[0] || ''}`.toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#F4F7F5] dark:bg-[#050A08] text-[#1E2E24] dark:text-emerald-50 font-sans antialiased transition-colors duration-300">
      <aside
        className={`bg-[#12261E] dark:bg-[#0A120F] text-white flex flex-col py-5 transition-all duration-300 ease-in-out overflow-x-hidden shrink-0 select-none ${
          ((!isSidebarReduced) || isHovered) ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>

        {/* en-tête sidebar */}
        <div className={`flex items-center gap-4 px-6 pb-7 mb-5 border-b border-white/10 dark:border-emerald-900/30 h-[54px] ${
          (isSidebarReduced && (!isHovered)) ? 'justify-center px-0! pb-7' : 'justify-start'
        }`}>
          <button
            onClick={() => setSidebarReduced(!isSidebarReduced)}
            className="text-[#A3B8AC] hover:text-[#0F5E3D] dark:hover:text-emerald-400 transition-colors duration-300 p-0 bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0 w-6 h-6"
            style={{color: 'white'}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {((!isSidebarReduced) || isHovered) && (
            <div className="text-2xl font-bold whitespace-nowrap animate-fadeIn">Junia'lytics</div>
          )}
        </div>

        {/* liens de navigation */}
        <ul className="list-none p-0 m-0">
          {[
            { name:'Accueil', href: '/admin', icon: (
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            ), extraIcon : <polyline points="9 22 9 12 15 12 15 22"></polyline>},
            { name: 'Classes', href: '/html-js/classes', icon : (
                <>
                    <path d="M2 3h20" />
                    <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                    <path d="m7 21 5-5 5 5" />
                </>
            )},
            {name: 'Matières', href: '/html-js', icon: (
                <>
                    <rect width="8" height="18" x="3" y="3" rx="1"></rect>
                    <path d="M7 3v18"></path>
                    <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"></path>
                </>
            )},
            {name: "Suivi d'activité", href: '/logs', icon: (
                <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </>
            )},
            { name: 'Utilisateurs', href: '/gestion_compte', icon: (
                <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </>
            )}
          ].map((item, index) => {
            const isActive = item.href === '/html-js' 
              ? pathname === '/html-js' 
              : pathname.startsWith(item.href);
            return (
            <li key={index}>
              <Link href={item.href} className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] dark:text-emerald-200/60 font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 dark:hover:bg-emerald-900/30 hover:text-white dark:hover:text-emerald-50 ${
                  isActive ? 'bg-white/5 dark:bg-emerald-900/30 text-white! border-[#10B981]!' : ''
                } ${(isSidebarReduced && (!isHovered)) ? 'justify-center px-0! py-4' :''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    {item.icon}
                    {item.extraIcon}
                  </svg>
                  {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            </li>
            );
          })}
        </ul>

        {/* bas de la sidebar */}
        <div className="mt-auto flex flex-col">
          <Link href="/parametres"
            className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] dark:text-emerald-200/60 font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 dark:hover:bg-emerald-900/30 hover:text-white dark:hover:text-emerald-50 ${
              (isSidebarReduced && (!isHovered)) ? 'justify-center px-0! py-4' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">Paramètres</span>}
          </Link>
          {(!isSidebarReduced || isHovered) && (
            <footer className="px-6 py-4 text-xs text-[#53665A] dark:text-emerald-900">
              <p>Junia'lytics 2026</p>
            </footer>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white dark:bg-[#0B1511] px-10 py-5 flex justify-between items-center border-b border-[#EAEFEA] dark:border-emerald-900/30 shadow-[0_1px_3px_rgba(18,38,30,0.01)] h-[75px] shrink-0 transition-colors duration-300">
          <h1 className="text-xl font-semibold text-[#1E2E24] dark:text-emerald-50">
            Espace Administrateur
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowNotifs(!showNotifs); 
                  setShowProfileMenu(false); 
                }}
                className="relative z-50 w-9 h-9 flex items-center justify-center relative bg-transparent border-none cursor-pointer text-[#53665A] dark:text-emerald-200/70 hover:text-[#0F5E3D] dark:hover:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#F97316] rounded-full border-2 border-white dark:border-[#0B1511]"></span>}
              </button>
              {showNotifs && (
                <div className="absolute top-[130%] right-0 bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-lg shadow-lg w-[280px] z-[1000] overflow-hidden p-2 animate-fadeIn">
                  <div className="text-xs font-bold text-[#1E2E24] dark:text-emerald-100 border-b border-[#EAEFEA] dark:border-emerald-900/30 pb-2 mb-2 px-2 flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="bg-[#E2EAE5] dark:bg-emerald-900 text-[#0F5E3D] dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px]">{alerts.length}</span>
                  </div>
                  
                  {alerts.length === 0 ? (
                    <p className="text-xs text-[#718579] dark:text-emerald-200/50 p-4 italic text-center">Aucune notification</p>
                  ) : (
                    <ul className="list-none p-0 m-0 max-h-[240px] overflow-y-auto space-y-1">
                      {alerts.map((alert) => (
                        <li key={alert.id} className="text-xs p-2 hover:bg-[#F4F7F5] dark:hover:bg-emerald-900/20 rounded-md flex justify-between items-start gap-3 border border-transparent dark:border-emerald-900/20 transition-colors">
                          <div className="flex-1">
                            <span className="font-bold text-[#0F5E3D] dark:text-emerald-400 block text-[10px] uppercase tracking-wider mb-0.5">{alert.type}</span>
                            <span className="text-[#1E2E24] dark:text-emerald-50 font-medium">{alert.text}</span>
                          </div>
                          <button 
                            onClick={() => deleteAlert(alert.id)}
                            className="text-[#718579] dark:text-emerald-200/50 hover:text-red-600 bg-transparent border-none cursor-pointer text-xs p-0 w-4 h-4 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-emerald-900/50"
                            title="Supprimer"
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-[#718579] dark:text-emerald-200/60 font-medium leading-none mb-1">{user?.firstname}</span>
                  <span className="text-sm text-[#1E2E24] dark:text-emerald-50 font-semibold leading-none">{user?.surname}</span>
                </div>
                <div className="w-[38px] h-[38px] rounded-full bg-[#0F5E3D] dark:bg-emerald-800 text-white flex items-center justify-center text-sm font-bold border border-[#E2EAE5] dark:border-emerald-700">
                  {initiales}
                </div>
              </div>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-[999] bg-transparent" onClick={() => setShowProfileMenu(false)}/>
                  <div className="absolute top-[130%] right-0 bg-white dark:bg-[#0E1B16] border border-[#E2EAE5] dark:border-emerald-900/50 rounded-lg shadow-lg w-[180px] z-[1000] overflow-hidden">
                    <ul className="list-none p-0 m-0 divide-y divide-[#EAEFEA] dark:divide-emerald-900/30">
                      <ProfilButton />
                      <LogoutButton />
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div> 
        </header>

        {/* le contenu des pages (page.tsx) s'affiche ici */}
        <div className="flex-1 overflow-y-auto dark:bg-[#050A08] transition-colors duration-300">
          {children}
        </div>
        
      </div>
    </div>
  );
}