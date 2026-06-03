/**
 * app/api/responsable/students/route.ts
 * API pour récupérer les étudiants d'une classe
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            classId: parseInt(classId, 10),
          },
        },
      },
      select: {
        studentId: true,
        firstname: true,
        surname: true,
        email: true,
        grades: {
          select: { value: true },
        },
      },
      orderBy: { surname: 'asc' },
    });

    // Calculer la moyenne globale pour chaque étudiant
    const studentsWithAverage = students.map(student => {
      const grades = student.grades.map(g => g.value).filter(v => v !== null) as number[];
      const average = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
      
      return {
        studentId: student.studentId,
        firstname: student.firstname,
        surname: student.surname,
        email: student.email,
        globalAverage: average,
      };
    });

    return NextResponse.json({ students: studentsWithAverage });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
