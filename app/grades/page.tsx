/**
 * app/grades/page.tsx
 * * Page de gestion des notes
 *
 */

"use client";

import Link from 'next/link';
import { requireAuth } from "@/app/lib/auth";
import { LogoutButton } from "@/app/components/LogoutButton";
import { getDropdownData, getModalData, createAssessment, getAssessmentDetails, updateAssessment, deleteAssessment, getAssessmentStudents, saveGrade } from '@/app/actions';
import React, { useState, useEffect } from 'react';

export default function GradesPage() {
  // États pour l'interactivité des menus et de la sidebar
  const [isSidebarReduced, setSidebarReduced] = useState(false);
  const [isHovered, setHoverState] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alerts, setAlerts] = useState([
    {id: 1, type : "Système", text: "Mise à jour terminée.", date: "Récent"},
    {id: 2, type : "Rapport", text: "Les notes de B3 sont disponibles.", date: "Récent"}
  ]);

  // Nouveaux états pour les menus déroulants
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  const [subjects, setSubjects] = useState<{ subjectId: number; label: string }[]>([]);
  const [allAssessments, setAllAssessments] = useState<{ assessmentId: string; subjectId: number | string; maxGrade: number | string; label: string; [key: string]: unknown }[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // États pour l'ajout de table
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  // Données dynamiques de la BDD pour la modale
  const [dbTeachers, setDbTeachers] = useState<{ id: string; nom: string; prenom: string }[]>([]);
  const [dbGroups, setDbGroups] = useState<{ id: string; label: string }[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulaire
  const [addTableForm, setAddTableForm] = useState({
    userId: "",
    maxGrade: "20",
    weight: "1",
    date: "",
    label: "",
    groupIds: [] as string[]
  });

  // Changement des données
  useEffect(() => {
    async function loadData() {
      const data = await getDropdownData();
      setSubjects(data.subjects);
      setAllAssessments(data.assessments);
      setIsLoadingDB(false);
    }
    loadData();
  }, []);

  // Filtrage des tables
  const filteredAssessments = allAssessments.filter(
      (assessment) => assessment.subjectId.toString() === selectedMatiere
  );


  // Toasts
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "warning" } | null>(null);

  const showToast = (message: string, type: "error" | "success" | "warning" = "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fonction bouton "+"
  const handleAddTableClick = async () => {
    if (selectedMatiere === "") {
      showToast("Veuillez d'abord sélectionner une matière.", "warning");
    } else {
      setEditingTableId(null);

      setAddTableForm({
        userId: "", maxGrade: "20", weight: "1", date: "", label: "", groupIds: []
      });
      setIsModalLoading(true);
      setShowAddModal(true);

      const data = await getModalData(selectedMatiere);
      setDbTeachers(data.teachers);
      setDbGroups(data.groups);
      setIsModalLoading(false);
    }
  };


  // Liste des étudiants
  const [studentsList, setStudentsList] = useState<{id: string, nom: string, prenom: string, note: string, feedback: string}[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  // Charge les étudiants à la sélection d'une table
  useEffect(() => {
    async function loadStudents() {
      if (selectedTable !== "") {
        setIsStudentsLoading(true);
        const data = await getAssessmentStudents(selectedTable);
        setStudentsList(data);
        setIsStudentsLoading(false);
      } else {
        setStudentsList([]);
      }
    }
    loadStudents();
  }, [selectedTable]);

  // État pour gérer l'affichage d'un feedback
  const [overflowingFeedbackId, setOverflowingFeedbackId] = useState<string | null>(null);

  // États pour le bloc Triage et Recherche
  const [alphaSort, setAlphaSort] = useState("A-Z"); // "A-Z" ou "Z-A"
  const [scoreSort, setScoreSort] = useState("0-X"); // "0-X" ou "X-0"
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSortType, setActiveSortType] = useState("alpha");


  // Modale de notation d'un étudiant
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({ studentId: "", name: "", note: "", feedback: "" });

  // Calcul de la note maximale
  const activeAssessment = allAssessments.find(a => a.assessmentId === selectedTable);
  const maxScore = activeAssessment ? activeAssessment.maxGrade : "X";


  // Logique et recherche de tri
  const filteredAndSortedStudents = studentsList
      .filter((student) => {

        if (searchQuery.trim() === "") return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            student.nom.toLowerCase().includes(searchLower) ||
            student.prenom.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {

        if (activeSortType === "alpha") {
          const nameA = a.nom.toLowerCase();
          const nameB = b.nom.toLowerCase();
          if (nameA < nameB) return alphaSort === "A-Z" ? -1 : 1;
          if (nameA > nameB) return alphaSort === "A-Z" ? 1 : -1;
          return 0;
        } else {
          const scoreA = a.note === "--" ? -1 : parseFloat(a.note);
          const scoreB = b.note === "--" ? -1 : parseFloat(b.note);
          if (scoreA < scoreB) return scoreSort === "0-X" ? -1 : 1;
          if (scoreA > scoreB) return scoreSort === "0-X" ? 1 : -1;
          return 0;
        }
      });


  // Calcul des statistiques
  const stats = (() => {

    if (selectedTable === "") {
      return { moyenne: "--", ecartType: "--", mediane: "--" };
    }

    const validGrades = studentsList
        .map(s => s.note === "--" ? NaN : parseFloat(s.note))
        .filter(note => !isNaN(note));

    if (validGrades.length === 0) {
      return { moyenne: "--", ecartType: "--", mediane: "--" };
    }

    // Moyenne
    const total = validGrades.reduce((sum, current) => sum + current, 0);
    const moyenneCalculee = total / validGrades.length;

    // Médiane
    const sortedGrades = [...validGrades].sort((a, b) => a - b);
    const mid = Math.floor(sortedGrades.length / 2);
    const medianeCalculee = sortedGrades.length % 2 !== 0
        ? sortedGrades[mid]
        : (sortedGrades[mid - 1] + sortedGrades[mid]) / 2;

    // Écart-Type
    const variance = validGrades.reduce((sum, current) => sum + Math.pow(current - moyenneCalculee, 2), 0) / validGrades.length;
    const ecartTypeCalcule = Math.sqrt(variance);

    // Arrondies décimales
    return {
      moyenne: moyenneCalculee.toFixed(1),
      mediane: medianeCalculee.toFixed(1),
      ecartType: ecartTypeCalcule.toFixed(2)
    };
  })();

// Ajout table de notation

  const filteredGroups = dbGroups.filter(g =>
      g.label.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const handleGroupToggle = (groupId: string) => {
    setAddTableForm((prev) => {
      const isSelected = prev.groupIds.includes(groupId);
      return {
        ...prev,
        groupIds: isSelected
            ? prev.groupIds.filter(id => id !== groupId)
            : [...prev.groupIds, groupId]
      };
    });
  };

  const handleSaveAssessment = async () => {
    if (!addTableForm.userId || !addTableForm.date || !addTableForm.label) {
      showToast("Veuillez remplir le professeur, la date et le nom de l'évaluation.", "warning");
      return;
    }

    setIsSaving(true);

    const payload = {
      subjectId: selectedMatiere,
      userId: addTableForm.userId,
      maxGrade: parseInt(addTableForm.maxGrade, 10),
      weight: parseFloat(addTableForm.weight),
      date: addTableForm.date,
      label: addTableForm.label,
      groupIds: addTableForm.groupIds
    };

    let result;
    if (editingTableId) {
      result = await updateAssessment(editingTableId, payload);
    } else {
      result = await createAssessment(payload);
    }

    setIsSaving(false);

    if (result.success) {
      showToast("Table de notation enregistrée avec succès.", "success");
      setShowAddModal(false);

      const refreshData = await getDropdownData();
      setAllAssessments(refreshData.assessments);


      if (editingTableId === selectedTable) {
        setIsStudentsLoading(true);
        const data = await getAssessmentStudents(selectedTable);
        setStudentsList(data);
        setIsStudentsLoading(false);
      }

      if (!editingTableId && 'assessmentId' in result && result.assessmentId) {
        setSelectedTable(result.assessmentId as string);
      }

    } else {
      showToast(result.error || "Une erreur est survenue.", "error");
    }
  };

  // Ouverture de la modale d'édition
  const handleEditTableClick = async () => {
    setIsModalLoading(true);
    setEditingTableId(selectedTable);
    setShowAddModal(true);

    const data = await getModalData(selectedMatiere);
    setDbTeachers(data.teachers);
    setDbGroups(data.groups);

    const details = await getAssessmentDetails(selectedTable);
    if (details) setAddTableForm(details);

    setIsModalLoading(false);
  };


  // Ouverture de la modale de suppression
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Suppression de la table
  const handleConfirmDelete = async () => {
    setIsSaving(true);
    const result = await deleteAssessment(selectedTable);
    setIsSaving(false);

    if (result.success) {
      showToast("Évaluation supprimée.", "success");
      setShowDeleteModal(false);
      setSelectedTable("");
      const refreshData = await getDropdownData();
      setAllAssessments(refreshData.assessments);
    } else {
      showToast(result.error || "Une erreur est survenue.", "error");
    }
  };


  // Ouverture de la modale de notation
  const handleOpenGradeModal = (student: {id: string, nom: string, prenom: string, note: string, feedback: string}) => {
    setGradeForm({
      studentId: student.id,
      name: `${student.prenom} ${student.nom}`,
      note: student.note === "--" ? "" : student.note,
      feedback: student.feedback || ""
    });
    setShowGradeModal(true);
  };

  // Sauvegarde de la note
  const handleSaveGrade = async () => {

    // Vérification des données
    if (gradeForm.note === "") {
      showToast("Veuillez saisir une note.", "warning");
      return;
    }
    const numericGrade = parseFloat(gradeForm.note.replace(',', '.'));
    const currentMaxScore = maxScore !== "--" ? parseFloat(String(maxScore)) : 20;

    if (numericGrade < 0 || numericGrade > currentMaxScore) {
      showToast(`La note doit être comprise entre 0 et ${currentMaxScore}.`, "error");
      return;
    }

    setIsSaving(true);

    // Envoi au serveur
    const result = await saveGrade(selectedTable, gradeForm.studentId, numericGrade, gradeForm.feedback);
    setIsSaving(false);

    if (result.success) {
      showToast("Note enregistrée.", "success");
      setShowGradeModal(false);
      setIsStudentsLoading(true);
      const data = await getAssessmentStudents(selectedTable);
      setStudentsList(data);
      setIsStudentsLoading(false);
    } else {
      showToast(result.error || "Une erreur est survenue.", "error");
    }
  };

  return (
      <div className="flex min-h-screen bg-[#F4F7F5] text-[#1E2E24] font-sans antialiased relative">

        {/* sidebar */}
        <aside
            className={`bg-[#12261E] text-white flex flex-col py-5 transition-all duration-300 ease-in-out overflow-x-hidden shrink-0 select-none ${
                ((!isSidebarReduced) || isHovered) ? 'w-64' : 'w-20'
            }`}
            onMouseEnter={() => setHoverState(true)}
            onMouseLeave={() => setHoverState(false)}
        >

          {/* en-tête sidebar */}
          <div className={`flex items-center gap-4 px-6 pb-7 mb-5 border-b border-white/10 h-[54px] ${
              (isSidebarReduced && (!isHovered)) ? 'justify-center px-0! pb-7' : 'justify-start'
          }`}>
            <button
                onClick={() => setSidebarReduced(!isSidebarReduced)}
                className="text-[#A3B8AC] hover:text-[#0F5E3D] transition-colors duration-300 p-0 bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0 w-6 h-6"
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

          {/* liens de navigation A MODIFIER */}
          <ul className="list-none p-0 m-0">
            {[
              { name:'Accueil', href: 'page.tsx', icon: (
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                ), extraIcon : <polyline points="9 22 9 12 15 12 15 22"></polyline>},
              { name: 'Étudiants', href: '/dashboard/etudiants', icon: (
                    <>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </>
                )},
              { name: 'Saisie des notes', href: 'notes.tsx', active: true, icon : (
                    <>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </>
                )},
              {name: 'Rapports', href: 'rapports.tsx', icon: (
                    <>
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </>
                )}
            ].map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${
                      item.active ? 'bg-white/5 text-white! border-[#10B981]!' : ''
                  } ${(isSidebarReduced && (!isHovered)) ? 'justify-center px-0! py-4' :''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      {item.icon}
                      {item.extraIcon}
                    </svg>
                    {(!isSidebarReduced || isHovered) && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                </li>
            ))}
          </ul>

          {/* bas de la sidebar */}
          <div className="mt-auto flex flex-col">
            <Link href="parametres.tsx"
                  className={`flex items-center gap-3 px-6 py-4 text-[#A3B8AC] font-medium transition-all duration-300 border-l-4 border-transparent hover:bg-white/5 hover:text-white ${
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
                <footer className="px-6 py-4 text-xs text-[#53665A]">
                  <p>Junia'lytics 2026</p>
                </footer>
            )}
          </div>
        </aside>

        {/* grand conteneur à droite */}
        <div className="flex-1 flex flex-col">

          {/* header */}
          <header className="bg-white px-10 py-5 flex justify-between items-center border-b border-[#EAEFEA] shadow-[0_1px_3px_rgba(18,38,30,0.01)] h-[75px]">
            <h1 className="text-xl font-semibold text-[#1E2E24]">Gestion des notes</h1>

            {/* conteneur cloche + profil */}
            <div className="flex items-center gap-6">

              {/* cloche de notifs */}
              <div className="relative flex items-center justify-center">
                <button
                    onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); }}
                    className="w-9 h-9 flex items-center justify-center relative bg-transparent border-none cursor-pointer text-[#53665A] hover:text-[#0F5E3D] transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {/* Pastille d'Alerte sur la cloche */}
                  {alerts.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#F97316] rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Menu déroulant des notifs */}
                {showNotifs && (
                    <div className="absolute top-[140%] right-0 w-72 bg-white border border-stone-200/80 rounded-xl shadow-[0_10px_30px_rgba(18,38,30,0.05),0_1px_3px_rgba(0,0,0,0.02)] z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#E2EAE5] bg-[#F4F7F5] rounded-t-lg flex justify-between items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#1E2E24]">Notifications</h3>

                        {alerts.length > 0 && (
                            <button onClick={() => setAlerts([])}
                                    className="px-3 py-1.5 border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer bg-white">
                              Tout supprimer
                            </button>
                        )}
                      </div>

                      <ul className="list-none p-0 m-0">
                        {alerts.length > 0 ? (
                            alerts.map((alert) => (
                                <li key={alert.id} className="px-4 py-3 text-sm text-[#53665A] border-b border-[#EAEFEA] hover:bg-[#EAEFEA] cursor-pointer">
                                  <strong className="text-[#1E2E24]">{alert.type}</strong> : {alert.text}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-sm text-[#53665A] text-center italic">
                              Aucune notification.
                            </li>
                        )}
                      </ul>
                    </div>
                )}
              </div>

              {/* Profil utilisateur */}
              <div className="relative">
                <div className="flex items-center gap-3 cursor-pointer select-none"
                     onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-[#718579] font-medium leading-none mb-1">Admin</span>
                    <span className="text-sm text-[#1E2E24] font-semibold leading-none">Pédagogique</span>
                  </div>
                  <div className="w-[38px] h-[38px] relative shrink-0">
                    <div className="w-full h-full rounded-full bg-[#0F5E3D] text-white flex items-center justify-center text-sm font-bold border border-[#E2EAE5]">
                      AP
                    </div>
                  </div>
                </div>

                {showProfileMenu && (
                    <div className="absolute top-[130%] right-0 bg-white border border-[#E2EAE5] rounded-lg shadow-[0_10px_25px_-5px_rgba(18,38,30,0.05)] w-[180px] z-[1000] overflow-hidden">
                      <ul className="list-none p-0 m-0 divide-y divide-[#EAEFEA]">
                        <LogoutButton />
                        <li>
                          <Link
                              href="/parametres"
                              className="flex items-center gap-2.5 px-4 py-3 text-[#3B4B40] hover:bg-[#F4F7F5] font-medium text-sm transition-colors"
                          >
                            <svg
                                xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Changer de compte
                          </Link>
                        </li>
                      </ul>
                    </div>
                )}
              </div>
            </div>
          </header>

          {/* Conteneur principal de la page */}
          <main className="p-10 flex-1 flex flex-col gap-8">
            <div className="flex flex-col xl:flex-row gap-8 items-start w-full shrink-0">

              {/* Critère de notation */}
              <section className="flex-1 w-full bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5]">
                <h2 className="text-xl font-bold mb-6 text-[#0F5E3D]">
                  Critères de notation
                </h2>

                <div className="flex flex-col sm:flex-row items-end gap-6">

                  {/* Menu : Matière */}
                  <div className="flex-1 w-full">
                    <label htmlFor="matiere" className="block text-sm font-semibold text-[#1E2E24] mb-2">
                      Matière
                    </label>
                    <select
                        id="matiere"
                        value={selectedMatiere}
                        onChange={(e) => {
                          setSelectedMatiere(e.target.value);
                          setSelectedTable("");
                        }}
                        disabled={isLoadingDB}
                        className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {isLoadingDB ? "Chargement des matières..." : "Sélectionner une matière..."}
                      </option>

                      {subjects.map((subject) => (
                          <option key={subject.subjectId} value={subject.subjectId}>
                            {subject.label}
                          </option>
                      ))}
                    </select>
                  </div>

                  {/* Menu : Table de note */}
                  <div className="flex-1 w-full">
                    <label htmlFor="table-note" className="block text-sm font-semibold text-[#1E2E24] mb-2">
                      Table de note
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                          id="table-note"
                          value={selectedTable}
                          onChange={(e) => setSelectedTable(e.target.value)}
                          disabled={selectedMatiere === "" || isLoadingDB}
                          className={`w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors ${
                              selectedMatiere === "" ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                      >
                        <option value="">
                          {selectedMatiere === ""
                              ? "Sélectionnez d'abord une matière..."
                              : filteredAssessments.length === 0
                                  ? "Aucune table pour cette matière"
                                  : "Sélectionner une table..."}
                        </option>

                        {filteredAssessments.map((assessment) => (
                            <option key={assessment.assessmentId} value={assessment.assessmentId}>
                              {assessment.label} (sur {assessment.maxGrade})
                            </option>
                        ))}
                      </select>

                      {/* Bouton de création */}
                      <button
                          onClick={handleAddTableClick}
                          title="Créer une nouvelle table de note"
                          className="shrink-0 w-[46px] h-[46px] flex items-center justify-center bg-[#F4F7F5] text-[#0F5E3D] border border-[#E2EAE5] rounded-xl hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all duration-300 shadow-sm focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vue d'ensemble */}
              <section className="w-full xl:w-[400px] shrink-0 bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] flex flex-col justify-center">
                <h2 className="text-xl font-bold mb-6 text-[#0F5E3D]">
                  Vue d'ensemble
                </h2>

                <div className="flex items-center justify-between bg-[#F4F7F5] rounded-xl border border-[#E2EAE5] py-[13px] px-2 h-[74px]">

                  {/* Moyenne */}
                  <div className="flex flex-col items-center justify-center flex-1 border-r border-[#E2EAE5]">
                    <span className="text-[10px] text-[#718579] font-bold uppercase tracking-wider mb-1">Moyenne</span>
                    <span className="text-2xl font-bold text-[#1E2E24]">{stats.moyenne}</span>
                  </div>

                  {/* Écart-Type */}
                  <div className="flex flex-col items-center justify-center flex-1 border-r border-[#E2EAE5]">
                    <span className="text-[10px] text-[#718579] font-bold uppercase tracking-wider mb-1">Écart-Type</span>
                    <span className="text-2xl font-bold text-[#1E2E24]">{stats.ecartType}</span>
                  </div>

                  {/* Médiane */}
                  <div className="flex flex-col items-center justify-center flex-1">
                    <span className="text-[10px] text-[#718579] font-bold uppercase tracking-wider mb-1">Médiane</span>
                    <span className="text-2xl font-bold text-[#1E2E24]">{stats.mediane}</span>
                  </div>

                </div>
              </section>

            </div>

            {/* Tableau des étudiants */}
            <div className="flex flex-col xl:flex-row gap-8 items-start w-full shrink-0">
              <section className="flex-1 w-full bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] flex flex-col">
                <h2 className="text-xl font-bold mb-6 text-[#0F5E3D]">
                  Liste des étudiants
                </h2>

                {selectedTable === "" ? (

                    // État vide
                    <div className="w-full flex items-center justify-center bg-[#F4F7F5] rounded-xl border-2 border-dashed border-[#A3B8AC] min-h-[236px]">
                      <p className="text-[#53665A] font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A3B8AC]">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Veuillez d'abord sélectionner une table de notation.
                      </p>
                    </div>

                ) : isStudentsLoading ? (
                    // État de récupération
                    <div className="w-full flex flex-col items-center justify-center bg-[#F4F7F5] rounded-xl border border-[#E2EAE5] min-h-[236px]">
                      <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-[#53665A] font-medium">Récupération des étudiants...</p>
                    </div>
                ) : (

                    // État non vide
                    <div className="w-full overflow-hidden border border-[#E2EAE5] rounded-xl">
                      <div className="max-h-[400px] xl:max-h-[500px] overflow-y-auto overscroll-none bg-white">
                        <table className="w-full text-left border-separate border-spacing-0">

                          {/* En-tête du tableau */}
                          <thead>
                          <tr className="text-xs uppercase tracking-wider text-[#718579]">
                            <th className="sticky top-0 z-20 bg-[#F4F7F5] py-4 px-6 font-bold w-[20%] border-b border-[#E2EAE5] shadow-[0_1px_0_#E2EAE5]">Nom</th>
                            <th className="sticky top-0 z-20 bg-[#F4F7F5] py-4 px-6 font-bold w-[20%] border-b border-[#E2EAE5] shadow-[0_1px_0_#E2EAE5]">Prénom</th>
                            <th className="sticky top-0 z-20 bg-[#F4F7F5] py-4 px-6 font-bold text-center w-[15%] border-b border-[#E2EAE5] shadow-[0_1px_0_#E2EAE5]">Note</th>
                            <th className="sticky top-0 z-20 bg-[#F4F7F5] py-4 px-6 font-bold w-[35%] border-b border-[#E2EAE5] shadow-[0_1px_0_#E2EAE5]">Feedback</th>
                            <th className="sticky top-0 z-20 bg-[#F4F7F5] py-4 px-6 font-bold text-center w-[10%] border-b border-[#E2EAE5] shadow-[0_1px_0_#E2EAE5]">Éditer</th>
                          </tr>
                          </thead>

                          {/* Corps du tableau */}
                          <tbody className="divide-y divide-[#EAEFEA]">
                          {filteredAndSortedStudents.map((student, index) => {
                            const showTooltipDownward = index < 2;

                            return (
                                <tr key={student.id} className="hover:bg-[#F9FAFA] transition-colors group">
                                  <td className="py-4 px-6 font-semibold text-[#1E2E24]">{student.nom}</td>
                                  <td className="py-4 px-6 text-[#53665A]">{student.prenom}</td>
                                  <td className="py-4 px-6 text-center">
                                    {student.note === "--" ? (
                                        <span className="text-[#A3B8AC] font-medium">--</span>
                                    ) : (
                                        (() => {
                                          const note = parseFloat(student.note);
                                          const classAverage = parseFloat(stats.moyenne);
                                          const max = parseFloat(maxScore as string);

                                          // Gestion des couleurs de la note
                                          // Vert
                                          let bgColor = "bg-[#E6F4EE]";
                                          let textColor = "text-[#0F5E3D]";

                                          if (!isNaN(note) && !isNaN(max)) {
                                            const globalAverage = max / 2;

                                            // Rouge
                                            if (note < globalAverage) {
                                              bgColor = "bg-red-50";
                                              textColor = "text-red-500";
                                            // Orange
                                            } else if (!isNaN(classAverage) && note < classAverage) {
                                              bgColor = "bg-[#F97316]/10";
                                              textColor = "text-[#F97316]";
                                            }
                                          }

                                          return (
                                              <span className={`inline-flex items-center justify-center font-bold py-1 px-3 rounded-lg ${bgColor} ${textColor}`}>
                                              {student.note}
                                            </span>
                                          );
                                        })()
                                    )}
                                  </td>

                                  {/* Feedback  */}
                                  <td className="py-4 px-6 relative">
                                    {student.feedback ? (
                                        <>
                                          <div
                                              className={`max-w-[200px] xl:max-w-[350px] truncate text-sm text-[#53665A] ${
                                                  overflowingFeedbackId === student.id ? 'cursor-zoom-in' : 'cursor-default'
                                              }`}
                                              onMouseEnter={(e) => {
                                                if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
                                                  setOverflowingFeedbackId(student.id);
                                                }
                                              }}
                                              onMouseLeave={() => setOverflowingFeedbackId(null)}
                                          >
                                            {student.feedback}
                                          </div>

                                          {/* Bulle de feedback */}
                                          {overflowingFeedbackId === student.id && (
                                              <div className={`absolute left-6 z-[9999] w-max max-w-[250px] sm:max-w-[350px] p-3 bg-[#1E2E24] text-[#F4F7F5] text-xs font-medium rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.2)] whitespace-normal break-words pointer-events-none ${
                                                  showTooltipDownward ? 'top-full mt-2' : 'bottom-full mb-2'
                                              }`}>
                                                {student.feedback}
                                                <div className={`absolute left-6 w-3 h-3 bg-[#1E2E24] rotate-45 ${
                                                    showTooltipDownward ? 'bottom-full -mb-1.5' : 'top-full -mt-1.5'
                                                }`}></div>
                                              </div>
                                          )}
                                        </>
                                    ) : (
                                        <span className="text-sm text-[#A3B8AC] italic">Aucun feedback</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenGradeModal(student)}
                                        title="Modifier la note de cet étudiant"
                                        className="text-[#A3B8AC] hover:text-[#10B981] hover:bg-[#E6F4EE] transition-all p-2 rounded-lg cursor-pointer flex mx-auto">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                            );
                          })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                )}
              </section>

              {/* Triage */}
              <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-8">
                <section className="w-full shrink-0 bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] flex flex-col min-h-[349px] xl:h-[349px]">
                  <h2 className="text-xl font-bold mb-10 text-[#0F5E3D] shrink-0">
                    Trier
                  </h2>
                  <div className="flex flex-col flex-1 gap-9">

                    {/* Boutons */}
                    <div className="flex items-center gap-4">
                      {/* Alphabétique */}
                      <button
                          type="button"
                          onClick={() => {
                            setAlphaSort(alphaSort === "A-Z" ? "Z-A" : "A-Z");
                            setActiveSortType("alpha");
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 border font-bold py-3 px-4 rounded-xl hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all duration-300 group ${
                              activeSortType === "alpha"
                                  ? "bg-[#E6F4EE] border-[#10B981] text-[#0F5E3D]"
                                  : "bg-[#F4F7F5] border-[#E2EAE5] text-[#1E2E24]"
                          }`}
                      >
                        <span>{alphaSort}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-300 ${alphaSort === "Z-A" ? "rotate-180" : ""}`}
                        >
                          <path d="M12 5v14"></path>
                          <path d="m19 12-7 7-7-7"></path>
                        </svg>
                      </button>

                      {/* Numérique (Note) */}
                      <button
                          type="button"
                          onClick={() => {
                            setScoreSort(scoreSort === "0-X" ? "X-0" : "0-X");
                            setActiveSortType("score");
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 border font-bold py-3 px-4 rounded-xl hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all duration-300 group ${
                              activeSortType === "score"
                                  ? "bg-[#E6F4EE] border-[#10B981] text-[#0F5E3D]"
                                  : "bg-[#F4F7F5] border-[#E2EAE5] text-[#1E2E24]"
                          }`}
                      >
                        <span>{scoreSort === "0-X" ? `0 - ${maxScore}` : `${maxScore} - 0`}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-300 ${scoreSort === "X-0" ? "rotate-180" : ""}`}
                        >
                          <path d="M12 5v14"></path>
                          <path d="m19 12-7 7-7-7"></path>
                        </svg>
                      </button>

                    </div>

                    {/* Recherche */}
                    <hr className="border-[#EAEFEA] w-full" />
                    <div>
                      <label htmlFor="search" className="block text-sm font-semibold text-[#1E2E24] mb-3">
                        Rechercher un étudiant
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A3B8AC]">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </div>
                        <input
                            id="search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nom ou prénom..."
                            className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors placeholder:text-[#A3B8AC]"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Gestion de la table */}
                {selectedTable !== "" && (
                    <section className="w-full shrink-0 bg-white p-[30px] rounded-2xl shadow-[0_4px_20px_rgba(18,38,30,0.02),0_10px_30px_rgba(18,38,30,0.03)] border border-[#E2EAE5] flex flex-col animate-fadeIn">
                      <h2 className="text-xl font-bold mb-6 text-[#0F5E3D]">
                        Gestion de la table
                      </h2>

                      {/* Import / Export */}
                      <div className="flex items-center gap-4 mb-5">
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] font-bold py-3 px-4 rounded-xl hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all duration-300 group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <span className="text-sm">Import CSV</span>
                        </button>

                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] font-bold py-3 px-4 rounded-xl hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all duration-300 group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          <span className="text-sm">Export CSV</span>
                        </button>
                      </div>

                      {/* Paramètres de la table */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#EAEFEA]">
                      <span className="text-xs text-[#A3B8AC] font-medium uppercase tracking-wider">
                        Modification
                      </span>

                        <div className="flex items-center gap-1">
                          <button
                              type="button"
                              onClick={handleEditTableClick}
                              title="Modifier les propriétés de la table"
                              className="p-2.5 text-[#A3B8AC] hover:text-[#10B981] hover:bg-[#E6F4EE] rounded-lg transition-all duration-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          <button
                              type="button"
                              onClick={handleOpenDeleteModal}
                              title="Supprimer la table"
                              className="p-2.5 text-[#A3B8AC] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                    </section>
                )}

              </div>

            </div>




          </main>
        </div>


          {/* Modale : Création d'une table de notation */}
          {showAddModal && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-[#12261E]/40 backdrop-blur-sm transition-opacity cursor-pointer"
                    onClick={() => setShowAddModal(false)}
                ></div>

                <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-2xl relative z-10 animate-fadeIn flex flex-col overflow-hidden">

                  <div className="px-6 py-5 border-b border-[#E2EAE5] flex justify-between items-center bg-[#F4F7F5]">
                    <h3 className="text-lg font-bold text-[#0F5E3D] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {editingTableId ? "Modifier l'évaluation" : "Nouvelle table de notation"}
                    </h3>
                    <button
                        onClick={() => setShowAddModal(false)}
                        className="text-[#A3B8AC] hover:text-[#F97316] transition-colors p-1 bg-white rounded-md shadow-sm border border-[#E2EAE5]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>

                  <div className="p-6 flex flex-col gap-6 relative">

                    {isModalLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-b-2xl">
                          <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-[#53665A] font-medium text-sm">Chargement des données...</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[#1E2E24] mb-2">Matière</label>
                        <select disabled className="w-full bg-[#EAEFEA] border border-[#E2EAE5] text-[#718579] text-sm rounded-xl px-4 py-2.5 cursor-not-allowed font-medium">
                          <option>{subjects.find(s => s.subjectId.toString() === selectedMatiere)?.label || "Matière inconnue"}</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label htmlFor="teacher" className="block text-sm font-semibold text-[#1E2E24] mb-2">Professeur</label>
                        <select
                            id="teacher"
                            value={addTableForm.userId}
                            onChange={(e) => setAddTableForm({...addTableForm, userId: e.target.value})}
                            className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors cursor-pointer"
                        >
                          <option value="">Sélectionner un professeur...</option>
                          {dbTeachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>{teacher.prenom} {teacher.nom}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-1/3">
                        <label htmlFor="maxGrade" className="block text-sm font-semibold text-[#1E2E24] mb-2">Noté sur</label>
                        <input
                            id="maxGrade" type="number" min="1"
                            value={addTableForm.maxGrade}
                            onChange={(e) => setAddTableForm({...addTableForm, maxGrade: e.target.value})}
                            className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors"
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label htmlFor="weight" className="block text-sm font-semibold text-[#1E2E24] mb-2">Coefficient</label>
                        <input
                            id="weight" type="number" min="1"
                            value={addTableForm.weight}
                            onChange={(e) => setAddTableForm({...addTableForm, weight: e.target.value})}
                            className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors"
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label htmlFor="date" className="block text-sm font-semibold text-[#1E2E24] mb-2">Date</label>
                        <input
                            id="date" type="date"
                            value={addTableForm.date}
                            onChange={(e) => setAddTableForm({...addTableForm, date: e.target.value})}
                            className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="label" className="block text-sm font-semibold text-[#1E2E24] mb-2">Nom de l'évaluation</label>
                      <input
                          id="label" type="text" placeholder="Ex: Partiel Semestre 1, Contrôle Continu..."
                          value={addTableForm.label}
                          onChange={(e) => setAddTableForm({...addTableForm, label: e.target.value})}
                          className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors"
                      />
                    </div>

                    {/* Groupes */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1E2E24] mb-3">Groupes évalués</label>
                      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F4F7F5] border border-[#E2EAE5] rounded-xl min-h-[52px]">
                        {addTableForm.groupIds.map((id) => {
                          const group = dbGroups.find(g => g.id === id);
                          if (!group) return null;
                          return (
                              <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F4EE] text-[#0F5E3D] text-sm font-medium rounded-lg border border-[#10B981]/30 transition-all group">
                          {group.label}
                                <button type="button" onClick={() => handleGroupToggle(id)} title="Retirer ce groupe" className="text-[#0F5E3D]/40 hover:text-red-500 hover:bg-red-100 rounded-full p-0.5 transition-colors focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </span>
                          );
                        })}
                        <button type="button" onClick={() => setShowGroupSelector(true)} title="Ajouter un groupe" className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-[#A3B8AC] text-[#A3B8AC] hover:text-[#10B981] hover:border-[#10B981] hover:bg-white transition-all focus:outline-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        {addTableForm.groupIds.length === 0 && <span className="text-sm text-[#A3B8AC] italic ml-1 select-none pointer-events-none">Aucun groupe sélectionné...</span>}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 border-t border-[#E2EAE5] flex justify-end gap-3 bg-[#F4F7F5]/50">
                    <button
                        type="button" onClick={() => setShowAddModal(false)}
                        className="px-5 py-2.5 text-sm font-bold text-[#53665A] bg-white border border-[#E2EAE5] hover:bg-[#EAEFEA] hover:text-[#1E2E24] rounded-xl transition-colors shadow-sm"
                    >
                      Annuler
                    </button>
                    <button
                        type="button" onClick={handleSaveAssessment} disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-[#10B981] hover:bg-[#0EA5E9] shadow-md shadow-[#10B981]/20 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Modale : Sélection de groupes */}
          {showGroupSelector && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[#12261E]/20 backdrop-blur-sm" onClick={() => setShowGroupSelector(false)}></div>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 animate-fadeIn flex flex-col overflow-hidden border border-[#E2EAE5]">
                  <div className="px-5 py-4 border-b border-[#E2EAE5] bg-[#F4F7F5] flex justify-between items-center">
                    <h4 className="font-bold text-[#1E2E24] text-sm">Ajouter des groupes</h4>
                    <button onClick={() => setShowGroupSelector(false)} className="text-[#A3B8AC] hover:text-[#F97316] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <div className="p-3 border-b border-[#EAEFEA]">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A3B8AC]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      </div>
                      <input
                          type="text" value={groupSearchQuery} onChange={(e) => setGroupSearchQuery(e.target.value)}
                          placeholder="Rechercher un groupe..."
                          className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-2">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
                            <label key={group.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${addTableForm.groupIds.includes(group.id) ? 'bg-[#E6F4EE]/50' : 'hover:bg-[#F4F7F5]'}`}>
                              <input
                                  type="checkbox" className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                                  checked={addTableForm.groupIds.includes(group.id)} onChange={() => handleGroupToggle(group.id)}
                              />
                              <span className={`text-sm ${addTableForm.groupIds.includes(group.id) ? 'text-[#0F5E3D] font-semibold' : 'text-[#53665A]'}`}>
                        {group.label}
                      </span>
                            </label>
                        ))
                    ) : (
                        <div className="text-center py-6 text-sm text-[#A3B8AC] italic">Aucun groupe trouvé.</div>
                    )}
                  </div>
                  <div className="p-4 border-t border-[#E2EAE5] bg-[#F4F7F5]/50 flex justify-end">
                    <button type="button" onClick={() => { setShowGroupSelector(false); setGroupSearchQuery(""); }} className="px-5 py-2 bg-[#10B981] text-white text-sm font-bold rounded-lg hover:bg-[#0EA5E9] shadow-md shadow-[#10B981]/20 transition-all">
                      Valider
                    </button>
                  </div>
                </div>
              </div>
          )}

        {/* Modale : Saisie de note */}
        {showGradeModal && (
            <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#12261E]/40 backdrop-blur-sm" onClick={() => setShowGradeModal(false)}></div>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fadeIn flex flex-col overflow-hidden border border-[#E2EAE5]">

                <div className="px-6 py-4 border-b border-[#E2EAE5] bg-[#F4F7F5] flex justify-between items-center">
                  <h4 className="font-bold text-[#1E2E24]">Noter {gradeForm.name}</h4>
                  <button onClick={() => setShowGradeModal(false)} className="text-[#A3B8AC] hover:text-[#F97316]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E2E24] mb-2">Note (sur {maxScore})</label>
                    <input
                        type="number"
                        min="0"
                        max={maxScore !== "--" ? maxScore : 100}
                        step="any"
                        value={gradeForm.note}
                        onChange={(e) => setGradeForm({...gradeForm, note: e.target.value})}
                        className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#10B981] outline-none"
                        placeholder="Saisir la note..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E2E24] mb-2">Feedback (Optionnel)</label>
                    <textarea
                        rows={3}
                        value={gradeForm.feedback}
                        onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                        className="w-full bg-[#F4F7F5] border border-[#E2EAE5] text-[#1E2E24] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#10B981] outline-none resize-none"
                        placeholder="Ajouter un commentaire ..."
                    ></textarea>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F4F7F5]/50 border-t border-[#E2EAE5] flex justify-end gap-3">
                  <button type="button" onClick={() => setShowGradeModal(false)} className="px-5 py-2 text-sm font-bold text-[#53665A] bg-white border border-[#E2EAE5] hover:bg-[#EAEFEA] rounded-xl">
                    Annuler
                  </button>
                  <button type="button" onClick={handleSaveGrade} disabled={isSaving} className="px-5 py-2 text-sm font-bold text-white bg-[#10B981] hover:bg-[#0EA5E9] shadow-md shadow-[#10B981]/20 rounded-xl disabled:opacity-70">
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>

              </div>
            </div>
        )}

        {/* Modale : Confirmation de suppression de la table */}
        {showDeleteModal && (
            <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
              <div
                  className="absolute inset-0 bg-[#12261E]/40 backdrop-blur-sm transition-opacity"
                  onClick={() => setShowDeleteModal(false)}
              ></div>

              <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md relative z-10 animate-fadeIn flex flex-col overflow-hidden border border-[#E2EAE5]">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#1E2E24]">Supprimer l'évaluation ?</h3>
                    <p className="text-sm text-[#53665A] mt-2 leading-relaxed">
                      Êtes-vous sûr de vouloir supprimer définitivement la table de note <strong className="text-[#1E2E24]">"{allAssessments.find(a => a.assessmentId === selectedTable)?.label}"</strong> ? <br />
                      Cette action détruira définitivement toutes les notes et feedbacks des étudiants liés.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F4F7F5]/50 border-t border-[#E2EAE5] flex items-center justify-stretch gap-3">
                  <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2.5 text-sm font-bold text-[#53665A] bg-white border border-[#E2EAE5] hover:bg-[#EAEFEA] hover:text-[#1E2E24] rounded-xl transition-colors shadow-sm focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-red-500/10 rounded-xl transition-colors focus:outline-none"
                  >
                    {isSaving ? "Suppression..." : "Supprimer"}
                  </button>
                </div>

              </div>
            </div>
        )}

        {/* Toast */}
        {toast && (
            <div className={`fixed bottom-10 right-10 border-l-4 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 z-[20000] animate-fadeIn transition-all bg-white cursor-pointer ${
                toast.type === "error" ? "border-red-500" : toast.type === "success" ? "border-[#10B981]" : "border-[#F97316]"
            }`} onClick={() => setToast(null)}>

              <div className={`p-2 rounded-full ${
                  toast.type === "error" ? "bg-red-50 text-red-500" : toast.type === "success" ? "bg-[#E6F4EE] text-[#10B981]" : "bg-[#F97316]/10 text-[#F97316]"
              }`}>
                {toast.type === "error" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                ) : toast.type === "success" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#1E2E24]">
                  {toast.type === "error" ? "Erreur" : toast.type === "success" ? "Succès" : "Action requise"}
                </h4>
                <p className="text-xs text-[#53665A] mt-0.5">{toast.message}</p>
              </div>
            </div>
        )}
      </div>

  );
}